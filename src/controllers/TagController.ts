import { Request, Response } from 'express';
import * as TagService from '../services/TagService';
import { EntityType } from '../models/Entity';

export const attachTags = async (req: Request, res: Response): Promise<void> => {
  try {
    const { entityId, entityType, tags } = req.body;

    if (!entityId || !entityType || !tags) {
      res.status(400).json({
        error: 'Missing required fields: entityId, entityType, tags',
      });
      return;
    }

    if (!Array.isArray(tags)) {
      res.status(400).json({ error: 'Tags must be an array' });
      return;
    }

    const validEntityTypes: EntityType[] = ['source', 'snippet', 'airesponse'];
    if (!validEntityTypes.includes(entityType)) {
      res.status(400).json({
        error: `Invalid entityType. Must be one of: ${validEntityTypes.join(', ')}`,
      });
      return;
    }

    const result = await TagService.attachTags(entityId, entityType, tags);
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const getAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const days = req.query.days ? parseInt(req.query.days as string, 10) : undefined;

    if (days !== undefined && (isNaN(days) || days < 1)) {
      res.status(400).json({ error: 'Invalid days parameter' });
      return;
    }

    const analytics = await TagService.getAnalytics(days);
    res.status(200).json(analytics);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};
