import { useId } from 'react';
import { ImageIcon } from '@/components/icons';
import { Badge } from '@/components/ui';
import { cn } from '@/utils/cn';
import { formatOrientation, formatSizeLabel } from '@/utils/frames';
import { getPreviewGeometry } from '../../utils/frameGeometry.js';
import styles from './FramePreview.module.css';

/**
 * Live, to-proportion preview of the frame.
 * Empty: a label that opens the file picker. With a photo: a draggable crop.
 *
 * @param {{
 *   size: { width: number, height: number },
 *   orientation: 'portrait' | 'landscape',
 *   photoUrl: string | null,
 *   crop: ReturnType<typeof import('../../hooks/useCropPosition.js').useCropPosition>,
 *   inputId: string,
 * }} props
 */
export function FramePreview({ size, orientation, photoUrl, crop, inputId }) {
  const hintId = useId();
  const { width, aspectRatio } = getPreviewGeometry(size, orientation);
  const frameStyle = { width: `${width}px`, aspectRatio };

  return (
    <div className={styles.stage}>
      <Badge className={styles.caption}>
        Live preview · {formatSizeLabel(size, { unit: true })} · {formatOrientation(orientation)}
      </Badge>

      {photoUrl ? (
        <>
          <div
            role="group"
            aria-roledescription="adjustable photo"
            aria-label="Photo position in frame"
            aria-describedby={hintId}
            tabIndex={0}
            className={cn(styles.frame, styles.filled, crop.isDragging && styles.dragging)}
            style={frameStyle}
            {...crop.handlers}
          >
            <img
              src={photoUrl}
              alt="Your uploaded photo in the frame preview"
              draggable={false}
              className={styles.photo}
              style={{ objectPosition: `${crop.position.x}% ${crop.position.y}%` }}
            />
          </div>
          <p id={hintId} className={styles.hint}>
            Drag the photo (or use the arrow keys) to adjust the crop
          </p>
        </>
      ) : (
        <label htmlFor={inputId} className={cn(styles.frame, styles.empty)} style={frameStyle}>
          <ImageIcon size={38} />
          <span className={styles.emptyTitle}>Your photo goes here</span>
          <span className={styles.emptyText}>Upload to see it framed</span>
        </label>
      )}
    </div>
  );
}
