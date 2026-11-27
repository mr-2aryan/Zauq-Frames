import { useId } from 'react';
import { Navigate, useParams } from 'react-router';
import { PageMessage } from '@/components/common';
import { Breadcrumbs, Button, Container, Section, SectionHeader, StatusMessage } from '@/components/ui';
import { collectionPath, productPath, ROUTES } from '@/config/routes';
import { SITE } from '@/config/site';
import { useCatalog } from '@/context/catalog/useCatalog';
import { ProductFaq, ProductGallery, ProductGrid, ProductInfoTabs, ProductPurchasePanel, useProduct } from '@/features/products';
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

  // Opened with an old address (the piece was renamed): go to its current one.
  if (product.slug !== slug) return <Navigate to={productPath(product.slug)} replace />;

  return (
    <>
      <title>{product.seoTitle ?? `${product.name} | ${SITE.name}`}</title>
      <meta name="description" content={product.seoDescription ?? product.summary} />

      <Container className={styles.page}>
        <Breadcrumbs
          items={[
            { label: 'Home', to: ROUTES.home },
            { label: product.collectionName, to: collectionPath(product.collection) },
            { label: product.name },
          ]}
        />

        <div className={styles.layout}>
          <div className={styles.gallery} data-reveal="fade-right">
            <ProductGallery key={product.slug} images={product.images} name={product.name} orientation={product.orientation} />
          </div>
          <div className={styles.info} data-reveal="fade-left" style={{ '--reveal-delay': '100ms' }}>
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
          <div className={styles.tabs} data-reveal="fade-up">
            <ProductInfoTabs product={product} catalog={catalogState.catalog} />
          </div>
        )}
      </Container>

      {catalogState.status === 'success' && <ProductFaq product={product} catalog={catalogState.catalog} />}

      {product.related.length > 0 && (
        <Section aria-labelledby={relatedId}>
          <SectionHeader id={relatedId} title="Complete the wall" action={<Button to={collectionPath(product.collection)} variant="ghost" size="sm">Shop {product.collectionName}</Button>} />
          <ProductGrid status="success" products={product.related} />
        </Section>
      )}
    </>
  );
}
