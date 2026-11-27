import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../../middleware/validate.js';
import { HttpError } from '../../utils/HttpError.js';
import { ORIENTATIONS } from '../frames/frames.catalog.js';
import { framesService } from '../frames/frames.service.js';
import { artworkUpload, imageUploads } from '../media/media.middleware.js';
import { mediaService } from '../media/media.service.js';
import { collectionsRepository, productsRepository } from '../products/products.repository.js';
import { productsService } from '../products/products.service.js';
import { productSeo } from '../seo/titles.js';
import { settingsService } from '../settings/settings.service.js';
import { logActivity } from './activity.js';

// ---------- Helpers ----------

/** An image stored on this site: an upload (/media/...) or one of the original photos (/images/...). */
const imageUrl = z.string().trim().max(300).regex(/^\/(media|images)\/[\w./-]+$/, 'Use an uploaded image.');
const optionalImage = imageUrl.nullable().optional().default(null);
const slug = z
  .string()
  .trim()
  .toLowerCase()
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and dashes only.');

export const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/&/g, ' and ')
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100) || 'item';

async function uniqueSlug(repository, wanted, exceptId) {
  const taken = new Set((await repository.findAll()).filter((r) => r.id !== exceptId).map((r) => r.slug));
  let candidate = wanted;
  for (let n = 2; taken.has(candidate); n += 1) candidate = `${wanted}-${n}`;
  return candidate;
}

/** Every image URL the shop still uses (products, collections, site content). */
async function usedUrls() {
  const [products, collections, site] = await Promise.all([productsRepository.findAll(), collectionsRepository.findAll(), settingsService.get('site', {})]);
  const urls = new Set();
  for (const p of products) [p.cardImage, p.art, p.seo?.ogImage, ...(p.images ?? [])].forEach((u) => u && urls.add(u));
  for (const c of collections) if (c.image) urls.add(c.image);
  JSON.stringify(site ?? {}).replace(/"(\/media\/[^"]+)"/g, (_m, u) => urls.add(u));
  return urls;
}
const productUrls = (p) => [p.cardImage, p.art, p.seo?.ogImage, ...(p.images ?? [])].filter(Boolean);

/** Deletes a print file only when no product uses it any more (a duplicate shares its original's file). */
async function releaseArtwork(mediaId) {
  if (!mediaId) return;
  const products = await productsRepository.findAll();
  if (products.some((p) => p.artworkMediaId === mediaId)) return;
  await mediaService.remove(mediaId);
}

async function cleanUp(urls) {
  const used = await usedUrls();
  await mediaService.removeUnused(urls, async (url) => used.has(url));
}

const refresh = () => {
  productsService.invalidate();
  framesService.invalidate();
};

// ---------- Products ----------

const productSchema = z.object({
  name: z.string().trim().min(2, 'Please enter a name.').max(120),
  slug: z.union([z.literal(''), slug]).optional().default(''),
  collection: z.string().trim().min(1, 'Choose a collection.'),
  orientation: z.enum(ORIENTATIONS).optional().default('portrait'),
  summary: z.string().trim().min(10, 'Write a one-line summary (at least 10 characters).').max(200),
  description: z.string().trim().min(20, 'Write a description (at least 20 characters).').max(4000),
  images: z.array(imageUrl).min(1, 'Add at least one photo.').max(12, 'Up to 12 photos.'),
  cardImage: optionalImage,
  art: optionalImage,
  artworkMediaId: z.string().trim().max(60).nullable().optional().default(null),
  featured: z.boolean().optional().default(false),
  badge: z.string().trim().max(20).nullable().optional().transform((value) => value || null),
  status: z.enum(['active', 'draft']).optional().default('draft'),
  seo: z
    .object({
      metaTitle: z.string().trim().max(70, 'Keep it under 70 characters.').optional().default(''),
      metaDescription: z.string().trim().max(170, 'Keep it under 170 characters.').optional().default(''),
      ogImage: optionalImage,
      noindex: z.boolean().optional().default(false),
    })
    .optional()
    .default({}),
});

async function checkCollection(slugValue) {
  if (!(await collectionsRepository.findOneBy('slug', slugValue))) {
    throw HttpError.badRequest('Please check the highlighted fields.', [{ field: 'collection', message: 'That collection does not exist.' }]);
  }
}

async function loadProduct(id) {
  const product = await productsRepository.findById(id);
  if (!product) throw HttpError.notFound('We could not find that product.');
  return product;
}

export const catalogueAdmin = Router();

catalogueAdmin.get('/products', async (_req, res) => {
  const [products, collections] = await Promise.all([productsRepository.findAll(), collectionsRepository.findAll()]);
  const names = new Map(collections.map((c) => [c.slug, c.name]));
  const items = products
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((p) => ({ ...p, collectionName: names.get(p.collection) ?? p.collection }));
  res.json({ data: { items } });
});

/** The search title and description a product gets when its own SEO fields are left empty (for the editor's preview). */
catalogueAdmin.get('/seo/product-preview', async (req, res) => {
  const field = (key, max) => String(req.query[key] ?? '').trim().slice(0, max);
  const draft = { name: field('name', 120) || 'Product name', collection: field('collection', 60), summary: field('summary', 200) };
  res.json({ data: productSeo(draft, await framesService.getCatalog()) });
});

catalogueAdmin.get('/products/:id', async (req, res) => {
  res.json({ data: { product: await loadProduct(req.params.id) } });
});

catalogueAdmin.post('/products', validateBody(productSchema), async (req, res) => {
  await checkCollection(req.body.collection);
  const all = await productsRepository.findAll();
  const product = await productsRepository.create({
    ...req.body,
    slug: await uniqueSlug(productsRepository, req.body.slug || slugify(req.body.name)),
    sortOrder: all.reduce((max, p) => Math.max(max, p.sortOrder ?? 0), -1) + 1,
  });
  refresh();
  res.locals.activity = { area: 'products', action: `created product (${product.status})`, item: product.name };
  res.status(201).json({ data: { product } });
});

catalogueAdmin.put('/products/:id', validateBody(productSchema), async (req, res) => {
  const before = await loadProduct(req.params.id);
  await checkCollection(req.body.collection);
  const nextSlug = await uniqueSlug(productsRepository, req.body.slug || before.slug || slugify(req.body.name), before.id);
  const previousSlugs = nextSlug !== before.slug ? [...new Set([...(before.previousSlugs ?? []), before.slug])] : before.previousSlugs ?? [];
  const product = await productsRepository.update(before.id, { ...req.body, slug: nextSlug, previousSlugs });
  refresh();
  const removed = productUrls(before).filter((url) => !productUrls(product).includes(url));
  await cleanUp(removed);
  if (before.artworkMediaId !== product.artworkMediaId) await releaseArtwork(before.artworkMediaId);
  res.locals.activity = { area: 'products', action: 'updated product', item: product.name };
  res.json({ data: { product } });
});

catalogueAdmin.post('/products/:id/duplicate', async (req, res) => {
  const source = await loadProduct(req.params.id);
  const { id: _id, createdAt: _c, updatedAt: _u, previousSlugs: _p, ...copy } = source;
  const all = await productsRepository.findAll();
  const product = await productsRepository.create({
    ...copy,
    name: `${source.name} (copy)`,
    slug: await uniqueSlug(productsRepository, `${source.slug}-copy`),
    status: 'draft',
    sortOrder: all.reduce((max, p) => Math.max(max, p.sortOrder ?? 0), -1) + 1,
  });
  refresh();
  res.locals.activity = { area: 'products', action: 'duplicated product', item: source.name };
  res.status(201).json({ data: { product } });
});

catalogueAdmin.delete('/products/:id', async (req, res) => {
  const product = await loadProduct(req.params.id);
  await productsRepository.delete(product.id);
  refresh();
  await cleanUp(productUrls(product));
  await releaseArtwork(product.artworkMediaId);
  res.locals.activity = { area: 'products', action: 'deleted product', item: product.name };
  res.json({ data: { deleted: true } });
});

/** New order of products (ids in the order they should appear). */
catalogueAdmin.put('/products-order', validateBody(z.object({ ids: z.array(z.string()).min(1).max(1000) })), async (req, res) => {
  for (const [index, id] of req.body.ids.entries()) await productsRepository.update(id, { sortOrder: index });
  refresh();
  res.locals.activity = { area: 'products', action: 'reordered products', item: `${req.body.ids.length} products` };
  res.json({ data: { saved: true } });
});

// ---------- Collections ----------

const collectionSchema = z.object({
  name: z.string().trim().min(2, 'Please enter a name.').max(80),
  shortName: z.string().trim().max(30).optional().default(''),
  slug: z.union([z.literal(''), slug]).optional().default(''),
  description: z.string().trim().max(400).optional().default(''),
  image: optionalImage,
});

async function loadCollection(id) {
  const collection = await collectionsRepository.findById(id);
  if (!collection) throw HttpError.notFound('We could not find that collection.');
  return collection;
}

catalogueAdmin.get('/collections', async (_req, res) => {
  const [collections, products] = await Promise.all([collectionsRepository.findAll(), productsRepository.findAll()]);
  const items = collections
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((c) => ({ ...c, productCount: products.filter((p) => p.collection === c.slug).length, activeCount: products.filter((p) => p.collection === c.slug && p.status === 'active').length }));
  res.json({ data: { items } });
});

catalogueAdmin.post('/collections', validateBody(collectionSchema), async (req, res) => {
  const all = await collectionsRepository.findAll();
  const collection = await collectionsRepository.create({
    ...req.body,
    shortName: req.body.shortName || req.body.name,
    slug: await uniqueSlug(collectionsRepository, req.body.slug || slugify(req.body.name)),
    sortOrder: all.length,
  });
  refresh();
  res.locals.activity = { area: 'collections', action: 'created collection', item: collection.name };
  res.status(201).json({ data: { collection } });
});

catalogueAdmin.put('/collections/:id', validateBody(collectionSchema), async (req, res) => {
  const before = await loadCollection(req.params.id);
  const nextSlug = await uniqueSlug(collectionsRepository, req.body.slug || before.slug, before.id);
  const collection = await collectionsRepository.update(before.id, { ...req.body, shortName: req.body.shortName || req.body.name, slug: nextSlug });
  if (nextSlug !== before.slug) {
    // Keep the collection's products with it.
    for (const product of await productsRepository.findAllBy('collection', before.slug)) await productsRepository.update(product.id, { collection: nextSlug });
  }
  refresh();
  if (before.image && before.image !== collection.image) await cleanUp([before.image]);
  res.locals.activity = { area: 'collections', action: 'updated collection', item: collection.name };
  res.json({ data: { collection } });
});

catalogueAdmin.delete('/collections/:id', async (req, res) => {
  const collection = await loadCollection(req.params.id);
  const products = await productsRepository.findAllBy('collection', collection.slug);
  if (products.length) throw HttpError.conflict(`Move or delete its ${products.length} product(s) first.`);
  await collectionsRepository.delete(collection.id);
  refresh();
  if (collection.image) await cleanUp([collection.image]);
  res.locals.activity = { area: 'collections', action: 'deleted collection', item: collection.name };
  res.json({ data: { deleted: true } });
});

catalogueAdmin.put('/collections-order', validateBody(z.object({ ids: z.array(z.string()).min(1).max(200) })), async (req, res) => {
  for (const [index, id] of req.body.ids.entries()) await collectionsRepository.update(id, { sortOrder: index });
  refresh();
  res.locals.activity = { area: 'collections', action: 'reordered collections', item: `${req.body.ids.length} collections` };
  res.json({ data: { saved: true } });
});

// ---------- Sizes, prices, delivery and promotion ----------

const sizeSchema = z.object({
  id: z.string().trim().regex(/^\d{1,3}x\d{1,3}$/, 'Size ids look like 12x16.'),
  width: z.coerce.number().int().min(2).max(120),
  height: z.coerce.number().int().min(2).max(120),
  salePrice: z.coerce.number().int().min(100, 'At least Rs 100.').max(1_000_000),
  description: z.string().trim().max(160).optional().default(''),
});
const framesSchema = z.object({
  deliveryFee: z.coerce.number().int().min(0).max(20_000),
  finish: z.string().trim().min(2).max(40).optional().default('black'),
  promotion: z.object({ percentOff: z.coerce.number().int().min(0).max(90), label: z.string().trim().max(60).optional().default('') }),
  sizes: z
    .array(sizeSchema)
    .min(1, 'Keep at least one size.')
    .max(12)
    .refine((sizes) => new Set(sizes.map((s) => s.id)).size === sizes.length, 'Each size must be different.'),
});

catalogueAdmin.get('/settings/frames', async (_req, res) => {
  res.json({ data: { settings: await framesService.getSettings(), catalog: await framesService.getCatalog() } });
});

catalogueAdmin.put('/settings/frames', validateBody(framesSchema), async (req, res) => {
  const current = await framesService.getSettings();
  const saved = await framesService.saveSettings({ ...current, ...req.body, currency: 'PKR' });
  refresh();
  res.locals.activity = { area: 'settings', action: 'updated sizes, prices or delivery', item: `${saved.sizes.length} sizes, ${saved.promotion.percentOff}% off, delivery Rs ${saved.deliveryFee}` };
  res.json({ data: { settings: saved, catalog: await framesService.getCatalog() } });
});

// ---------- Media (images on the server's disk) ----------

const FOLDERS = ['products', 'collections', 'site', 'blog', 'seo'];

catalogueAdmin.post('/media', imageUploads, async (req, res) => {
  const folder = FOLDERS.includes(req.body?.folder) ? req.body.folder : 'products';
  if (!req.files?.length) throw HttpError.badRequest('Choose at least one image.');
  const saved = [];
  for (const file of req.files) saved.push(await mediaService.saveImage(file.buffer, { folder, originalName: file.originalname, uploadedBy: req.admin.email }));
  res.locals.activity = { area: 'media', action: `uploaded ${saved.length} image(s)`, item: folder };
  res.status(201).json({ data: { items: saved } });
});

catalogueAdmin.post('/media/artwork', artworkUpload, async (req, res) => {
  if (!req.file) throw HttpError.badRequest('Choose the artwork file.');
  const media = await mediaService.saveArtwork(req.file.path, { originalName: req.file.originalname, uploadedBy: req.admin.email });
  res.locals.activity = { area: 'media', action: 'uploaded print artwork (private)', item: req.file.originalname };
  res.status(201).json({ data: { media } });
});

catalogueAdmin.get('/media', async (req, res) => {
  const [used, products] = await Promise.all([usedUrls(), productsRepository.findAll()]);
  const printFiles = new Set(products.map((p) => p.artworkMediaId).filter(Boolean));
  const items = (await mediaService.list({ folder: typeof req.query.folder === 'string' ? req.query.folder : undefined })).map((m) => ({
    ...m,
    inUse: printFiles.has(m.id) || Object.values(m.files ?? {}).some((url) => used.has(url)),
  }));
  res.json({ data: { items } });
});

catalogueAdmin.patch('/media/:id', validateBody(z.object({ alt: z.string().trim().max(160) })), async (req, res) => {
  res.json({ data: { media: await mediaService.updateAlt(req.params.id, req.body.alt) } });
});

catalogueAdmin.delete('/media/:id', async (req, res) => {
  const used = await usedUrls();
  const all = await mediaService.list();
  const media = all.find((m) => m.id === req.params.id);
  if (!media) throw HttpError.notFound('No such image.');
  const products = await productsRepository.findAll();
  if (Object.values(media.files ?? {}).some((url) => used.has(url)) || products.some((p) => p.artworkMediaId === media.id)) {
    throw HttpError.conflict('This image is still used. Remove it from where it is used first.');
  }
  await mediaService.remove(media.id);
  res.locals.activity = { area: 'media', action: 'deleted image', item: media.originalName || media.id };
  res.json({ data: { deleted: true } });
});

/** Downloads a private print file (never served publicly). */
catalogueAdmin.get('/media/:id/original', async (req, res) => {
  const { file, name } = await mediaService.privateFile(req.params.id);
  await logActivity(req, { area: 'media', action: 'downloaded print artwork', item: name });
  res.download(file, name);
});
