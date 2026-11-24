import { useId } from 'react';
import { Chip } from '@/components/ui';
import { MAT_LABELS } from '@/utils/frames';
import styles from './OrientationToggle.module.css';

/**
 * No mat (the photo fills the frame) or a white mat around it — free either way.
 * @param {{ options: string[], value: string, onChange: (value: string) => void }} props
 */
export function MatToggle({ options, value, onChange }) {
  const nameId = useId();
  return (
    <div className={styles.row}>
      <span id={nameId} className={styles.name}>
        Mat <span>Free</span>
      </span>
      <div role="group" aria-labelledby={nameId} className={styles.toggle}>
        {options.map((option) => (
          <Chip key={option} shape="tile" selected={option === value} onClick={() => onChange(option)} className={styles.option}>
            {MAT_LABELS[option] ?? option}
          </Chip>
        ))}
      </div>
      <p className={styles.hint}>{value === 'white' ? 'A white border between the frame and your photo.' : 'Your photo fills the frame, edge to edge.'}</p>
    </div>
  );
}
