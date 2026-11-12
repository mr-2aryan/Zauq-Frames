import { useCallback, useRef, useState } from 'react';
import { useCart } from '@/context/cart/useCart';
import { useToast } from '@/context/toast/useToast';
import { uploadPhoto } from '@/services/uploadsApi';
import { formatSizeLabel } from '@/utils/frames';

/**
 * Uploads the customer's photo (once per file) and adds the configured
 * custom frame to the cart.
 */
export function useAddCustomFrame() {
  const { addItem } = useCart();
  const { showToast } = useToast();
  /** File → uploaded photo, so adding the same photo again skips the upload. */
  const uploadsRef = useRef(new WeakMap());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const addCustomFrame = useCallback(
    async ({ file, size, orientation, crop, currency }) => {
      if (!file) {
        setError('Please upload a photo first.');
        return false;
      }

      setIsSubmitting(true);
      setError('');
      try {
        let photo = uploadsRef.current.get(file);
        if (!photo) {
          photo = await uploadPhoto(file);
          uploadsRef.current.set(file, photo);
        }

        const sizeLabel = formatSizeLabel(size, { unit: true });
        addItem({
          type: 'custom-frame',
          name: 'Custom frame',
          image: photo.url,
          sizeId: size.id,
          sizeLabel,
          orientation,
          crop: { x: Math.round(crop.x), y: Math.round(crop.y) },
          unitPrice: size.salePrice,
          listPrice: size.price,
          currency,
          quantity: 1,
          photo: { id: photo.id, url: photo.url, name: file.name },
        });
        showToast(`Added to cart — Custom frame ${sizeLabel}`);
        return true;
      } catch (err) {
        setError(err.message);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [addItem, showToast],
  );

  const clearError = useCallback(() => setError(''), []);

  return { addCustomFrame, isSubmitting, error, clearError };
}
