import { useId } from 'react';
import { Badge, Panel, Section } from '@/components/ui';
import styles from './PageMessage.module.css';

/**
 * Centred full-page message — used for "coming soon", 404 and error pages.
 * @param {{ eyebrow: string, title: import('react').ReactNode, description?: string, actions?: import('react').ReactNode }} props
 */
export function PageMessage({ eyebrow, title, description, actions }) {
  const headingId = useId();
  return (
    <Section spacing="top" aria-labelledby={headingId}>
      <Panel tone="tint" className={styles.panel}>
        <Badge>{eyebrow}</Badge>
        <h1 id={headingId} className={styles.title}>
          {title}
        </h1>
        {description && <p className={styles.description}>{description}</p>}
        {actions && <div className={styles.actions}>{actions}</div>}
      </Panel>
    </Section>
  );
}
