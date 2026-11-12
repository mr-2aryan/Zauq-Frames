import { Router } from 'express';
import framesRoutes from '../modules/frames/frames.routes.js';
import healthRoutes from '../modules/health/health.routes.js';
import newsletterRoutes from '../modules/newsletter/newsletter.routes.js';
import ordersRoutes from '../modules/orders/orders.routes.js';
import { collectionsRouter, productsRouter } from '../modules/products/products.routes.js';
import uploadsRoutes from '../modules/uploads/uploads.routes.js';

/** Everything mounted under `/api`. */
const apiRouter = Router();

apiRouter.use('/health', healthRoutes);
apiRouter.use('/frames', framesRoutes);
apiRouter.use('/collections', collectionsRouter);
apiRouter.use('/products', productsRouter);
apiRouter.use('/uploads', uploadsRoutes);
apiRouter.use('/orders', ordersRoutes);
apiRouter.use('/newsletter', newsletterRoutes);

export default apiRouter;
