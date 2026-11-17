import { useId, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowRightIcon, SearchIcon } from '@/components/icons';
import { Button, Container, Section, SectionHeader } from '@/components/ui';
import { collectionPath, ROUTES, shopPath } from '@/config/routes';
import { SITE } from '@/config/site';
import { ProductGrid, useCollections, useProducts } from '@/features/products';
import styles from './NotFoundPage.module.css';

/** 404: an empty frame hanging crooked on the wall, a search box and ways back into the shop. */
export default function NotFoundPage() {
  const headingId = useId();
  const searchId = useId();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const { data: collections } = useCollections();
  const popular = useProducts({ featured: true, limit: 4 });

  const handleSearch = (event) => {
    event.preventDefault();
    navigate(shopPath({ q: query.trim() }));
  };

  return (
    <>
      <title>{`Page not found | ${SITE.name}`}</title>
      <meta name="robots" content="noindex" />

      <section aria-labelledby={headingId} className={styles.hero}>
        <Container className={styles.inner}>
          <div className={styles.art} aria-hidden="true" data-reveal="fade-down">
            <span className={styles.nail}></span>
            {/* Wire and frame swing together from the nail. */}
            <div className={styles.swing}>
              <svg className={styles.wire} viewBox="0 0 200 60" preserveAspectRatio="none">
                <path d="M100 2 L6 58 M100 2 L194 58" />
              </svg>
              <div className={styles.frame}>
                <div className={styles.mat}>
                  <span className={styles.code}>404</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.copy}>
            <p className={styles.kicker} data-reveal="fade-up">
              Error 404 · Page not found
            </p>
            <h1 id={headingId} className={styles.title} data-reveal="fade-up" style={{ '--reveal-delay': '80ms' }}>
              This wall is <span className={styles.light}>empty.</span>
            </h1>
            <p className={styles.text} data-reveal="fade-up" style={{ '--reveal-delay': '160ms' }}>
              The page you’re looking for has moved or never existed. Search for a piece, or start from one of our collections.
            </p>

            <form role="search" className={styles.search} onSubmit={handleSearch} data-reveal="fade-up" style={{ '--reveal-delay': '240ms' }}>
              <label htmlFor={searchId} className="sr-only">
                Search frames
              </label>
              <input
                id={searchId}
                type="search"
                className={styles.input}
                placeholder="Try “Bismillah” or “Sunset”"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <button type="submit" className={styles.searchButton} aria-label="Search">
                <SearchIcon size={18} />
              </button>
            </form>

            <ul className={styles.links} data-reveal="fade-up" style={{ '--reveal-delay': '320ms' }}>
              {collections?.map((collection) => (
                <li key={collection.slug}>
                  <Link to={collectionPath(collection.slug)}>{collection.name}</Link>
                </li>
              ))}
              <li>
                <Link to={ROUTES.customFrames}>Custom frames</Link>
              </li>
            </ul>

            <div className={styles.actions} data-reveal="fade-up" style={{ '--reveal-delay': '400ms' }}>
              <Button to={ROUTES.home} size="lg">
                Back to home
              </Button>
              <Link to={ROUTES.shop} className={styles.textLink}>
                Browse all pieces <ArrowRightIcon size={16} />
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <Section aria-labelledby={`${headingId}-popular`}>
        <SectionHeader id={`${headingId}-popular`} title="Popular right now" />
        <ProductGrid status={popular.status} products={popular.data?.items} error={popular.error} onRetry={popular.reload} />
      </Section>
    </>
  );
}
