import { Router } from 'express';
import { blogService } from './blog.service.js';

/** /api/blog — the shop's blog. */
export const blogRouter = Router();

blogRouter.get('/', async (_req, res) => {
  res.json({ data: await blogService.list() });
});

blogRouter.get('/:slug', async (req, res) => {
  res.json({ data: await blogService.getBySlug(req.params.slug) });
});
