import { Router } from 'express';
import { getCollection, getProduct, listCollections, listProducts } from './products.controller.js';

export const productsRouter = Router();
productsRouter.get('/', listProducts);
productsRouter.get('/:slug', getProduct);

export const collectionsRouter = Router();
collectionsRouter.get('/', listCollections);
collectionsRouter.get('/:slug', getCollection);
