import { StatusMessage } from '@/components/ui';
import { cn } from '@/utils/cn';
import { ProductCard, ProductCardSkeleton } from '../ProductCard/ProductCard.jsx';
import styles from './ProductGrid.module.css';

/**
 * Responsive grid of product cards with loading, error and empty states.
 * @param {{
 *   status: 'loading' | 'success' | 'error',
 *   products?: import('@/services/productsApi').ProductSummary[],
 *   error?: Error | null,
 *   onRetry?: () => void,
 *   placeholderCount?: number,
 *   empty?: import('react').ReactNode,
 *   minWidth?: number,
 *   className?: string,
 * }} props
 */
export function ProductGrid({ status, products = [], error, onRetry, placeholderCount = 4, empty, minWidth = 240, className }) {
  if (status === 'error') {
    return <StatusMessage status="error" title="We couldn’t load these pieces" message={error?.message} onRetry={onRetry} />;
  }
  if (status === 'success' && products.length === 0) {
    return empty ?? <StatusMessage status="empty" message="No pieces to show yet." />;
  }

  return (
    <ul className={cn(styles.grid, className)} style={{ '--min': `${minWidth}px` }} aria-busy={status === 'loading'}>
      {status === 'loading'
        ? Array.from({ length: placeholderCount }, (_, index) => (
            <li key={index}>
              <ProductCardSkeleton />
            </li>
          ))
        : products.map((product) => (
            <li key={product.slug}>
              <ProductCard product={product} />
            </li>
          ))}
    </ul>
  );
}
