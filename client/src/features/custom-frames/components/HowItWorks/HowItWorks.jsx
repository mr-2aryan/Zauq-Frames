import { useId } from 'react';
import { Panel, Section } from '@/components/ui';
import { HOW_IT_WORKS_STEPS } from '../../data/content.js';
import styles from './HowItWorks.module.css';

/** Four-step explainer on a dark panel. */
export function HowItWorks({ steps = HOW_IT_WORKS_STEPS }) {
  const headingId = useId();

  return (
    <Section id="how" aria-labelledby={headingId}>
      <Panel tone="dark" className={styles.panel}>
        <h2 id={headingId} className={styles.title}>
          How it works
        </h2>
        <ol className={styles.steps}>
          {steps.map((step, index) => (
            <li key={step.title} className={styles.step}>
              <span className={styles.number}>{index + 1}</span>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepText}>{step.text}</p>
            </li>
          ))}
        </ol>
      </Panel>
    </Section>
  );
}
