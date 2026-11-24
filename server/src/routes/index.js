import { Router } from 'express';
import { env } from '../config/env.js';
import { loadUser } from '../modules/auth/auth.middleware.js';
import { accountRouter, authRouter } from '../modules/auth/auth.routes.js';
import contactRoutes from '../modules/contact/contact.routes.js';
import { emailPreviewRouter } from '../modules/email/email.preview.js';
import framesRoutes from '../modules/frames/frames.routes.js';
import healthRoutes from '../modules/health/health.routes.js';
import newsletterRoutes from '../modules/newsletter/newsletter.routes.js';
import ordersRoutes from '../modules/orders/orders.routes.js';
import { collectionsRouter, productsRouter } from '../modules/products/products.routes.js';
import uploadsRoutes from '../modules/uploads/uploads.routes.js';

/** Everything mounted under `/api`. */
const apiRouter = Router();

// Every request knows who (if anyone) is signed in: `req.user`.
apiRouter.use(loadUser);

apiRouter.use('/health', healthRoutes);
apiRouter.use('/frames', framesRoutes);
apiRouter.use('/collections', collectionsRouter);
apiRouter.use('/products', productsRouter);
apiRouter.use('/uploads', uploadsRoutes);
apiRouter.use('/orders', ordersRoutes);
apiRouter.use('/newsletter', newsletterRoutes);
apiRouter.use('/contact', contactRoutes);
apiRouter.use('/auth', authRouter);
apiRouter.use('/account', accountRouter);

// Development only: the order emails, in the browser.
if (!env.isProduction) apiRouter.use('/dev/emails', emailPreviewRouter);

export default apiRouter;
