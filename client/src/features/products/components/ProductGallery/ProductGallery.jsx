import { useState } from 'react';
import { cn } from '@/utils/cn';
import styles from './ProductGallery.module.css';

/**
 * Main image with selectable thumbnails.
 * @param {{ images: string[], name: string, badge?: string | null }} props
 */
export function ProductGallery({ images, name }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div className={styles.gallery}>
      <div className={styles.main}>
        <img src={current} alt={`${name} — image ${active + 1} of ${images.length}`} className={styles.image} />
      </div>
      {images.length > 1 && (
        <div className={styles.thumbs} role="group" aria-label="Product images">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              className={cn(styles.thumb, index === active && styles.thumbActive)}
              aria-label={`Show image ${index + 1}`}
              aria-pressed={index === active}
              onClick={() => setActive(index)}
            >
              <img src={image} alt="" className={styles.image} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
