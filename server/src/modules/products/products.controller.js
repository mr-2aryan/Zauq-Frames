import { parseQuery } from '../../middleware/validate.js';
import { listProductsQuerySchema } from './products.schema.js';
import { productsService } from './products.service.js';

/** GET /api/collections */
export const listCollections = async (_req, res) => {
  res.json({ data: await productsService.listCollections() });
};

/** GET /api/collections/:slug */
export const getCollection = async (req, res) => {
  res.json({ data: await productsService.getCollection(req.params.slug) });
};

/** GET /api/products?collection=&q=&sort=&featured=&limit= */
export const listProducts = async (req, res) => {
  const { collection, ...options } = parseQuery(listProductsQuerySchema, req.query);
  res.json({ data: await productsService.list({ collections: collection, ...options }) });
};

/** GET /api/products/:slug */
export const getProduct = async (req, res) => {
  res.json({ data: await productsService.getBySlug(req.params.slug) });
};
