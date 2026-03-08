import { Tag, ITag } from '../models/Tag';

export const findOrCreate = async (tagName: string): Promise<ITag> => {
  const normalizedName = tagName.toLowerCase().trim();
  
  let tag = await Tag.findOne({ name: normalizedName });
  
  if (!tag) {
    tag = await Tag.create({ name: normalizedName });
  }
  
  return tag;
};

export const findByNames = async (tagNames: string[]): Promise<ITag[]> => {
  const normalizedNames = tagNames.map((name) => name.toLowerCase().trim());
  return Tag.find({ name: { $in: normalizedNames } });
};

export const getAllTagNames = async (): Promise<string[]> => {
  const tags = await Tag.find({}, { name: 1 });
  return tags.map((tag) => tag.name);
};
