import { Router } from 'express';
import { reviewsRouter } from '../reviews/reviews.routes.js';
import { getCollection, getProduct, listCollections, listProducts } from './products.controller.js';

export const productsRouter = Router();
productsRouter.get('/', listProducts);
productsRouter.get('/:slug', getProduct);
productsRouter.use('/:slug/reviews', reviewsRouter);

export const collectionsRouter = Router();
collectionsRouter.get('/', listCollections);
collectionsRouter.get('/:slug', getCollection);
