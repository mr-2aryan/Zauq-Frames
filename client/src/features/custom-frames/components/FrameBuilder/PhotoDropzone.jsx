import { useState } from 'react';
import { UploadIcon } from '@/components/icons';
import { Button } from '@/components/ui';
import { cn } from '@/utils/cn';
import { PHOTO_RULES } from '../../data/content.js';
import styles from './PhotoDropzone.module.css';

/**
 * Click-to-browse and drag-and-drop photo picker.
 * @param {{ inputId: string, fileName?: string, error?: string, onSelect: (file: File | undefined) => void, onRemove: () => void }} props
 */
export function PhotoDropzone({ inputId, fileName, error, onSelect, onRemove }) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  };

  const handleDragLeave = (event) => {
    // Ignore leave events fired when moving between child elements.
    if (!event.currentTarget.contains(event.relatedTarget)) setIsDragOver(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragOver(false);
    onSelect(event.dataTransfer.files?.[0]);
  };

  const handleChange = (event) => {
    onSelect(event.target.files?.[0]);
    // Reset so choosing the same file again still fires onChange.
    event.target.value = '';
  };

  return (
    <>
      <label
        htmlFor={inputId}
        className={cn(styles.dropzone, isDragOver && styles.dragOver)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <span className={styles.icon}>
          <UploadIcon size={24} />
        </span>
        <span className={styles.text}>
          <span className={styles.title}>Drag &amp; drop or click to browse</span>
          <span className={styles.hint}>JPG or PNG, up to {PHOTO_RULES.maxMb} MB. Higher resolution prints sharper.</span>
        </span>
        <input
          id={inputId}
          type="file"
          accept={PHOTO_RULES.accept}
          className={cn('sr-only', styles.input)}
          aria-invalid={Boolean(error)}
          onChange={handleChange}
        />
      </label>

      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}

      {fileName && (
        <div className={styles.selected}>
          <span className={styles.fileName}>{fileName}</span>
          <Button variant="ghost" size="sm" onClick={onRemove}>
            Remove
          </Button>
        </div>
      )}
    </>
  );
}
