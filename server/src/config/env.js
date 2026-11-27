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
  /** PostgreSQL connection string; empty = keep data in memory (development only). Never log it. */
  databaseUrl: process.env.DATABASE_URL?.trim() ?? '',
  /** Use TLS to the database (for a hosted one, such as Amazon RDS). */
  databaseSsl: process.env.DATABASE_SSL === 'true',
  /** The shop's address on the web, for links and images in emails (e.g. https://zauqframes.com). */
  publicUrl: (process.env.PUBLIC_URL?.trim() || toList(process.env.CLIENT_ORIGIN, 'http://localhost:5173')[0]).replace(/\/+$/, ''),
  /**
   * Sending email (order emails). Without SMTP_HOST, emails are saved as HTML
   * files in server/outbox/ instead (development). Never log SMTP_PASS.
   */
  mail: Object.freeze({
    host: process.env.SMTP_HOST?.trim() ?? '',
    port: toInt(process.env.SMTP_PORT, 587),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER?.trim() ?? '',
    pass: process.env.SMTP_PASS ?? '',
    from: process.env.MAIL_FROM?.trim() || 'Zauq Frames <zauqframes.store@gmail.com>',
    replyTo: process.env.MAIL_REPLY_TO?.trim() || 'zauqframes.store@gmail.com',
    /** Optional: the studio's own address, to get a copy of every order email. */
    bcc: process.env.MAIL_BCC?.trim() ?? '',
  }),
  outboxDir: path.resolve(SERVER_ROOT, 'outbox'),
  /**
   * Uploaded images and files (never in the database). `public/` is served at /media
   * (by Nginx in production); `private/` (print-quality artwork) is never served.
   */
  storageDir: path.resolve(SERVER_ROOT, process.env.STORAGE_DIR ?? 'storage'),
  /** The admin's own address (e.g. admin.zauqframes.com): the admin API answers only there. Empty = anywhere (development). */
  adminHost: process.env.ADMIN_HOST?.trim().toLowerCase() ?? '',
  /** Secret that signs the admin activity log so entries can't be altered unnoticed. Set a long random value. */
  adminLogKey: process.env.ADMIN_LOG_KEY ?? '',
});
