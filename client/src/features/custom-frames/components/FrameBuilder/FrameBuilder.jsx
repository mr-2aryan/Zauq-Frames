import { useId, useState } from 'react';
import { useAddCustomFrame } from '../../hooks/useAddCustomFrame.js';
import { useCropPosition } from '../../hooks/useCropPosition.js';
import { usePhotoFile } from '../../hooks/usePhotoFile.js';
import { BuilderStep } from './BuilderStep.jsx';
import { FramePreview } from './FramePreview.jsx';
import { OrderSummary } from './OrderSummary.jsx';
import { OrientationToggle } from './OrientationToggle.jsx';
import { PhotoDropzone } from './PhotoDropzone.jsx';
import { SizePicker } from './SizePicker.jsx';
import styles from './FrameBuilder.module.css';

/**
 * Interactive custom-frame configurator: live preview on the left,
 * the three ordering steps on the right.
 *
 * @param {{ catalog: import('@/services/framesApi').FrameCatalog }} props
 */
export function FrameBuilder({ catalog }) {
  const { sizes, currency, finish, orientations, promotion } = catalog;
  const inputId = useId();

  const [sizeId, setSizeId] = useState(sizes[0]?.id);
  const [orientation, setOrientation] = useState(orientations[0] ?? 'portrait');
  const photo = usePhotoFile();
  const crop = useCropPosition(photo.previewUrl);
  const { addCustomFrame, isSubmitting, error: orderError, clearError } = useAddCustomFrame();

  const size = sizes.find((option) => option.id === sizeId) ?? sizes[0];

  const handleSelectPhoto = (file) => {
    if (photo.select(file)) clearError();
  };

  const handleAddToCart = () => addCustomFrame({ file: photo.file, size, orientation, crop: crop.position, currency });

  return (
    <div className={styles.workspace}>
      <FramePreview size={size} orientation={orientation} photoUrl={photo.previewUrl} crop={crop} inputId={inputId} />

      <div className={styles.controls}>
        <BuilderStep number={1} title="Upload your photo">
          <PhotoDropzone inputId={inputId} fileName={photo.file?.name} error={photo.error} onSelect={handleSelectPhoto} onRemove={photo.clear} />
        </BuilderStep>

        <BuilderStep number={2} title="Choose size & orientation" as="fieldset">
          <SizePicker sizes={sizes} selectedId={size.id} currency={currency} onSelect={setSizeId} />
          <OrientationToggle options={orientations} value={orientation} onChange={setOrientation} />
        </BuilderStep>

        <BuilderStep number={3} title="Add to cart">
          <OrderSummary
            size={size}
            currency={currency}
            finish={finish}
            percentOff={promotion.percentOff}
            isSubmitting={isSubmitting}
            error={orderError}
            onAddToCart={handleAddToCart}
          />
        </BuilderStep>

        <p className={styles.note}>Your photo is fitted to the frame exactly as shown. We check every file and contact you before printing if anything needs attention.</p>
      </div>
    </div>
  );
}
