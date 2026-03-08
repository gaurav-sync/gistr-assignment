import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/tagging-search',
  maxTagsPerEntity: parseInt(process.env.MAX_TAGS_PER_ENTITY || '20', 10),
};
