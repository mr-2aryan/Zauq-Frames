import { useId, useState } from 'react';
import { cn } from '@/utils/cn';
import styles from './FaqList.module.css';

/**
 * Question / answer accordion. One answer is open at a time; answers slide
 * open and closed smoothly. Collapsed answers are `inert`, so keyboard users
 * never tab into hidden links.
 * @param {{ items: Array<{ question: string, answer: import('react').ReactNode }>, defaultOpen?: number, className?: string }} props
 */
export function FaqList({ items, defaultOpen = 0, className }) {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState(defaultOpen);

  return (
    <div className={cn(styles.list, className)}>
      {items.map(({ question, answer }, index) => {
        const open = index === openIndex;
        const buttonId = `${baseId}-q${index}`;
        const panelId = `${baseId}-a${index}`;
        return (
          <div key={question} className={cn(styles.item, open && styles.open)}>
            <h3 className={styles.heading}>
              <button
                id={buttonId}
                type="button"
                className={styles.question}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenIndex(open ? -1 : index)}
              >
                {question}
                <span aria-hidden="true" className={styles.marker}></span>
              </button>
            </h3>
            <div id={panelId} role="region" aria-labelledby={buttonId} className={styles.panel} inert={!open}>
              <div className={styles.panelInner}>
                <div className={styles.answer}>{answer}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
