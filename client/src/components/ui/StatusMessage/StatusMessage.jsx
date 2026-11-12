import { cn } from '@/utils/cn';
import { Button } from '../Button/Button.jsx';
import styles from './StatusMessage.module.css';

/**
 * Inline loading / error / empty state for data-driven blocks.
 * @param {{ status: 'loading' | 'error' | 'empty', title?: string, message?: string, onRetry?: () => void, action?: import('react').ReactNode, className?: string }} props
 */
export function StatusMessage({ status, title, message, onRetry, action, className }) {
  if (status === 'loading') {
    return (
      <p role="status" className={cn(styles.box, styles.loading, className)}>
        <span className={styles.spinner} aria-hidden="true"></span>
        {message ?? 'Loading…'}
      </p>
    );
  }

  return (
    <div role={status === 'error' ? 'alert' : undefined} className={cn(styles.box, styles.panel, className)}>
      <div>
        {title && <p className={styles.title}>{title}</p>}
        <p className={styles.message}>{message ?? 'Something went wrong.'}</p>
      </div>
      {(onRetry || action) && (
        <div className={styles.actions}>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              Try again
            </Button>
          )}
          {action}
        </div>
      )}
    </div>
  );
}
