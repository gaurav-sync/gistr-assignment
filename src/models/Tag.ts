import mongoose, { Schema, Document } from 'mongoose';

export interface ITag extends Document {
  name: string;
  createdAt: Date;
}

const tagSchema = new Schema<ITag>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

tagSchema.index({ name: 1 });

export const Tag = mongoose.model<ITag>('Tag', tagSchema);
