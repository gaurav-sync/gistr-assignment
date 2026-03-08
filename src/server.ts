import { createApp } from './app';
import { connectDatabase } from './config/database';
import { config } from './config';

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    const app = createApp();

    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
