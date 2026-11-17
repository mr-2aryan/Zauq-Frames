import { Router } from 'express';
import { validateBody } from '../../middleware/validate.js';
import { createReview, listReviews } from './reviews.controller.js';
import { createReviewSchema } from './reviews.schema.js';

/** Mounted at /api/products/:slug/reviews. */
export const reviewsRouter = Router({ mergeParams: true });
reviewsRouter.get('/', listReviews);
reviewsRouter.post('/', validateBody(createReviewSchema), createReview);
