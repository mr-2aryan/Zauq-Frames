import { SITE } from '@/config/site';
import { cn } from '@/utils/cn';
import styles from './Logo.module.css';

/**
 * Zauq Premium Frames wordmark.
 * @param {{ tone?: 'dark' | 'light', size?: number, className?: string }} props `size` is the "ZAUQ" font size in px.
 */
export function Logo({ tone = 'dark', size = 26, className }) {
  return (
    <span role="img" aria-label={SITE.fullName} className={cn(styles.logo, styles[tone], className)} style={{ '--logo-size': `${size}px` }}>
      <span aria-hidden="true" className={styles.wordmark}>
        ZAUQ
      </span>
      <span aria-hidden="true" className={styles.tagline}>
        PREMIUM FRAMES
      </span>
    </span>
  );
}
