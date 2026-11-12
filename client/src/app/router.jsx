import { createBrowserRouter } from 'react-router';
import { ROUTES, UPCOMING_PAGES } from '@/config/routes';
import { MainLayout } from '@/layouts/MainLayout/MainLayout';
import CartPage from '@/pages/CartPage';
import ComingSoonPage from '@/pages/ComingSoonPage';
import CustomFramesPage from '@/pages/CustomFramesPage';
import HomePage from '@/pages/HomePage';
import NotFoundPage from '@/pages/NotFoundPage';
import ProductPage from '@/pages/ProductPage';
import RouteErrorPage from '@/pages/RouteErrorPage';
import ShopPage from '@/pages/ShopPage';

/** Route `handle.title` is used by placeholder pages for their heading. */
export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    // Fallback if the layout itself fails.
    errorElement: <RouteErrorPage />,
    children: [
      {
        // Page-level errors render inside the layout so header/footer stay visible.
        errorElement: <RouteErrorPage />,
        children: [
          { index: true, element: <HomePage /> },
          { path: ROUTES.shop, element: <ShopPage /> },
          { path: '/collections/:collection', element: <ShopPage /> },
          { path: '/products/:slug', element: <ProductPage /> },
          { path: ROUTES.customFrames, element: <CustomFramesPage /> },
          { path: ROUTES.cart, element: <CartPage /> },
          ...UPCOMING_PAGES.map(({ path, title }) => ({ path, element: <ComingSoonPage />, handle: { title } })),
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);
