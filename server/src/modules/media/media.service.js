import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { env } from '../../config/env.js';
import { createRepository } from '../../lib/createRepository.js';
import { HttpError } from '../../utils/HttpError.js';

/**
 * Image storage. Files are kept on the server's disk — never in the database —
 * under STORAGE_DIR:
 *   public/<folder>/<yyyy>/<mm>/<id>-{large,medium,thumb}.webp and <id>.jpg — served at /media
 *   private/artwork/<id>.<ext> — print-quality artwork, never served (admin download only)
 * The `media` table records where each upload's files are, with its size and alt text.
 */
export const mediaRepository = createRepository('media');
export const MEDIA_URL = '/media';
export const PUBLIC_DIR = path.join(env.storageDir, 'public');
const PRIVATE_DIR = path.join(env.storageDir, 'private');

/** Resized copies made of every image (longest side, in px). */
const VARIANTS = [
  { name: 'large', size: 1600, quality: 80 },
  { name: 'medium', size: 800, quality: 78 },
  { name: 'thumb', size: 400, quality: 74 },
];
/** The small public copy of a print file (never print quality). */
const ART_COPY_SIZE = 600;
/** Refuses absurdly large images (decompression bombs). */
const MAX_PIXELS = 320_000_000;

/** The real type of an image, from its first bytes (not the file name or browser's claim). */
export function sniffImage(buffer) {
  const b = buffer.subarray(0, 12);
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpg';
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'png';
  if (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') return 'webp';
  if ((b[0] === 0x49 && b[1] === 0x49 && b[2] === 0x2a && b[3] === 0x00) || (b[0] === 0x4d && b[1] === 0x4d && b[2] === 0x00 && b[3] === 0x2a)) return 'tif';
  return null;
}

const datedFolder = (folder) => {
  const now = new Date();
  return `${folder}/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
};

/** A media URL back to its file on disk (only inside the public folder). */
function publicPath(url) {
  if (typeof url !== 'string' || !url.startsWith(`${MEDIA_URL}/`)) return null;
  const file = path.resolve(PUBLIC_DIR, url.slice(MEDIA_URL.length + 1));
  return file.startsWith(PUBLIC_DIR + path.sep) ? file : null;
}

const open = (input) => sharp(input, { failOn: 'error', limitInputPixels: MAX_PIXELS }).rotate();

/** Saves the resized WebP copies and a JPEG copy; returns their URLs and the large size. */
async function writeVariants(input, folder, id) {
  const sub = datedFolder(folder);
  await fs.mkdir(path.join(PUBLIC_DIR, sub), { recursive: true });
  const files = {};
  let width = 0;
  let height = 0;
  for (const variant of VARIANTS) {
    const info = await open(input)
      .resize({ width: variant.size, height: variant.size, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: variant.quality, effort: 5 })
      .toFile(path.join(PUBLIC_DIR, sub, `${id}-${variant.name}.webp`));
    files[variant.name] = `${MEDIA_URL}/${sub}/${id}-${variant.name}.webp`;
    if (variant.name === 'large') ({ width, height } = info);
  }
  // A JPEG copy for emails and social previews (transparent areas become white).
  await open(input)
    .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
    .flatten({ background: '#ffffff' })
    .jpeg({ quality: 84, mozjpeg: true, progressive: true })
    .toFile(path.join(PUBLIC_DIR, sub, `${id}.jpg`));
  files.jpg = `${MEDIA_URL}/${sub}/${id}.jpg`;
  return { files, width, height };
}

export const mediaService = {
  /**
   * Stores an uploaded image for the shop (product photos, collection images,
   * banners). Hidden photo data (location, camera) is removed, it is turned the
   * right way up, and resized copies are made. Returns the media record.
   */
  async saveImage(buffer, { folder = 'products', alt = '', originalName = '', uploadedBy = null } = {}) {
    const type = sniffImage(buffer);
    if (!type || type === 'tif') throw HttpError.unsupportedMediaType('Please upload a JPG, PNG or WebP image.');
    const id = randomUUID();
    try {
      const { files, width, height } = await writeVariants(buffer, folder, id);
      return await mediaRepository.create({ folder, files, width, height, alt, originalName, uploadedBy, bytes: buffer.length, private: null });
    } catch (error) {
      if (error instanceof HttpError) throw error;
      throw HttpError.unsupportedMediaType('That image could not be read. Please try another file.');
    }
  },

  /**
   * Stores a print-quality artwork file privately (never served to the public),
   * and makes a small public copy for thumbnails. `filePath` is the uploaded
   * temporary file (large files are not held in memory).
   */
  async saveArtwork(filePath, { originalName = '', uploadedBy = null } = {}) {
    const head = Buffer.alloc(12);
    const handle = await fs.open(filePath, 'r');
    try {
      await handle.read(head, 0, 12, 0);
    } finally {
      await handle.close();
    }
    const type = sniffImage(head);
    if (!type) throw HttpError.unsupportedMediaType('Please upload a JPG, PNG, WebP or TIFF file.');

    const id = randomUUID();
    await fs.mkdir(path.join(PRIVATE_DIR, 'artwork'), { recursive: true });
    const privateFile = `artwork/${id}.${type}`;
    try {
      const { width, height } = await sharp(filePath, { limitInputPixels: MAX_PIXELS }).metadata();
      const sub = datedFolder('art');
      await fs.mkdir(path.join(PUBLIC_DIR, sub), { recursive: true });
      await open(filePath)
        .resize({ width: ART_COPY_SIZE, height: ART_COPY_SIZE, fit: 'inside', withoutEnlargement: true })
        .flatten({ background: '#ffffff' })
        .jpeg({ quality: 85, mozjpeg: true })
        .toFile(path.join(PUBLIC_DIR, sub, `${id}-art.jpg`));
      await fs.rename(filePath, path.join(PRIVATE_DIR, privateFile)).catch(async () => {
        await fs.copyFile(filePath, path.join(PRIVATE_DIR, privateFile));
        await fs.rm(filePath, { force: true });
      });
      const { size } = await fs.stat(path.join(PRIVATE_DIR, privateFile));
      return await mediaRepository.create({
        folder: 'artwork',
        files: { art: `${MEDIA_URL}/${sub}/${id}-art.jpg` },
        width,
        height,
        alt: '',
        originalName,
        uploadedBy,
        bytes: size,
        private: { file: privateFile, type },
      });
    } catch (error) {
      await fs.rm(filePath, { force: true });
      if (error instanceof HttpError) throw error;
      throw HttpError.unsupportedMediaType('That file could not be read as an image.');
    }
  },

  /** Where a private artwork file is on disk, for the admin download. */
  async privateFile(id) {
    const record = await mediaRepository.findById(id);
    if (!record?.private) throw HttpError.notFound('No such file.');
    const file = path.resolve(PRIVATE_DIR, record.private.file);
    if (!file.startsWith(PRIVATE_DIR + path.sep)) throw HttpError.notFound('No such file.');
    return { file, name: record.originalName || path.basename(file) };
  },

  /** The media record that a stored URL (any of its copies) belongs to. */
  async findByUrl(url) {
    const all = await mediaRepository.findAll();
    return all.find((record) => Object.values(record.files ?? {}).includes(url)) ?? null;
  },

  async list({ folder } = {}) {
    const all = await mediaRepository.findAll();
    return all.filter((record) => !folder || record.folder === folder).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async updateAlt(id, alt) {
    const record = await mediaRepository.update(id, { alt });
    if (!record) throw HttpError.notFound('No such image.');
    return record;
  },

  /** Deletes an upload: all its files on disk, then its record. */
  async remove(id) {
    const record = await mediaRepository.findById(id);
    if (!record) return false;
    for (const url of Object.values(record.files ?? {})) {
      const file = publicPath(url);
      if (file) await fs.rm(file, { force: true });
    }
    if (record.private?.file) {
      const file = path.resolve(PRIVATE_DIR, record.private.file);
      if (file.startsWith(PRIVATE_DIR + path.sep)) await fs.rm(file, { force: true });
    }
    return mediaRepository.delete(id);
  },

  /** Deletes the uploads behind these URLs that nothing uses any more (`stillUsed(url)` decides). */
  async removeUnused(urls, stillUsed) {
    for (const url of new Set(urls.filter(Boolean))) {
      if (!url.startsWith(`${MEDIA_URL}/`) || (await stillUsed(url))) continue;
      const record = await this.findByUrl(url);
      if (record) await this.remove(record.id);
    }
  },
};
