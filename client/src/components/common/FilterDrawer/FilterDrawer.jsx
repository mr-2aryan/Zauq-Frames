import { useEffect, useId, useRef } from 'react';
import { CloseIcon } from '@/components/icons';
import { Button } from '@/components/ui';
import styles from './FilterDrawer.module.css';

/**
 * Filters in a full-height drawer from the left, over a blurred page. A native
 * modal <dialog>, so focus stays inside and Esc closes it.
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   title?: string,
 *   applyLabel: string,
 *   onClear?: () => void,
 *   children: import('react').ReactNode,
 * }} props
 */
export function FilterDrawer({ open, onClose, title = 'Filters', applyLabel, onClear, children }) {
  const dialogRef = useRef(null);
  const pressedBackdrop = useRef(false);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    // The dialog itself is only "hit" on the backdrop; the panel fills it.
    <dialog
      ref={dialogRef}
      className={styles.drawer}
      aria-labelledby={titleId}
      onClose={onClose}
      onMouseDown={(event) => {
        pressedBackdrop.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        if (pressedBackdrop.current && event.target === event.currentTarget) onClose();
      }}
    >
      <div className={styles.panel}>
        <header className={styles.top}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <button type="button" className={styles.close} aria-label="Close filters" onClick={onClose}>
            <CloseIcon size={20} />
          </button>
        </header>

        <div className={styles.body}>{children}</div>

        <footer className={styles.footer}>
          {onClear && (
            <button type="button" className={styles.clear} onClick={onClear}>
              Clear all
            </button>
          )}
          <Button onClick={onClose} className={styles.apply}>
            {applyLabel}
          </Button>
        </footer>
      </div>
    </dialog>
  );
}
