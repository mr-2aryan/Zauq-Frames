import { CheckIcon } from '@/components/icons';
import { cn } from '@/utils/cn';
import { formatDay, ORDER_STEPS } from '../../orderSteps.js';
import styles from './OrderTimeline.module.css';

/**
 * The five order stages on a line (a column on phones). Given a `status`,
 * stages up to it are done (with their dates) and the current one pulses;
 * without one it simply explains each stage.
 * @param {{ status?: string, history?: Array<{ status: string, at: string }> }} props
 */
export function OrderTimeline({ status, history = [] }) {
  const current = status ? ORDER_STEPS.findIndex((step) => step.status === status) : -1;
  const reachedAt = (stepStatus) => history.find((entry) => entry.status === stepStatus)?.at;
  const guide = !status;

  return (
    <ol className={cn(styles.timeline, guide && styles.guide)}>
      {ORDER_STEPS.map(({ status: stepStatus, label, description, Icon }, index) => {
        const done = !guide && index < current;
        const now = !guide && index === current;
        const at = reachedAt(stepStatus);
        return (
          <li key={stepStatus} className={cn(styles.step, done && styles.done, now && styles.current)} aria-current={now ? 'step' : undefined}>
            <span className={styles.dot} aria-hidden="true">
              {done ? <CheckIcon size={16} /> : <Icon size={17} />}
            </span>
            <span className={styles.text}>
              <span className={styles.label}>{label}</span>
              {!guide && (done || now) && at && <span className={styles.date}>{formatDay(at)}</span>}
              {(guide || now) && <span className={styles.description}>{description}</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
