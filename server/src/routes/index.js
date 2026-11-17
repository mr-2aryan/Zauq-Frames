import { Router } from 'express';
import { loadUser } from '../modules/auth/auth.middleware.js';
import { accountRouter, authRouter } from '../modules/auth/auth.routes.js';
import contactRoutes from '../modules/contact/contact.routes.js';
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

export default apiRouter;
