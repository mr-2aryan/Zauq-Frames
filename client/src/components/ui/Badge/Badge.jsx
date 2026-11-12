import { cn } from '@/utils/cn';
import styles from './Badge.module.css';

/**
 * Small rounded label.
 * @param {{ tone?: 'light' | 'tint' | 'primary' | 'sale' | 'dark', className?: string } & Record<string, any>} props
 */
export function Badge({ tone = 'light', className, children, ...rest }) {
  return (
    <span className={cn(styles.badge, styles[tone], className)} {...rest}>
      {children}
    </span>
  );
}
