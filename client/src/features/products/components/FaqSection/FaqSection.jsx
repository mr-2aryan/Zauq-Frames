import { useId } from 'react';
import { FaqList } from '@/components/common';
import { WhatsAppIcon } from '@/components/icons';
import { Button, Section } from '@/components/ui';
import { SITE, whatsappLink } from '@/config/site';
import styles from './FaqSection.module.css';

/**
 * An FAQ block: a heading and a WhatsApp prompt on the left, the accordion
 * on the right (stacked on narrow screens). Used on the shop and product pages.
 * @param {{
 *   title: string,
 *   titleLight: string,
 *   text: string,
 *   whatsappMessage: string,
 *   items: Array<{ question: string, answer: import('react').ReactNode }>,
 *   headingLevel?: 2 | 1,
 * }} props
 */
export function FaqSection({ title, titleLight, text, whatsappMessage, items, headingLevel = 2 }) {
  const headingId = useId();
  const Heading = `h${headingLevel}`;

  return (
    <Section aria-labelledby={headingId}>
      <div className={styles.layout}>
        <div data-reveal="fade-right">
          <p className={styles.kicker}>FAQs</p>
          <Heading id={headingId} className={styles.title}>
            {title} <span className={styles.light}>{titleLight}</span>
          </Heading>
          <p className={styles.text}>{text}</p>
          <div className={styles.card}>
            <strong>Still have a question?</strong>
            <span>We reply on WhatsApp, {SITE.hours}.</span>
            <Button href={whatsappLink(whatsappMessage)} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon size={18} /> Ask on WhatsApp
            </Button>
          </div>
        </div>
        <div data-reveal="fade-up" style={{ '--reveal-delay': '100ms' }}>
          <FaqList items={items} />
        </div>
      </div>
    </Section>
  );
}
