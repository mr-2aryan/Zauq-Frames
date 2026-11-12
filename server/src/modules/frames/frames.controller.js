import { framesService } from './frames.service.js';

/** GET /api/frames/catalog */
export const getCatalog = async (_req, res) => {
  res.json({ data: await framesService.getCatalog() });
};
