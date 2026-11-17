import { useId } from 'react';
import { HeartIcon, MountainIcon, PaletteIcon, PenNibIcon, UploadIcon, UsersIcon } from '@/components/icons';
import { Button, Section } from '@/components/ui';
import { cn } from '@/utils/cn';
import { OCCASIONS } from '../../data/content.js';
import styles from './Occasions.module.css';

const ICONS = { family: UsersIcon, wedding: HeartIcon, travel: MountainIcon, calligraphy: PenNibIcon, design: PaletteIcon };

/**
 * "Some moments deserve more than a phone gallery": the pitch on the left, and
 * a card per kind of photo people frame — a small framed motif, a line of text
 * and a suggested size.
 */
export function Occasions({ items = OCCASIONS }) {
  const headingId = useId();

  return (
    <Section aria-labelledby={headingId}>
      <div className={styles.layout}>
        <div className={styles.intro} data-reveal="fade-right">
          <p className={styles.kicker}>What people frame</p>
          <h2 id={headingId} className={styles.title}>
            Some moments deserve more <span className={styles.light}>than a phone gallery.</span>
          </h2>
          <p className={styles.text}>The photos you scroll past every day — printed, framed by hand and hung where the whole family sees them.</p>
          <Button href="#builder" size="lg">
            <UploadIcon size={18} /> Upload your photo
          </Button>
        </div>

        <ul className={styles.cards}>
          {items.map(({ label, icon, tone, text, sizes }, index) => {
            const Icon = ICONS[icon] ?? PaletteIcon;
            return (
              <li key={label} className={cn(styles.card, index === 0 && styles.cardWide)} data-reveal="fade-up" style={{ '--reveal-delay': `${index * 70}ms` }}>
                <span className={cn(styles.frame, styles[tone])} aria-hidden="true">
                  <span className={styles.art}>
                    <Icon size={30} />
                  </span>
                </span>
                <span className={styles.body}>
                  <strong className={styles.cardTitle}>{label}</strong>
                  <span className={styles.cardText}>{text}</span>
                  <span className={styles.size}>Suggested · {sizes}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}
