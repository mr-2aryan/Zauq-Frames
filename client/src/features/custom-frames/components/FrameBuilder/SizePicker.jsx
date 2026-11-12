import { Chip } from '@/components/ui';
import { formatSizeLabel } from '@/utils/frames';
import { formatPrice } from '@/utils/formatPrice';
import styles from './SizePicker.module.css';

/**
 * Grid of size tiles with prices.
 * @param {{ sizes: import('@/services/framesApi').FrameSize[], selectedId: string, currency: string, onSelect: (id: string) => void }} props
 */
export function SizePicker({ sizes, selectedId, currency, onSelect }) {
  return (
    <div className={styles.grid}>
      {sizes.map((size) => (
        <Chip key={size.id} shape="tile" selected={size.id === selectedId} onClick={() => onSelect(size.id)}>
          <span className={styles.label}>{formatSizeLabel(size)}</span>
          <span className={styles.price}>{formatPrice(size.salePrice, currency)}</span>
        </Chip>
      ))}
    </div>
  );
}
