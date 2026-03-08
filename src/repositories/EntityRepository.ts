import mongoose from 'mongoose';
import { Entity, IEntity, EntityType } from '../models/Entity';

export const findById = async (id: mongoose.Types.ObjectId): Promise<IEntity | null> => {
  return Entity.findById(id);
};

export const findByIds = async (ids: mongoose.Types.ObjectId[]): Promise<IEntity[]> => {
  return Entity.find({ _id: { $in: ids } });
};

export const create = async (
  entityType: EntityType,
  title: string,
  content: string,
  metadata: Record<string, unknown> = {}
): Promise<IEntity> => {
  return Entity.create({ entityType, title, content, metadata });
};
