import { Router } from 'express';

const router = Router();

/** GET /api/health — liveness check. */
router.get('/', (_req, res) => {
  res.json({
    data: {
      status: 'ok',
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;
