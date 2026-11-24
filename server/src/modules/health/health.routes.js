import { Router } from 'express';
import { databaseStatus } from '../../db/index.js';

const router = Router();

/** GET /api/health — liveness check. */
router.get('/', async (_req, res) => {
  res.json({
    data: {
      status: 'ok',
      database: await databaseStatus(),
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;
