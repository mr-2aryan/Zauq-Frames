import { createBrowserRouter } from 'react-router';
import { ROUTES, UPCOMING_PAGES } from '@/config/routes';
import { CheckoutLayout } from '@/layouts/CheckoutLayout/CheckoutLayout';
import { MainLayout } from '@/layouts/MainLayout/MainLayout';
import AboutPage from '@/pages/AboutPage';
import AccountPage from '@/pages/AccountPage';
import BlogPage from '@/pages/BlogPage';
import BlogPostPage from '@/pages/BlogPostPage';
import CarePage from '@/pages/CarePage';
import CartPage from '@/pages/CartPage';
import CheckoutPage from '@/pages/CheckoutPage';
import CraftsmanshipPage from '@/pages/CraftsmanshipPage';
import ContactPage from '@/pages/ContactPage';
import ComingSoonPage from '@/pages/ComingSoonPage';
import CustomFramesPage from '@/pages/CustomFramesPage';
import FaqPage from '@/pages/FaqPage';
import HomePage from '@/pages/HomePage';
import NotFoundPage from '@/pages/NotFoundPage';
import OrderConfirmationPage from '@/pages/OrderConfirmationPage';
import PrivacyPage from '@/pages/PrivacyPage';
import ProductPage from '@/pages/ProductPage';
import RefundsPage from '@/pages/RefundsPage';
import ReturnsPage from '@/pages/ReturnsPage';
import RouteErrorPage from '@/pages/RouteErrorPage';
import ShippingPage from '@/pages/ShippingPage';
import ShopPage from '@/pages/ShopPage';
import SizesPage from '@/pages/SizesPage';
import TermsPage from '@/pages/TermsPage';
import TrackOrderPage from '@/pages/TrackOrderPage';

/** Route `handle.title` is used by placeholder pages for their heading. */
export const router = createBrowserRouter([
  {
    // Checkout has its own minimal frame (no site header or footer).
    element: <CheckoutLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { path: ROUTES.checkout, element: <CheckoutPage /> },
      { path: ROUTES.orderConfirmation, element: <OrderConfirmationPage /> },
    ],
  },
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
          { path: ROUTES.account, element: <AccountPage /> },
          { path: ROUTES.contact, element: <ContactPage /> },
          { path: ROUTES.faqs, element: <FaqPage /> },
          { path: ROUTES.trackOrder, element: <TrackOrderPage /> },
          { path: ROUTES.about, element: <AboutPage /> },
          { path: ROUTES.craftsmanship, element: <CraftsmanshipPage /> },
          { path: ROUTES.shipping, element: <ShippingPage /> },
          { path: ROUTES.returns, element: <ReturnsPage /> },
          { path: ROUTES.care, element: <CarePage /> },
          { path: ROUTES.terms, element: <TermsPage /> },
          { path: ROUTES.privacy, element: <PrivacyPage /> },
          { path: ROUTES.refunds, element: <RefundsPage /> },
          { path: ROUTES.sizes, element: <SizesPage /> },
          { path: ROUTES.blog, element: <BlogPage /> },
          { path: `${ROUTES.blog}/:slug`, element: <BlogPostPage /> },
          ...UPCOMING_PAGES.map(({ path, title }) => ({ path, element: <ComingSoonPage />, handle: { title } })),
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);
