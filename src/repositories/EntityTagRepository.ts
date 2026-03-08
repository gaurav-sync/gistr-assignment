import mongoose from 'mongoose';
import { EntityTag, IEntityTag } from '../models/EntityTag';
import { EntityType } from '../models/Entity';

export const attachTags = async (
  entityId: mongoose.Types.ObjectId,
  entityType: EntityType,
  tagIds: mongoose.Types.ObjectId[],
  tagNames: string[]
): Promise<void> => {
  const operations = tagIds.map((tagId, index) => ({
    updateOne: {
      filter: { entityId, tagId },
      update: {
        $setOnInsert: {
          entityId,
          entityType,
          tagId,
          tagName: tagNames[index],
        },
      },
      upsert: true,
    },
  }));

  await EntityTag.bulkWrite(operations);
};

export const countTagsByEntity = async (
  entityId: mongoose.Types.ObjectId
): Promise<number> => {
  return EntityTag.countDocuments({ entityId });
};

export const findEntitiesByTags = async (
  tagNames: string[],
  mode: 'and' | 'or',
  entityType?: EntityType,
  page: number = 1,
  limit: number = 20
): Promise<{ entities: mongoose.Types.ObjectId[]; total: number }> => {
  const normalizedTags = tagNames.map((tag) => tag.toLowerCase().trim());
  const skip = (page - 1) * limit;

  const matchStage: Record<string, unknown> = {
    tagName: mode === 'or' ? { $in: normalizedTags } : { $in: normalizedTags },
  };

  if (entityType) {
    matchStage.entityType = entityType;
  }

  const pipeline: mongoose.PipelineStage[] = [
    { $match: matchStage },
    {
      $group: {
        _id: '$entityId',
        entityType: { $first: '$entityType' },
        matchedTags: { $addToSet: '$tagName' },
        tagCount: { $sum: 1 },
      },
    },
  ];

  if (mode === 'and') {
    pipeline.push({
      $match: {
        tagCount: { $gte: normalizedTags.length },
      },
    });
  }

  const countPipeline = [...pipeline, { $count: 'total' }];
  const countResult = await EntityTag.aggregate(countPipeline);
  const total = countResult.length > 0 ? countResult[0].total : 0;

  pipeline.push({ $skip: skip }, { $limit: limit });

  const results = await EntityTag.aggregate(pipeline);
  const entityIds = results.map((r) => r._id);

  return { entities: entityIds, total };
};

export const getTagAnalytics = async (days?: number): Promise<{
  totalUsage: Array<{ tag: string; count: number }>;
  byEntityType: Array<{ tag: string; entityType: string; count: number }>;
  topTags: Array<{ tag: string; count: number }>;
}> => {
  const matchStage: Record<string, unknown> = {};
  
  if (days) {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);
    matchStage.createdAt = { $gte: dateThreshold };
  }

  const totalUsagePipeline: mongoose.PipelineStage[] = [
    ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
    {
      $group: {
        _id: '$tagName',
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        tag: '$_id',
        count: 1,
      },
    },
    { $sort: { count: -1 } },
  ];

  const byEntityTypePipeline: mongoose.PipelineStage[] = [
    ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
    {
      $group: {
        _id: { tag: '$tagName', entityType: '$entityType' },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        tag: '$_id.tag',
        entityType: '$_id.entityType',
        count: 1,
      },
    },
    { $sort: { count: -1 } },
  ];

  const topTagsPipeline: mongoose.PipelineStage[] = [
    ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
    {
      $group: {
        _id: '$tagName',
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        tag: '$_id',
        count: 1,
      },
    },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ];

  const [totalUsage, byEntityType, topTags] = await Promise.all([
    EntityTag.aggregate(totalUsagePipeline),
    EntityTag.aggregate(byEntityTypePipeline),
    EntityTag.aggregate(topTagsPipeline),
  ]);

  return { totalUsage, byEntityType, topTags };
};
