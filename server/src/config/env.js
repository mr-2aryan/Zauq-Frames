import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Absolute path to the `server/` folder. */
export const SERVER_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toList = (value, fallback) =>
  (value ?? fallback)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const nodeEnv = process.env.NODE_ENV ?? 'development';

/**
 * Centralised, typed-ish access to environment configuration.
 * Values are read once at startup; see `.env.example` for the full list.
 */
export const env = Object.freeze({
  nodeEnv,
  isProduction: nodeEnv === 'production',
  port: toInt(process.env.PORT, 5000),
  clientOrigins: toList(process.env.CLIENT_ORIGIN, 'http://localhost:5173'),
  uploadDir: path.resolve(SERVER_ROOT, process.env.UPLOAD_DIR ?? 'uploads'),
  maxUploadBytes: toInt(process.env.MAX_UPLOAD_MB, 20) * 1024 * 1024,
  clientDistDir: path.resolve(SERVER_ROOT, '..', 'client', 'dist'),
});
