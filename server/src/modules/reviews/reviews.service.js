import { HttpError } from '../../utils/HttpError.js';
import { ordersRepository } from '../orders/orders.repository.js';
import { productsService } from '../products/products.service.js';
import { reviewsRepository } from './reviews.repository.js';

/** What the shop shows of a review (never the order number). */
const toPublic = ({ id, rating, name, city, text, verified, createdAt }) => ({ id, rating, name, city: city ?? null, text, verified, createdAt });

async function requireProduct(slug) {
  const product = await productsService.findBySlug(slug);
  if (!product) throw HttpError.notFound('We could not find that piece.');
  return product;
}

/** A review is "verified" when its order number belongs to an order that contains the piece. */
async function isVerifiedPurchase(orderId, slug) {
  if (!orderId) return false;
  const order = await ordersRepository.findById(orderId.toUpperCase());
  return Boolean(order?.items.some((item) => item.productId === slug));
}

export const reviewsService = {
  /** Newest first, with the average rating and how many reviews gave each star count. */
  async list(slug) {
    await requireProduct(slug);
    // Only reviews the studio has approved are shown (older ones, from before moderation, count as approved).
    const reviews = (await reviewsRepository.findAllBy('productId', slug)).filter((review) => (review.status ?? 'approved') === 'approved').sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const count = reviews.length;
    const average = count ? Math.round((reviews.reduce((sum, review) => sum + review.rating, 0) / count) * 10) / 10 : null;
    const breakdown = [5, 4, 3, 2, 1].map((stars) => ({ stars, count: reviews.filter((review) => review.rating === stars).length }));
    return { count, average, breakdown, items: reviews.map(toPublic) };
  },

  async create(slug, { rating, name, city, text, orderId }) {
    await requireProduct(slug);
    const verified = await isVerifiedPurchase(orderId, slug);
    // New reviews wait for the studio's approval in the admin before they appear.
    const review = await reviewsRepository.create({ productId: slug, rating, name, city, text, orderId: orderId?.toUpperCase(), verified, status: 'pending' });
    return toPublic(review);
  },
};
