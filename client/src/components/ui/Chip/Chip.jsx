import { cn } from '@/utils/cn';
import styles from './Chip.module.css';

/**
 * Toggle pill (filters, sizes, options). Announces its state with `aria-pressed`.
 * @param {{ selected?: boolean, shape?: 'pill' | 'tile', className?: string } & Record<string, any>} props
 */
export function Chip({ selected = false, shape = 'pill', className, children, ...rest }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(styles.chip, styles[shape], selected && styles.selected, className)}
      {...rest}
    >
      {children}
    </button>
  );
}
