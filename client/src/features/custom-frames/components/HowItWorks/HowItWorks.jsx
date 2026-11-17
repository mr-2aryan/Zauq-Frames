import { useId } from 'react';
import { Container } from '@/components/ui';
import { HOW_IT_WORKS_STEPS } from '../../data/content.js';
import styles from './HowItWorks.module.css';

/** Four-step explainer on a full-width dark band. */
export function HowItWorks({ steps = HOW_IT_WORKS_STEPS }) {
  const headingId = useId();

  return (
    <section id="how" className={styles.band} aria-labelledby={headingId}>
      <Container>
        <header className={styles.header} data-reveal="fade-up">
          <p className={styles.kicker}>From photo to wall</p>
          <h2 id={headingId} className={styles.title}>
            How it <span className={styles.light}>works</span>
          </h2>
        </header>
        <ol className={styles.steps}>
          {steps.map((step, index) => (
            <li key={step.title} className={styles.step} data-reveal="fade-up" style={{ '--reveal-delay': `${index * 100}ms` }}>
              <span className={styles.number}>{index + 1}</span>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepText}>{step.text}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
