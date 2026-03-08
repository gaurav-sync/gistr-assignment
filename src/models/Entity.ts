import mongoose, { Schema, Document } from 'mongoose';

export type EntityType = 'source' | 'snippet' | 'airesponse';

export interface IEntity extends Document {
  entityType: EntityType;
  title: string;
  content: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const entitySchema = new Schema<IEntity>(
  {
    entityType: {
      type: String,
      required: true,
      enum: ['source', 'snippet', 'airesponse'],
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

entitySchema.index({ entityType: 1, createdAt: -1 });

export const Entity = mongoose.model<IEntity>('Entity', entitySchema);
