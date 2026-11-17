import { useId } from 'react';
import { Container } from '@/components/ui';
import { cn } from '@/utils/cn';
import styles from './InfoBlocks.module.css';

/**
 * Building blocks for the long information pages (About, Shipping, Care…), so
 * they share one rhythm: sections with a kicker and title, icon grids,
 * numbered steps, text beside an illustration, fact cards and a closing band.
 */

/**
 * A full-width section: kicker, title and lead above its content.
 * @param {{ id?: string, kicker?: string, title?: import('react').ReactNode, lead?: import('react').ReactNode,
 *   tone?: 'plain' | 'surface' | 'dark', align?: 'left' | 'center', children: import('react').ReactNode, className?: string }} props
 */
export function InfoSection({ id, kicker, title, lead, tone = 'plain', align = 'left', children, className }) {
  const headingId = useId();
  return (
    <section id={id} aria-labelledby={title ? headingId : undefined} className={cn(styles.section, styles[tone], className)}>
      <Container>
        {(kicker || title || lead) && (
          <header className={cn(styles.header, align === 'center' && styles.center)} data-reveal="fade-up">
            {kicker && <p className={styles.kicker}>{kicker}</p>}
            {title && (
              <h2 id={headingId} className={styles.title}>
                {title}
              </h2>
            )}
            {lead && <p className={styles.lead}>{lead}</p>}
          </header>
        )}
        {children}
      </Container>
    </section>
  );
}

/**
 * Icon cards in a grid.
 * @param {{ items: Array<{ Icon: Function, title: string, text: import('react').ReactNode }>, columns?: 2 | 3 | 4 }} props
 */
export function FeatureGrid({ items, columns = 3 }) {
  return (
    <ul className={cn(styles.features, styles[`cols${columns}`])}>
      {items.map(({ Icon, title, text }, index) => (
        <li key={title} className={styles.feature} data-reveal="fade-up" style={{ '--reveal-delay': `${(index % columns) * 70}ms` }}>
          <span className={styles.featureIcon} aria-hidden="true">
            <Icon size={24} />
          </span>
          <h3 className={styles.featureTitle}>{title}</h3>
          <p className={styles.featureText}>{text}</p>
        </li>
      ))}
    </ul>
  );
}

/**
 * Numbered steps joined by a line (a column on phones).
 * @param {{ steps: Array<{ title: string, text: import('react').ReactNode, meta?: string }> }} props
 */
export function StepList({ steps }) {
  return (
    <ol className={styles.steps}>
      {steps.map(({ title, text, meta }, index) => (
        <li key={title} className={styles.step} data-reveal="fade-up" style={{ '--reveal-delay': `${index * 60}ms` }}>
          <span className={styles.stepNumber} aria-hidden="true">
            {String(index + 1).padStart(2, '0')}
          </span>
          <div>
            {meta && <p className={styles.stepMeta}>{meta}</p>}
            <h3 className={styles.stepTitle}>{title}</h3>
            <p className={styles.stepText}>{text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/**
 * Text beside an illustration or photo; `reverse` puts the visual first.
 * @param {{ kicker?: string, title: import('react').ReactNode, children: import('react').ReactNode,
 *   media: import('react').ReactNode, reverse?: boolean }} props
 */
export function SplitBlock({ kicker, title, children, media, reverse = false }) {
  return (
    <div className={cn(styles.split, reverse && styles.reverse)}>
      <div className={styles.splitText} data-reveal="fade-up">
        {kicker && <p className={styles.kicker}>{kicker}</p>}
        <h3 className={styles.splitTitle}>{title}</h3>
        <div className={styles.prose}>{children}</div>
      </div>
      <div className={styles.splitMedia} data-reveal={reverse ? 'fade-right' : 'fade-left'}>
        {media}
      </div>
    </div>
  );
}

/**
 * Short facts with a big value.
 * @param {{ items: Array<{ value: import('react').ReactNode, label: string, note?: string }> }} props
 */
export function FactCards({ items }) {
  return (
    <ul className={styles.facts}>
      {items.map(({ value, label, note }, index) => (
        <li key={label} className={styles.fact} data-reveal="fade-up" style={{ '--reveal-delay': `${index * 60}ms` }}>
          <strong className={styles.factValue}>{value}</strong>
          <span className={styles.factLabel}>{label}</span>
          {note && <span className={styles.factNote}>{note}</span>}
        </li>
      ))}
    </ul>
  );
}

/**
 * Checklist with tick marks.
 * @param {{ items: import('react').ReactNode[], tone?: 'good' | 'bad' }} props
 */
export function CheckList({ items, tone = 'good' }) {
  return (
    <ul className={cn(styles.checks, tone === 'bad' && styles.checksBad)}>
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

/**
 * The dark closing band — full width, edge to edge — with a title, a line and buttons.
 * @param {{ title: import('react').ReactNode, text?: import('react').ReactNode, actions: import('react').ReactNode }} props
 */
export function CtaBand({ title, text, actions }) {
  return (
    <section className={styles.ctaSection}>
      <Container>
        <div className={styles.cta} data-reveal="zoom-in">
          <div>
            <h2 className={styles.ctaTitle}>{title}</h2>
            {text && <p className={styles.ctaText}>{text}</p>}
          </div>
          <div className={styles.ctaActions}>{actions}</div>
        </div>
      </Container>
    </section>
  );
}
