import { reviewsService } from './reviews.service.js';

/** GET /api/products/:slug/reviews */
export const listReviews = async (req, res) => {
  res.json({ data: await reviewsService.list(req.params.slug) });
};

/** POST /api/products/:slug/reviews */
export const createReview = async (req, res) => {
  const review = await reviewsService.create(req.params.slug, req.body);
  res.status(201).json({ data: review });
};
