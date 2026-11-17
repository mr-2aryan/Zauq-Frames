import { useId } from 'react';
import { ArrowRightIcon, UploadIcon } from '@/components/icons';
import { Button, Container } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { SITE } from '@/config/site';
import styles from './FrameCta.module.css';

/** Closing "Ready to frame it?" — a full-width band, edge to edge. */
export function FrameCta() {
  const headingId = useId();

  return (
    <section className={styles.band} aria-labelledby={headingId}>
      <Container className={styles.inner} data-reveal="fade-up">
        <p className={styles.kicker}>Your photo, framed</p>
        <h2 id={headingId} className={styles.title}>
          Ready to <span className={styles.light}>frame it?</span>
        </h2>
        <p className={styles.text}>
          Upload an image and see it framed before you order — printed, framed by hand and at your door in {SITE.leadTime}.
        </p>
        <div className={styles.actions}>
          <Button href="#builder" size="lg">
            <UploadIcon size={18} /> Start designing
          </Button>
          <Button to={ROUTES.sizes} variant="secondary" size="lg">
            Compare sizes <ArrowRightIcon size={16} />
          </Button>
        </div>
      </Container>
    </section>
  );
}
