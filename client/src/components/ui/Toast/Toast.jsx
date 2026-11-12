import { cn } from '@/utils/cn';
import styles from './Toast.module.css';

/**
 * Bottom-centre status pill. The live region stays mounted so screen
 * readers announce each new message. Driven by `ToastProvider`.
 */
export function Toast({ message, visible }) {
  return (
    <div role="status" aria-live="polite" className={cn(styles.toast, visible && styles.visible)}>
      {message}
    </div>
  );
}
