import { useQuery } from '@/hooks/useQuery';
import { getProduct, listCollections, listProducts } from '@/services/productsApi';
import { getReviews } from '@/services/reviewsApi';

/**
 * Product list for the given filters.
 * @param {{ collection?: string, q?: string, sort?: string, featured?: boolean, limit?: number, page?: number }} params
 */
export function useProducts(params) {
  return useQuery(({ signal }) => listProducts(params, { signal }), `products:${JSON.stringify(params)}`);
}

/** One product with its images and related pieces. */
export function useProduct(slug) {
  return useQuery(({ signal }) => getProduct(slug, { signal }), `product:${slug}`);
}

/** All collections with their product counts. */
export function useCollections() {
  return useQuery(({ signal }) => listCollections({ signal }), 'collections');
}

/** A piece's reviews with their average and star breakdown. */
export function useProductReviews(slug) {
  return useQuery(({ signal }) => getReviews(slug, { signal }), `reviews:${slug}`);
}
