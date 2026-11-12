import { Chip } from '@/components/ui';
import { formatOrientation } from '@/utils/frames';
import styles from './OrientationToggle.module.css';

/**
 * Portrait / landscape choice.
 * @param {{ options: string[], value: string, onChange: (value: string) => void }} props
 */
export function OrientationToggle({ options, value, onChange }) {
  return (
    <div role="group" aria-label="Orientation" className={styles.toggle}>
      {options.map((option) => (
        <Chip key={option} shape="tile" selected={option === value} onClick={() => onChange(option)} className={styles.option}>
          {formatOrientation(option)}
        </Chip>
      ))}
    </div>
  );
}
