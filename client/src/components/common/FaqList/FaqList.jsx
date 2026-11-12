import { cn } from '@/utils/cn';
import styles from './FaqList.module.css';

/**
 * Question / answer accordion built on <details>, so it works without JavaScript.
 * @param {{ items: Array<{ question: string, answer: import('react').ReactNode }>, className?: string }} props
 */
export function FaqList({ items, className }) {
  return (
    <div className={cn(styles.list, className)}>
      {items.map(({ question, answer }, index) => (
        <details key={question} className={styles.item} open={index === 0}>
          <summary className={styles.question}>
            {question}
            <span aria-hidden="true" className={styles.marker}></span>
          </summary>
          <div className={styles.answer}>{answer}</div>
        </details>
      ))}
    </div>
  );
}
