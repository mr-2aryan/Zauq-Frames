import { ArrowRightIcon } from '@/components/icons';
import { cn } from '@/utils/cn';
import styles from './Pagination.module.css';

/** Page numbers to show: always the first and last, the current one and its neighbours; `null` marks a gap. */
function pageList(page, pages) {
  const wanted = new Set([1, pages, page - 1, page, page + 1].filter((n) => n >= 1 && n <= pages));
  const sorted = [...wanted].sort((a, b) => a - b);
  return sorted.flatMap((n, index) => (index > 0 && n - sorted[index - 1] > 1 ? [null, n] : [n]));
}

/**
 * Previous / numbered pages / next. Hidden when everything fits on one page.
 * @param {{ page: number, pages: number, onChange: (page: number) => void, label?: string }} props
 */
export function Pagination({ page, pages, onChange, label = 'Pages' }) {
  if (pages <= 1) return null;

  return (
    <nav aria-label={label} className={styles.pagination}>
      <button type="button" className={cn(styles.step, styles.prev)} onClick={() => onChange(page - 1)} disabled={page <= 1}>
        <ArrowRightIcon size={17} />
        <span className={styles.stepText}>Previous</span>
      </button>

      <ol className={styles.pages}>
        {pageList(page, pages).map((n, index) =>
          n === null ? (
            <li key={`gap-${index}`} className={styles.gap} aria-hidden="true">
              …
            </li>
          ) : (
            <li key={n}>
              <button
                type="button"
                className={cn(styles.page, n === page && styles.current)}
                onClick={() => onChange(n)}
                aria-current={n === page ? 'page' : undefined}
                aria-label={`Page ${n}`}
              >
                {n}
              </button>
            </li>
          ),
        )}
      </ol>

      <button type="button" className={styles.step} onClick={() => onChange(page + 1)} disabled={page >= pages}>
        <span className={styles.stepText}>Next</span>
        <ArrowRightIcon size={17} />
      </button>
    </nav>
  );
}
