import { useId } from 'react';
import { Section } from '@/components/ui';
import { OCCASIONS } from '../../data/content.js';
import styles from './Occasions.module.css';

/** "Some moments deserve more than a phone gallery." with occasion pills. */
export function Occasions({ items = OCCASIONS }) {
  const headingId = useId();

  return (
    <Section aria-labelledby={headingId}>
      <div className={styles.layout}>
        <h2 id={headingId} className={styles.title} data-reveal="fade-right">
          Some moments deserve more than a phone gallery.
        </h2>
        <ul className={styles.pills}>
          {items.map(({ label }, index) => (
            <li key={label} className={styles.pill} data-reveal="zoom-in" style={{ '--reveal-delay': `${index * 50}ms` }}>
              {label}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
