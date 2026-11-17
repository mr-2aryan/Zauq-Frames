import { useEffect, useId, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRightIcon, UploadIcon } from '@/components/icons';
import { Button, Container } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { SITE } from '@/config/site';
import { useCatalog } from '@/context/catalog/useCatalog';
import { handOffPhoto, PHOTO_RULES, useCropPosition, usePhotoFile } from '@/features/custom-frames';
import { formatSizeLabel } from '@/utils/frames';
import { formatPrice } from '@/utils/formatPrice';
import { SizePreview } from './SizePreview.jsx';
import styles from './CustomTeaser.module.css';

/** The size picked first once a photo is chosen. */
const DEFAULT_SIZE_ID = '18x24';

/** Starting price and size range for custom frames, from the live catalogue. */
function catalogFacts(catalog) {
  if (!catalog) return null;
  const { sizes, currency, deliveryFee } = catalog;
  const cheapest = Math.min(...sizes.map((size) => size.salePrice));
  return {
    from: formatPrice(cheapest, currency),
    range: `${formatSizeLabel(sizes[0])} to ${formatSizeLabel(sizes[sizes.length - 1], { unit: true })}`,
    sizeCount: sizes.length,
    delivery: formatPrice(deliveryFee, currency),
  };
}

/**
 * "Your photo, framed by hand." — full-width band. Visitors can upload a photo
 * right here, see it framed in every size to scale, then carry it into the
 * full builder to order.
 */
export function CustomTeaser() {
  const headingId = useId();
  const inputId = useId();
  const navigate = useNavigate();
  const { catalog } = useCatalog();
  const facts = catalogFacts(catalog);
  const photo = usePhotoFile();
  const crop = useCropPosition(photo.previewUrl);
  const [sizeId, setSizeId] = useState(DEFAULT_SIZE_ID);
  const [orientation, setOrientation] = useState('portrait');

  // Frame the photo the way it was taken.
  useEffect(() => {
    if (!photo.previewUrl) return undefined;
    const image = new Image();
    image.onload = () => setOrientation(image.naturalWidth > image.naturalHeight ? 'landscape' : 'portrait');
    image.src = photo.previewUrl;
    return () => {
      image.onload = null;
    };
  }, [photo.previewUrl]);

  const size = catalog?.sizes.find((option) => option.id === sizeId) ?? catalog?.sizes[0];

  const handleFile = (event) => {
    photo.select(event.target.files?.[0]);
    // Let the same file be picked again after "Change photo".
    event.target.value = '';
  };

  const orderThisFrame = () => {
    handOffPhoto({ file: photo.file, sizeId: size.id, orientation, crop: crop.position });
    navigate(`${ROUTES.customFrames}#builder`);
  };

  const steps = [
    { title: 'Upload', text: `JPG or PNG, up to ${PHOTO_RULES.maxMb} MB` },
    { title: 'Preview', text: `${facts?.sizeCount ?? 5} sizes, portrait or landscape` },
    { title: 'Delivered', text: facts ? `${facts.delivery} to any city` : 'Anywhere in Pakistan' },
  ];

  return (
    <section aria-labelledby={headingId} className={styles.band}>
      <Container className={styles.inner}>
        <div className={styles.copy} data-reveal="fade-up">
          <p className={styles.kicker}>Custom frames</p>
          <h2 id={headingId} className={styles.title}>
            Your photo,
            <span className={styles.light}> framed by hand.</span>
          </h2>
          <p className={styles.lead}>
            Upload any photo, try it in every size before you order, and we’ll print, frame and deliver it to your door in {SITE.leadTime}.
          </p>

          <ol className={styles.steps}>
            {steps.map((step, index) => (
              <li key={step.title} className={styles.step}>
                <span className={styles.number}>{String(index + 1).padStart(2, '0')}</span>
                <strong className={styles.stepTitle}>{step.title}</strong>
                <span className={styles.stepText}>{step.text}</span>
              </li>
            ))}
          </ol>

          <div className={styles.actions}>
            <input id={inputId} type="file" accept={PHOTO_RULES.accept} className="sr-only" onChange={handleFile} />
            <label htmlFor={inputId} className={styles.upload}>
              <UploadIcon size={18} />
              {photo.previewUrl ? 'Change photo' : 'Upload your photo'}
            </label>
            {facts && (
              <span className={styles.from}>
                From <strong>{facts.from}</strong> · {facts.range}
              </span>
            )}
          </div>
          {photo.error && (
            <p className={styles.error} role="alert">
              {photo.error}
            </p>
          )}
        </div>

        {photo.previewUrl && catalog ? (
          <div className={styles.preview} aria-live="polite">
            <p className={styles.previewTitle}>Your photo, framed</p>
            <SizePreview
              photoUrl={photo.previewUrl}
              sizes={catalog.sizes}
              currency={catalog.currency}
              sizeId={size.id}
              orientation={orientation}
              crop={crop}
              onSizeChange={setSizeId}
              onOrientationChange={setOrientation}
            />
            <div className={styles.order}>
              <p className={styles.choice}>
                <strong>{formatSizeLabel(orientation === 'landscape' ? { width: size.height, height: size.width } : size, { unit: true })}</strong>
                {' · '}
                {formatPrice(size.salePrice, catalog.currency)}
                {size.salePrice < size.price && <s className={styles.was}>{formatPrice(size.price, catalog.currency)}</s>}
              </p>
              <Button size="lg" onClick={orderThisFrame}>
                Order this frame <ArrowRightIcon size={18} />
              </Button>
            </div>
          </div>
        ) : (
          <div className={styles.visual} aria-hidden="true" data-reveal="fade-left" style={{ '--reveal-delay': '150ms' }}>
            <figure className={styles.snapshot}>
              <img src="/images/hero/vinyl-dance.jpg" alt="" className={styles.snapshotImage} />
              <figcaption>Your photo</figcaption>
            </figure>
            <svg className={styles.arrow} viewBox="0 0 150 90">
              <path d="M6 70 C 50 6, 100 6, 140 40" className={styles.arrowLine} />
              <path d="M128 28 L141 41 L124 47" className={styles.arrowHead} />
            </svg>
            <figure className={styles.framed}>
              <span className={styles.frame}>
                <img src="/images/site/hero-vinyl-dark.jpg" alt="" className={styles.framedImage} />
              </span>
              <figcaption>
                <strong>Framed</strong> · 18 × 24 in, black frame
              </figcaption>
            </figure>
          </div>
        )}
      </Container>
    </section>
  );
}
