import fs from 'node:fs';
import path from 'node:path';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { headHtml, renderPage, robotsTxt, sitemapXml } from './modules/seo/seo.js';
import apiRouter from './routes/index.js';

/** The built shop page (read once; a deploy restarts the server). */
let template = null;
const shopTemplate = async () => (template ??= await fs.promises.readFile(path.join(env.clientDistDir, 'index.html'), 'utf8'));

/** Builds the Express app. Kept separate from `server.js` so it can be tested without listening. */
export function createApp() {
  const app = express();

  app.set('trust proxy', 1);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          // The client previews photos from blob: URLs before upload.
          'img-src': ["'self'", 'data:', 'blob:'],
          'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          'font-src': ["'self'", 'https://fonts.gstatic.com'],
        },
      },
    }),
  );
  app.use(cors({ origin: env.clientOrigins }));
  app.use(morgan(env.isProduction ? 'combined' : 'dev'));
  app.use(express.json({ limit: '100kb' }));

  // Customer photos
  app.use(
    '/uploads',
    express.static(env.uploadDir, {
      maxAge: '7d',
      setHeaders: (res) => res.set('Cross-Origin-Resource-Policy', 'cross-origin'),
    }),
  );

  // Uploaded shop images (Nginx serves these directly in production). Names never change, so cache for a year.
  app.use(
    '/media',
    express.static(path.join(env.storageDir, 'public'), {
      immutable: true,
      maxAge: '365d',
      fallthrough: false,
      setHeaders: (res) => {
        res.set('X-Content-Type-Options', 'nosniff');
        res.set('Cross-Origin-Resource-Policy', 'cross-origin');
      },
    }),
  );

  app.use('/api', apiRouter);

  // For search engines: robots.txt and a sitemap built from the catalogue.
  app.get('/robots.txt', (_req, res) => res.type('text/plain').set('Cache-Control', 'public, max-age=3600').send(robotsTxt()));
  app.get('/sitemap.xml', async (_req, res) => res.type('application/xml').set('Cache-Control', 'public, max-age=3600').send(await sitemapXml()));

  // In production, serve the built React app from the same origin. Every page is sent
  // with its own status, <head> and plain-HTML content (see modules/seo/seo.js).
  if (env.isProduction && fs.existsSync(env.clientDistDir)) {
    app.use(express.static(env.clientDistDir, { index: false }));
    app.get('/{*splat}', async (req, res, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/media')) return next();
      const page = await renderPage(req.path, req.query);
      if (page.redirect) return res.redirect(301, page.redirect);
      const html = (await shopTemplate())
        .replace(/<title>[\s\S]*?<\/title>/, headHtml(page.head))
        .replace(/<meta name="description"[^>]*>/, '')
        .replace('<div id="root"></div>', `<div id="root">${page.body}</div>`);
      return res.status(page.status).type('html').set('Cache-Control', 'no-cache').send(html);
    });
  }

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
