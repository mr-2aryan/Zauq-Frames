import fs from 'node:fs';
import { createApp } from './app.js';
import { env } from './config/env.js';

fs.mkdirSync(env.uploadDir, { recursive: true });

const app = createApp();

const server = app.listen(env.port, (error) => {
  if (error) {
    console.error(`Could not start the API on port ${env.port}:`, error.message);
    process.exit(1);
  }
  console.log(`Zauq Frames API running at http://localhost:${env.port} (${env.nodeEnv})`);
});

const shutdown = (signal) => {
  console.log(`\n${signal} received — closing the API server.`);
  server.close(() => process.exit(0));
  // Force-exit if open connections keep the server alive.
  setTimeout(() => process.exit(1), 10_000).unref();
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
