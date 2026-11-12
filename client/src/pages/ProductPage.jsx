import { useId } from 'react';
import { useParams } from 'react-router';
import { PageMessage, TrustStrip } from '@/components/common';
import { Breadcrumbs, Button, Container, Section, SectionHeader, StatusMessage } from '@/components/ui';
import { collectionPath, ROUTES } from '@/config/routes';
import { SITE } from '@/config/site';
import { useCatalog } from '@/context/catalog/useCatalog';
import { ProductGallery, ProductGrid, ProductInfoTabs, ProductPurchasePanel, useProduct } from '@/features/products';
import styles from './ProductPage.module.css';

/** /products/:slug — gallery, size selection, details and related pieces. */
export default function ProductPage() {
  const { slug } = useParams();
  const relatedId = useId();
  const { status, data: product, error, reload } = useProduct(slug);
  const catalogState = useCatalog();

  if (status === 'error' && error?.status === 404) {
    return (
      <>
        <title>{`Piece not found | ${SITE.name}`}</title>
        <PageMessage eyebrow="404" title="We couldn’t find that piece" description="It may have been renamed or removed." actions={<Button to={ROUTES.shop}>Browse all frames</Button>} />
      </>
    );
  }

  if (status !== 'success') {
    return (
      <Container className={styles.page}>
        <StatusMessage status={status} message={status === 'loading' ? 'Loading…' : error?.message} onRetry={reload} />
      </Container>
    );
  }

  return (
    <>
      <title>{`${product.name} | ${SITE.name}`}</title>
      <meta name="description" content={product.summary} />

      <Container className={styles.page}>
        <Breadcrumbs
          items={[
            { label: 'Home', to: ROUTES.home },
            { label: product.collectionName, to: collectionPath(product.collection) },
            { label: product.name },
          ]}
        />

        <div className={styles.layout}>
          <div className={styles.gallery}>
            <ProductGallery images={product.images} name={product.name} />
          </div>
          <div className={styles.info}>
            <span className={styles.collection}>{product.collectionName}</span>
            <h1 className={styles.title}>{product.name}</h1>
            <p className={styles.summary}>{product.summary}</p>
            {catalogState.status === 'success' ? (
              <ProductPurchasePanel product={product} catalog={catalogState.catalog} />
            ) : (
              <StatusMessage status={catalogState.status} message={catalogState.status === 'loading' ? 'Loading sizes…' : catalogState.error?.message} onRetry={catalogState.reload} />
            )}
          </div>
        </div>

        {catalogState.status === 'success' && (
          <div className={styles.tabs}>
            <ProductInfoTabs product={product} catalog={catalogState.catalog} />
          </div>
        )}
      </Container>

      {product.related.length > 0 && (
        <Section aria-labelledby={relatedId}>
          <SectionHeader id={relatedId} title="Complete the wall" action={<Button to={collectionPath(product.collection)} variant="ghost" size="sm">Shop {product.collectionName}</Button>} />
          <ProductGrid status="success" products={product.related} />
        </Section>
      )}

      <Section aria-label="Why shop with Zauq">
        <TrustStrip />
      </Section>
    </>
  );
}
