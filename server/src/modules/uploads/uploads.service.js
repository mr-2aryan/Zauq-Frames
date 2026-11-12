import fs from 'node:fs/promises';
import path from 'node:path';
import { env } from '../../config/env.js';
import { HttpError } from '../../utils/HttpError.js';

/** Magic bytes at the start of each accepted file type. */
const FILE_SIGNATURES = {
  'image/jpeg': [0xff, 0xd8, 0xff],
  'image/png': [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
};

/** Stored photo ids look like `<uuid>.jpg` / `<uuid>.png`. */
const PHOTO_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png)$/;

/** Checks the file's real content, not just the browser-declared MIME type. */
async function hasValidSignature(filePath, mimeType) {
  const expected = FILE_SIGNATURES[mimeType];
  if (!expected) return false;

  const handle = await fs.open(filePath, 'r');
  try {
    const { buffer, bytesRead } = await handle.read(Buffer.alloc(expected.length), 0, expected.length, 0);
    return bytesRead === expected.length && expected.every((byte, i) => buffer[i] === byte);
  } finally {
    await handle.close();
  }
}

export const uploadsService = {
  /**
   * Verifies a file stored by multer and returns its public description.
   * @param {Express.Multer.File | undefined} file
   */
  async registerPhoto(file) {
    if (!file) throw HttpError.badRequest('No photo received. Send the image in the "photo" field.');

    if (!(await hasValidSignature(file.path, file.mimetype))) {
      await fs.rm(file.path, { force: true });
      throw HttpError.unsupportedMediaType('That file is not a valid JPG or PNG image.');
    }

    return {
      id: file.filename,
      url: `/uploads/${file.filename}`,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    };
  },

  /** Whether a previously uploaded photo still exists. */
  async exists(photoId) {
    if (typeof photoId !== 'string' || !PHOTO_ID_PATTERN.test(photoId)) return false;
    try {
      await fs.access(path.join(env.uploadDir, photoId));
      return true;
    } catch {
      return false;
    }
  },

  getPublicUrl(photoId) {
    return `/uploads/${photoId}`;
  },
};
