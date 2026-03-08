import mongoose, { Schema, Document } from 'mongoose';
import { EntityType } from './Entity';

export interface IEntityTag extends Document {
  entityId: mongoose.Types.ObjectId;
  entityType: EntityType;
  tagId: mongoose.Types.ObjectId;
  tagName: string;
  createdAt: Date;
}

const entityTagSchema = new Schema<IEntityTag>(
  {
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Entity',
      index: true,
    },
    entityType: {
      type: String,
      required: true,
      enum: ['source', 'snippet', 'airesponse'],
      index: true,
    },
    tagId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Tag',
      index: true,
    },
    tagName: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

entityTagSchema.index({ entityId: 1, tagId: 1 }, { unique: true });
entityTagSchema.index({ tagName: 1, entityType: 1 });
entityTagSchema.index({ tagName: 1, createdAt: -1 });
entityTagSchema.index({ entityType: 1, tagName: 1, entityId: 1 });

export const EntityTag = mongoose.model<IEntityTag>('EntityTag', entityTagSchema);
