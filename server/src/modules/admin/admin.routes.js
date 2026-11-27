import { Router } from 'express';
import { z } from 'zod';
import { parseQuery, validateBody } from '../../middleware/validate.js';
import { rateLimit } from '../../middleware/rateLimit.js';
import { activityService, logActivity, recordAdminChanges } from './activity.js';
import { adminAuth, adminHostOnly, adminLoginSchema, adminPasswordSchema, loadAdmin, requireAdmin } from './admin.auth.js';
import { catalogueAdmin } from './admin.catalogue.js';
import { dashboardAdmin } from './admin.dashboard.js';
import { ordersAdmin } from './admin.orders.js';
import { peopleAdmin } from './admin.people.js';

/**
 * Everything under /api/admin. Only on the admin's own address in production
 * (ADMIN_HOST), and only for a signed-in admin, except signing in itself.
 * Every change is written to the activity log.
 */
export const adminRouter = Router();

adminRouter.use(adminHostOnly);
adminRouter.use((_req, res, next) => {
  // Admin answers are never cached by browsers or proxies.
  res.set('Cache-Control', 'no-store');
  next();
});
adminRouter.use(loadAdmin);

const loginLimit = rateLimit({ windowMs: 10 * 60 * 1000, max: 30, message: 'Too many sign-in attempts. Please wait 10 minutes.' });
adminRouter.post('/auth/login', loginLimit, validateBody(adminLoginSchema), adminAuth.login);
adminRouter.post('/auth/logout', adminAuth.logout);
adminRouter.get('/auth/me', adminAuth.me);

adminRouter.use(requireAdmin);
adminRouter.use(recordAdminChanges);

adminRouter.post('/auth/password', validateBody(adminPasswordSchema), adminAuth.changePassword);

adminRouter.use('/dashboard', dashboardAdmin);
adminRouter.use('/orders', ordersAdmin);
adminRouter.use(catalogueAdmin);
adminRouter.use(peopleAdmin);

// ---------- Activity log ----------

const activityQuery = z.object({
  admin: z.string().trim().max(160).optional(),
  area: z.string().trim().max(40).optional(),
  from: z.string().trim().max(10).optional(),
  to: z.string().trim().max(10).optional(),
  q: z.string().trim().max(80).optional(),
  result: z.enum(['ok', 'failed']).optional(),
  page: z.coerce.number().int().min(1).max(100_000).optional().default(1),
});

adminRouter.get('/activity', async (req, res) => {
  res.json({ data: await activityService.list(parseQuery(activityQuery, req.query)) });
});
adminRouter.get('/activity/filters', async (_req, res) => {
  res.json({ data: await activityService.filters() });
});
adminRouter.get('/activity/verify', async (req, res) => {
  const result = await activityService.verify();
  await logActivity(req, { area: 'activity', action: `checked the log (${result.ok ? 'intact' : 'BROKEN'})`, item: `${result.checked} entries` });
  res.json({ data: result });
});
adminRouter.get('/activity/export.csv', async (req, res) => {
  const body = await activityService.csv(parseQuery(activityQuery, req.query));
  await logActivity(req, { area: 'activity', action: 'exported the log', item: 'CSV' });
  res.set('Content-Type', 'text/csv; charset=utf-8');
  res.set('Content-Disposition', `attachment; filename="zauq-admin-activity-${new Date().toISOString().slice(0, 10)}.csv"`);
  res.send(`﻿${body}`);
});
