import express, { Application, Request, Response } from 'express';
import entityRoutes from './routes/entityRoutes';
import tagRoutes from './routes/tagRoutes';

export const createApp = (): Application => {
  const app = express();

  app.use(express.json());

  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/entities', entityRoutes);
  app.use('/tags', tagRoutes);

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Route not found' });
  });

  return app;
};
