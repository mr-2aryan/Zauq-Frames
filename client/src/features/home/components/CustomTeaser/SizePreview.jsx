import { useId } from 'react';
import { cn } from '@/utils/cn';
import { formatSizeLabel } from '@/utils/frames';
import { formatPrice } from '@/utils/formatPrice';
import styles from './SizePreview.module.css';

/** On-screen length of the frame's long side: 10 in shows at MIN_PX, the largest size at MAX_PX (scaled on phones). */
const MIN_PX = 140;
const MAX_PX = 320;
const MIN_IN = 10;

/** Pixels per inch for a frame, so small sizes stay easy to see while bigger ones visibly grow. */
function pixelsPerInch(longSide, maxIn) {
  const px = MIN_PX + ((longSide - MIN_IN) * (MAX_PX - MIN_PX)) / Math.max(1, maxIn - MIN_IN);
  return px / longSide;
}

const ORIENTATIONS = [
  { value: 'portrait', label: 'Portrait' },
  { value: 'landscape', label: 'Landscape' },
];

/**
 * The customer's photo in one frame that grows, shrinks and turns as they pick
 * a size and orientation from the radio buttons below it. Proportions are
 * exact; sizes grow on a compressed scale so 8 × 10 in is still easy to see.
 * @param {{
 *   photoUrl: string,
 *   sizes: import('@/services/framesApi').FrameSize[],
 *   currency: string,
 *   sizeId: string,
 *   orientation: 'portrait' | 'landscape',
 *   crop: ReturnType<typeof import('@/features/custom-frames').useCropPosition>,
 *   onSizeChange: (sizeId: string) => void,
 *   onOrientationChange: (orientation: 'portrait' | 'landscape') => void,
 * }} props
 */
export function SizePreview({ photoUrl, sizes, currency, sizeId, orientation, crop, onSizeChange, onOrientationChange }) {
  const name = useId();
  const hintId = useId();
  const size = sizes.find((option) => option.id === sizeId) ?? sizes[0];
  const [w, h] = orientation === 'landscape' ? [size.height, size.width] : [size.width, size.height];
  const maxIn = Math.max(...sizes.map((option) => option.height));

  return (
    <div className={styles.preview}>
      <div className={styles.wall}>
        {/* Drag (or arrow-key) the photo to place it; the order keeps this placement. */}
        <div
          role="group"
          aria-roledescription="adjustable photo"
          aria-label="Photo position in frame"
          aria-describedby={hintId}
          tabIndex={0}
          className={cn(styles.frame, crop.isDragging && styles.dragging)}
          style={{ '--w': w, '--h': h, '--ppi': `${pixelsPerInch(Math.max(w, h), maxIn)}px` }}
          {...crop.handlers}
        >
          <img
            src={photoUrl}
            alt={`Your photo in a ${formatSizeLabel({ width: w, height: h }, { unit: true })} frame`}
            draggable={false}
            className={styles.photo}
            style={{ objectPosition: `${crop.position.x}% ${crop.position.y}%` }}
          />
        </div>
        <span className={styles.dimension}>
          {formatSizeLabel({ width: w, height: h }, { unit: true })}
          <span id={hintId} className={styles.hint}>
            {' '}
            · drag to position
          </span>
        </span>
      </div>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Size</legend>
        <div className={styles.sizes}>
          {sizes.map((option) => (
            <label key={option.id} className={cn(styles.chip, option.id === size.id && styles.checked)}>
              <input
                type="radio"
                name={`${name}-size`}
                value={option.id}
                checked={option.id === size.id}
                onChange={() => onSizeChange(option.id)}
                className="sr-only"
              />
              <span className={styles.chipSize}>{formatSizeLabel(option)}</span>
              <span className={styles.chipPrice}>{formatPrice(option.salePrice, currency)}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Orientation</legend>
        <div className={styles.toggle}>
          {ORIENTATIONS.map((option) => (
            <label key={option.value} className={cn(styles.toggleOption, option.value === orientation && styles.checked)}>
              <input
                type="radio"
                name={`${name}-orientation`}
                value={option.value}
                checked={option.value === orientation}
                onChange={() => onOrientationChange(option.value)}
                className="sr-only"
              />
              <span aria-hidden="true" className={cn(styles.shape, styles[option.value])}></span>
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
