import { useId, useMemo } from 'react';
import { FaqList } from '@/components/common';
import { Section } from '@/components/ui';
import { useCatalog } from '@/context/catalog/useCatalog';
import { getCustomFrameFaqs } from '../../data/faqs.jsx';
import styles from './CustomFrameFaq.module.css';

/** Custom-frame FAQs. Pricing answers use live catalogue data when available. */
export function CustomFrameFaq() {
  const headingId = useId();
  const { catalog } = useCatalog();
  const faqs = useMemo(() => getCustomFrameFaqs(catalog), [catalog]);

  return (
    <Section aria-labelledby={headingId}>
      <div className={styles.layout}>
        <h2 id={headingId} className={styles.title}>
          Custom frame questions
        </h2>
        <FaqList items={faqs} className={styles.list} />
      </div>
    </Section>
  );
}
