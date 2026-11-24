import { Router } from 'express';
import { env } from '../../config/env.js';
import { HttpError } from '../../utils/HttpError.js';
import { framesService } from '../frames/frames.service.js';
import { productsService } from '../products/products.service.js';
import { orderEmail } from './orderEmail.js';

/**
 * Development only: see each order email in the browser, at
 * /api/dev/emails (with real pieces and prices from the catalogue).
 */
export const emailPreviewRouter = Router();

const STATUSES = ['pending', 'confirmed', 'in_production', 'shipped', 'delivered', 'cancelled'];

async function line(productId, sizeId, mat, quantity) {
  const [product, size, catalog] = await Promise.all([productsService.findBySlug(productId), framesService.findSizeById(sizeId), framesService.getCatalog()]);
  const orientation = product.orientation ?? 'portrait';
  const [width, height] = orientation === 'landscape' ? [size.height, size.width] : [size.width, size.height];
  return {
    type: 'product',
    name: product.name,
    productId: product.slug,
    image: product.cardImage ?? product.images[0],
    art: product.art,
    sizeId: size.id,
    label: `${width} × ${height} in`,
    orientation,
    finish: catalog.finish,
    mat,
    quantity,
    listPrice: size.price,
    unitPrice: size.salePrice,
    lineTotal: size.salePrice * quantity,
  };
}

async function sampleOrder(status) {
  const catalog = await framesService.getCatalog();
  const items = await Promise.all([line('badshahi-mosque', '18x24', 'white', 1), line('eminem', '12x16', 'none', 1)]);
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const createdAt = new Date(Date.now() - 2 * 86_400_000).toISOString();
  return {
    id: 'ZQ-4F9A1C7B2E',
    status,
    createdAt,
    updatedAt: new Date().toISOString(),
    customer: { name: 'Sample Customer', phone: '0300 0000000', email: 'sample@example.com', address: 'House 1, Street 1', city: 'Rawalpindi' },
    paymentMethod: status === 'confirmed' ? 'bank' : 'cod',
    items,
    currency: catalog.currency,
    promotion: catalog.promotion,
    subtotal,
    deliveryFee: catalog.deliveryFee,
    total: subtotal + catalog.deliveryFee,
  };
}

// The email is a full page that loads the site's images and Google Fonts.
const PREVIEW_CSP = "default-src 'none'; img-src http: https: data:; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com";

emailPreviewRouter.get('/', (req, res) => {
  res.set('Content-Security-Policy', PREVIEW_CSP);
  res.type('html').send(
    `<!doctype html><meta charset="utf-8"><title>Order emails</title><body style="font-family:system-ui;padding:32px;background:#f4f3ee"><h1>Order emails</h1><ul style="line-height:2">${STATUSES.map((status) => `<li><a href="./emails/${status}${req.query.site ? `?site=${encodeURIComponent(siteFor(req))}` : ''}">${status}</a></li>`).join('')}</ul></body>`,
  );
});

/** `?site=http://localhost:5174` shows the images from another local copy of the site. */
const siteFor = (req) => (/^http:\/\/localhost:\d{2,5}$/.test(String(req.query.site ?? '')) ? req.query.site : env.publicUrl);

emailPreviewRouter.get('/:status', async (req, res) => {
  if (!STATUSES.includes(req.params.status)) throw HttpError.notFound('No such email.');
  const { html } = orderEmail(await sampleOrder(req.params.status), { publicUrl: siteFor(req) });
  res.set('Content-Security-Policy', PREVIEW_CSP);
  res.type('html').send(html);
});
