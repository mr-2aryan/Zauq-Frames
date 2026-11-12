import { createContext } from 'react';

/**
 * Frame sizes, prices, promotion and delivery fee from `GET /api/frames/catalog`.
 * Value: `{ status, catalog, error, reload }`. Read it with `useCatalog()`.
 */
export const CatalogContext = createContext(null);
