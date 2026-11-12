import { use } from 'react';
import { CatalogContext } from './CatalogContext.js';

/**
 * @returns {{
 *   status: 'loading' | 'success' | 'error',
 *   catalog: import('@/services/framesApi').FrameCatalog | null,
 *   error: Error | null,
 *   reload: () => void,
 * }}
 */
export function useCatalog() {
  const context = use(CatalogContext);
  if (!context) throw new Error('useCatalog must be used inside <CatalogProvider>.');
  return context;
}
