import { useMemo } from 'react';
import { useQuery } from '@/hooks/useQuery';
import { getFrameCatalog } from '@/services/framesApi';
import { CatalogContext } from './CatalogContext.js';

/** Loads the frame catalogue once for the whole app. */
export function CatalogProvider({ children }) {
  const { status, data, error, reload } = useQuery(getFrameCatalog, 'catalog');
  const value = useMemo(() => ({ status, catalog: data, error, reload }), [status, data, error, reload]);
  return <CatalogContext value={value}>{children}</CatalogContext>;
}
