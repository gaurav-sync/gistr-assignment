import mongoose from 'mongoose';
import * as TagRepository from '../repositories/TagRepository';
import * as EntityTagRepository from '../repositories/EntityTagRepository';
import * as EntityRepository from '../repositories/EntityRepository';
import { EntityType } from '../models/Entity';
import { normalizeTags } from '../utils/tagNormalizer';
import { config } from '../config';

export const attachTags = async (
  entityId: string,
  entityType: EntityType,
  tags: string[]
): Promise<{ success: boolean; message: string }> => {
  const entityObjectId = new mongoose.Types.ObjectId(entityId);

  const entity = await EntityRepository.findById(entityObjectId);
  if (!entity) {
    throw new Error('Entity not found');
  }

  if (entity.entityType !== entityType) {
    throw new Error('Entity type mismatch');
  }

  const normalizedTags = normalizeTags(tags);

  if (normalizedTags.length === 0) {
    return { success: true, message: 'No tags to attach' };
  }

  const currentCount = await EntityTagRepository.countTagsByEntity(entityObjectId);
  const newCount = currentCount + normalizedTags.length;

  if (newCount > config.maxTagsPerEntity) {
    throw new Error(
      `Tag limit exceeded. Maximum ${config.maxTagsPerEntity} tags per entity allowed.`
    );
  }

  const tagObjects = await Promise.all(
    normalizedTags.map((tag) => TagRepository.findOrCreate(tag))
  );

  const tagIds = tagObjects.map((tag) => tag._id as mongoose.Types.ObjectId);

  await EntityTagRepository.attachTags(
    entityObjectId,
    entityType,
    tagIds,
    normalizedTags
  );

  return {
    success: true,
    message: 'Tags attached successfully',
  };
};

export const searchEntities = async (
  tags: string[],
  mode: 'and' | 'or',
  entityType?: EntityType,
  page: number = 1,
  limit: number = 20
): Promise<{
  entities: Array<{
    id: string;
    entityType: string;
    title: string;
    content: string;
    metadata: Record<string, unknown>;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> => {
  const normalizedTags = normalizeTags(tags);

  if (normalizedTags.length === 0) {
    return {
      entities: [],
      pagination: { page, limit, total: 0, totalPages: 0 },
    };
  }

  const { entities: entityIds, total } = await EntityTagRepository.findEntitiesByTags(
    normalizedTags,
    mode,
    entityType,
    page,
    limit
  );

  const entities = await EntityRepository.findByIds(entityIds);

  const entitiesWithDetails = entities.map((entity) => ({
    id: entity._id.toString(),
    entityType: entity.entityType,
    title: entity.title,
    content: entity.content,
    metadata: entity.metadata,
  }));

  return {
    entities: entitiesWithDetails,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getAnalytics = async (days?: number): Promise<{
  totalUsage: Array<{ tag: string; count: number }>;
  byEntityType: Array<{ tag: string; entityType: string; count: number }>;
  topTags: Array<{ tag: string; count: number }>;
}> => {
  return EntityTagRepository.getTagAnalytics(days);
};
