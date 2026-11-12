import { useId } from 'react';
import { Button, Panel, Section } from '@/components/ui';
import styles from './FrameCta.module.css';

/** Closing "Ready to frame it?" call to action. */
export function FrameCta() {
  const headingId = useId();

  return (
    <Section aria-labelledby={headingId}>
      <Panel tone="tint" className={styles.panel}>
        <h2 id={headingId} className={styles.title}>
          Ready to frame it?
        </h2>
        <p className={styles.text}>Upload an image and see it framed before you order.</p>
        <Button href="#builder" size="lg">
          Start designing
        </Button>
      </Panel>
    </Section>
  );
}
