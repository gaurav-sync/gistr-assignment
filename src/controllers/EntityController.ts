import { Request, Response } from 'express';
import * as TagService from '../services/TagService';
import { EntityType } from '../models/Entity';

export const searchEntities = async (req: Request, res: Response): Promise<void> => {
  try {
    const { entityType, tags, mode, page, limit } = req.query;

    if (!tags) {
      res.status(400).json({ error: 'Missing required parameter: tags' });
      return;
    }

    const tagArray = (tags as string).split(',').map((tag) => tag.trim());
    const searchMode = (mode as string) || 'or';

    if (searchMode !== 'and' && searchMode !== 'or') {
      res.status(400).json({ error: 'Mode must be either "and" or "or"' });
      return;
    }

    const validEntityTypes: EntityType[] = ['source', 'snippet', 'airesponse'];
    if (entityType && !validEntityTypes.includes(entityType as EntityType)) {
      res.status(400).json({
        error: `Invalid entityType. Must be one of: ${validEntityTypes.join(', ')}`,
      });
      return;
    }

    const pageNum = page ? parseInt(page as string, 10) : 1;
    const limitNum = limit ? parseInt(limit as string, 10) : 20;

    if (isNaN(pageNum) || pageNum < 1) {
      res.status(400).json({ error: 'Invalid page parameter' });
      return;
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      res.status(400).json({ error: 'Invalid limit parameter (1-100)' });
      return;
    }

    const result = await TagService.searchEntities(
      tagArray,
      searchMode,
      entityType as EntityType | undefined,
      pageNum,
      limitNum
    );

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};
