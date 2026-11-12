import { CartProvider } from '@/context/cart/CartProvider';
import { CatalogProvider } from '@/context/catalog/CatalogProvider';
import { ToastProvider } from '@/context/toast/ToastProvider';

/** All app-wide React context providers, in one place. */
export function AppProviders({ children }) {
  return (
    <ToastProvider>
      <CatalogProvider>
        <CartProvider>{children}</CartProvider>
      </CatalogProvider>
    </ToastProvider>
  );
}
