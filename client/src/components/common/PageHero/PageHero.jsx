import { useId } from 'react';
import { Breadcrumbs, Container } from '@/components/ui';
import { cn } from '@/utils/cn';
import styles from './PageHero.module.css';

/**
 * The full-width band at the top of a page: breadcrumbs, a kicker, the title
 * (with an optional light second line), a lead paragraph, optional actions or
 * extra content, and an optional visual on the right — a photo, an
 * illustration or any node. The title is the page's <h1>.
 * @param {{
 *   breadcrumbs?: Array<{ label: string, to?: string }>,
 *   kicker?: string,
 *   title: import('react').ReactNode,
 *   titleLight?: import('react').ReactNode,
 *   lead?: import('react').ReactNode,
 *   actions?: import('react').ReactNode,
 *   media?: import('react').ReactNode,
 *   tone?: 'tint' | 'dark',
 *   size?: 'md' | 'sm',
 *   children?: import('react').ReactNode,
 *   id?: string,
 *   className?: string,
 * }} props
 */
export function PageHero({ breadcrumbs, kicker, title, titleLight, lead, actions, media, tone = 'tint', size = 'md', children, id, className }) {
  const fallbackId = useId();
  const headingId = id ?? fallbackId;

  return (
    <section className={cn(styles.hero, styles[tone], styles[size], className)} aria-labelledby={headingId}>
      <Container className={cn(styles.inner, media && styles.withMedia)}>
        <div className={styles.copy}>
          {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
          {kicker && (
            <p className={styles.kicker} data-reveal="fade-up">
              {kicker}
            </p>
          )}
          <h1 id={headingId} className={styles.title} data-reveal="fade-up" style={{ '--reveal-delay': '60ms' }}>
            {title}
            {titleLight && <span className={styles.light}> {titleLight}</span>}
          </h1>
          {lead && (
            <p className={styles.lead} data-reveal="fade-up" style={{ '--reveal-delay': '120ms' }}>
              {lead}
            </p>
          )}
          {actions && (
            <div className={styles.actions} data-reveal="fade-up" style={{ '--reveal-delay': '180ms' }}>
              {actions}
            </div>
          )}
          {children && (
            <div className={styles.extra} data-reveal="fade-up" style={{ '--reveal-delay': '180ms' }}>
              {children}
            </div>
          )}
        </div>
        {media && (
          <div className={styles.media} data-reveal="fade-left" style={{ '--reveal-delay': '120ms' }}>
            {media}
          </div>
        )}
      </Container>
    </section>
  );
}
