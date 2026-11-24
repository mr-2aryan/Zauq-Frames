import { useId } from 'react';
import { Chip } from '@/components/ui';
import { formatOrientation } from '@/utils/frames';
import styles from './OrientationToggle.module.css';

/**
 * Portrait / landscape choice.
 * @param {{ options: string[], value: string, onChange: (value: string) => void }} props
 */
export function OrientationToggle({ options, value, onChange }) {
  const nameId = useId();
  return (
    <div className={styles.row}>
      <span id={nameId} className={styles.name}>
        Orientation
      </span>
      <div role="group" aria-labelledby={nameId} className={styles.toggle}>
        {options.map((option) => (
          <Chip key={option} shape="tile" selected={option === value} onClick={() => onChange(option)} className={styles.option}>
            {formatOrientation(option)}
          </Chip>
        ))}
      </div>
    </div>
  );
}
