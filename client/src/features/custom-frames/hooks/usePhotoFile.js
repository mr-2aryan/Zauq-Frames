import { useCallback, useEffect, useRef, useState } from 'react';
import { PHOTO_RULES } from '../data/content.js';

const MAX_BYTES = PHOTO_RULES.maxMb * 1024 * 1024;
const EMPTY = { file: null, previewUrl: null };

/**
 * Holds the customer's chosen photo, validates it and exposes a temporary
 * `blob:` preview URL. URLs are revoked when replaced, cleared or unmounted.
 */
export function usePhotoFile() {
  const [photo, setPhoto] = useState(EMPTY);
  const [error, setError] = useState('');
  const urlRef = useRef(null);

  const replacePreviewUrl = useCallback((nextUrl) => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = nextUrl;
  }, []);

  useEffect(() => () => replacePreviewUrl(null), [replacePreviewUrl]);

  /** @returns {boolean} whether the file was accepted */
  const select = useCallback(
    (nextFile) => {
      if (!nextFile) return false;

      if (!PHOTO_RULES.acceptedTypes.includes(nextFile.type)) {
        setError('Please choose a JPG or PNG image.');
        return false;
      }
      if (nextFile.size > MAX_BYTES) {
        setError(`That image is over ${PHOTO_RULES.maxMb} MB. Please choose a smaller file.`);
        return false;
      }

      const previewUrl = URL.createObjectURL(nextFile);
      replacePreviewUrl(previewUrl);
      setPhoto({ file: nextFile, previewUrl });
      setError('');
      return true;
    },
    [replacePreviewUrl],
  );

  const clear = useCallback(() => {
    replacePreviewUrl(null);
    setPhoto(EMPTY);
    setError('');
  }, [replacePreviewUrl]);

  return { file: photo.file, previewUrl: photo.previewUrl, error, select, clear };
}
