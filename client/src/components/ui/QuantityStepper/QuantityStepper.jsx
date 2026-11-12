import { useId } from 'react';
import { cn } from '@/utils/cn';
import styles from './QuantityStepper.module.css';

/**
 * − [n] + control.
 * @param {{ value: number, onChange: (value: number) => void, min?: number, max?: number, label?: string, size?: 'sm' | 'md', className?: string }} props
 */
export function QuantityStepper({ value, onChange, min = 1, max = 20, label = 'Quantity', size = 'md', className }) {
  const id = useId();
  const set = (next) => onChange(Math.min(max, Math.max(min, next)));

  return (
    <div className={cn(styles.stepper, styles[size], className)}>
      <button type="button" className={styles.button} aria-label={`Decrease ${label.toLowerCase()}`} disabled={value <= min} onClick={() => set(value - 1)}>
        −
      </button>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        className={styles.input}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        onChange={(event) => set(Number.parseInt(event.target.value, 10) || min)}
      />
      <button type="button" className={styles.button} aria-label={`Increase ${label.toLowerCase()}`} disabled={value >= max} onClick={() => set(value + 1)}>
        +
      </button>
    </div>
  );
}
