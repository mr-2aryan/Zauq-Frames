import { useId, useRef, useState } from 'react';
import { PageHero } from '@/components/common';
import { ArrowRightIcon, CheckCircleIcon, UploadIcon } from '@/components/icons';
import { Button } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { SITE } from '@/config/site';
import { useCatalog } from '@/context/catalog/useCatalog';
import { cn } from '@/utils/cn';
import { formatPrice } from '@/utils/formatPrice';
import { HERO_HIGHLIGHTS, PHOTO_RULES } from '../../data/content.js';
import { handOffPhoto } from '../../data/photoHandoff.js';
import { usePhotoFile } from '../../hooks/usePhotoFile.js';
import styles from './CustomHero.module.css';

/**
 * The custom frames hero (the shared PageHero): the pitch on the left and, on
 * the right, an empty frame that takes the visitor's photo — drop or pick one
 * and it appears framed; "Choose a size" hands it to the builder below.
 */
export function CustomHero() {
  const inputId = useId();
  const inputRef = useRef(null);
  const { catalog } = useCatalog();
  const photo = usePhotoFile();
  const [dragging, setDragging] = useState(false);
  // Non-breaking, so "Rs 1,500" never splits across lines.
  const startingPrice = catalog ? formatPrice(Math.min(...catalog.sizes.map((size) => size.salePrice)), catalog.currency).replace(' ', ' ') : null;

  const continueToBuilder = () => {
    handOffPhoto({ file: photo.file, orientation: 'portrait', crop: { x: 50, y: 50 } });
    document.getElementById('builder')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const frame = (
    <div
      className={styles.upload}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        photo.select(event.dataTransfer.files?.[0]);
      }}
    >
      <div className={cn(styles.frame, photo.previewUrl && styles.frameFilled)}>
        <label htmlFor={inputId} className={cn(styles.slot, dragging && styles.slotDragging)}>
          {photo.previewUrl ? (
            <img key={photo.previewUrl} src={photo.previewUrl} alt="Your photo, framed" className={styles.yourPhoto} />
          ) : (
            <span className={styles.placeholder}>
              <span className={styles.placeholderIcon} aria-hidden="true">
                <UploadIcon size={26} />
              </span>
              <strong>Your photo here</strong>
              <span>Drop it in, or tap to upload</span>
            </span>
          )}
        </label>
      </div>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={PHOTO_RULES.accept}
        className="sr-only"
        onChange={(event) => {
          photo.select(event.target.files?.[0]);
          event.target.value = '';
        }}
      />

      {(photo.previewUrl || photo.error) && (
        <div className={styles.card} role="status">
          {photo.error ? (
            <p className={styles.cardError}>{photo.error}</p>
          ) : (
            <>
              <span className={styles.cardText}>
                <strong>Looks great framed!</strong>
                <span>Choose a size and finish your order below.</span>
              </span>
              <Button onClick={continueToBuilder}>
                Choose a size <ArrowRightIcon size={16} />
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );

  return (
    <PageHero
      breadcrumbs={[{ label: 'Home', to: ROUTES.home }, { label: 'Custom frames' }]}
      kicker="Custom photo frames"
      title={
        <>
          Your photo,
          <br />
        </>
      }
      titleLight="beautifully framed."
      lead={`Upload any photo and see it framed in seconds. We print it, frame it by hand in Rawalpindi and deliver it anywhere in Pakistan in ${SITE.leadTime}${startingPrice ? ` — from ${startingPrice}` : ''}.`}
      actions={
        <>
          <Button size="lg" onClick={() => inputRef.current?.click()}>
            <UploadIcon size={18} /> Upload your photo
          </Button>
          <Button href="#how" variant="secondary" size="lg">
            See how it works
          </Button>
        </>
      }
      media={frame}
    >
      <ul className={styles.highlights}>
        {HERO_HIGHLIGHTS.map((item) => (
          <li key={item.label}>
            <CheckCircleIcon size={18} />
            <span>
              <strong>{item.label}</strong> · {item.value}
            </span>
          </li>
        ))}
      </ul>
    </PageHero>
  );
}
