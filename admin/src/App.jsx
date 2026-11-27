import { keyframes } from '@emotion/react';
import { Box, Typography } from '@mui/material';
import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { useAuth } from './auth.jsx';
import { Layout } from './components/Layout.jsx';
import { PageSkeleton } from './components/ui.jsx';
import { color, font } from './design/tokens.js';
import LoginPage from './pages/LoginPage.jsx';

// Each page is its own file; all of them are fetched quietly after sign-in so moving between pages is instant.
const loaders = {
  Dashboard: () => import('./pages/DashboardPage.jsx'),
  Orders: () => import('./pages/OrdersPage.jsx'),
  OrderDetail: () => import('./pages/OrderDetailPage.jsx'),
  Customers: () => import('./pages/CustomersPage.jsx'),
  Products: () => import('./pages/ProductsPage.jsx'),
  ProductEdit: () => import('./pages/ProductEditPage.jsx'),
  Collections: () => import('./pages/CollectionsPage.jsx'),
  Pricing: () => import('./pages/PricingPage.jsx'),
  Media: () => import('./pages/MediaPage.jsx'),
  Reviews: () => import('./pages/ReviewsPage.jsx'),
  Messages: () => import('./pages/MessagesPage.jsx'),
  Subscribers: () => import('./pages/SubscribersPage.jsx'),
  Admins: () => import('./pages/AdminsPage.jsx'),
  Activity: () => import('./pages/ActivityPage.jsx'),
  Account: () => import('./pages/AccountPage.jsx'),
};
const P = Object.fromEntries(Object.entries(loaders).map(([name, load]) => [name, lazy(load)]));

const breathe = keyframes`
  0%, 100% { opacity: .45; }
  50% { opacity: 1; }
`;

/** Shown for the moment it takes to check the sign-in. */
function Opening() {
  return (
    <Box sx={{ minHeight: '100dvh', display: 'grid', placeItems: 'center' }} aria-busy="true" aria-label="Opening the admin">
      <Typography sx={{ fontFamily: font.display, fontWeight: 800, letterSpacing: '0.18em', fontSize: 26, color: color.olive700, animation: `${breathe} 1.6s ease-in-out infinite` }}>ZAUQ</Typography>
    </Box>
  );
}

export function App() {
  const { admin } = useAuth();

  useEffect(() => {
    if (!admin) return undefined;
    const idle = window.requestIdleCallback ?? ((fn) => setTimeout(fn, 1200));
    const cancel = window.cancelIdleCallback ?? clearTimeout;
    const handle = idle(() => Object.values(loaders).forEach((load) => load().catch(() => {})));
    return () => cancel(handle);
  }, [admin]);

  if (admin === undefined) return <Opening />;
  if (!admin) return <LoginPage />;

  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<P.Dashboard />} />
          <Route path="orders" element={<P.Orders />} />
          <Route path="orders/:id" element={<P.OrderDetail />} />
          <Route path="customers" element={<P.Customers />} />
          <Route path="products" element={<P.Products />} />
          <Route path="products/new" element={<P.ProductEdit />} />
          <Route path="products/:id" element={<P.ProductEdit />} />
          <Route path="collections" element={<P.Collections />} />
          <Route path="pricing" element={<P.Pricing />} />
          <Route path="media-library" element={<P.Media />} />
          <Route path="reviews" element={<P.Reviews />} />
          <Route path="messages" element={<P.Messages />} />
          <Route path="subscribers" element={<P.Subscribers />} />
          <Route path="admins" element={<P.Admins />} />
          <Route path="activity" element={<P.Activity />} />
          <Route path="account" element={<P.Account />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
