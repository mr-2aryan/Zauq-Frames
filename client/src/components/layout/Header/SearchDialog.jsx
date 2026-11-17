import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowRightIcon, CloseIcon, ImageIcon, SearchIcon } from '@/components/icons';
import { Price } from '@/components/ui';
import { POPULAR_SEARCHES } from '@/config/navigation';
import { collectionPath, productPath, ROUTES, shopPath } from '@/config/routes';
import { useCollections, useProducts } from '@/features/products/hooks/useProducts';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import styles from './SearchDialog.module.css';

const RESULT_LIMIT = 6;

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Wraps the parts of `text` that match the search words in <mark>. */
function Highlight({ text, query }) {
  const words = query.split(/\s+/).filter(Boolean).map(escapeRegExp);
  if (!words.length) return text;
  const parts = text.split(new RegExp(`(${words.join('|')})`, 'gi'));
  return parts.map((part, index) => (index % 2 ? <mark key={index}>{part}</mark> : part));
}

/** Shown before anything is typed: quick searches and the collections. */
function Suggestions({ onPick, onNavigate }) {
  const { data: collections } = useCollections();

  return (
    <div className={styles.suggestions}>
      <section>
        <h3 className={styles.label}>Popular searches</h3>
        <div className={styles.chips}>
          {POPULAR_SEARCHES.map((term) => (
            <button key={term} type="button" className={styles.chip} onClick={() => onPick(term)}>
              <SearchIcon size={14} />
              {term}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className={styles.label}>Browse</h3>
        <ul className={styles.collections}>
          {collections?.map((collection, index) => (
            <li key={collection.slug} style={{ '--i': index }}>
              <Link to={collectionPath(collection.slug)} className={styles.collection} onClick={onNavigate}>
                <img src={collection.image} alt="" className={styles.collectionImage} />
                <span>
                  <strong>{collection.name}</strong>
                  <span className={styles.meta}>{collection.productCount} pieces</span>
                </span>
              </Link>
            </li>
          ))}
          <li style={{ '--i': collections?.length ?? 0 }}>
            <Link to={ROUTES.customFrames} className={styles.collection} onClick={onNavigate}>
              <span className={styles.customIcon}>
                <ImageIcon size={24} />
              </span>
              <span>
                <strong>Custom frames</strong>
                <span className={styles.meta}>Your photo, framed</span>
              </span>
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}

/** Live results for the typed query (debounced). Keeps the last results on screen while the next ones load. */
function Results({ query, onNavigate }) {
  const debounced = useDebouncedValue(query, 200);
  const { status, data } = useProducts({ q: debounced, limit: RESULT_LIMIT });
  const [shown, setShown] = useState(null);

  if (status === 'success' && shown?.data !== data) setShown({ data, query: debounced });

  if (status === 'error') return <p className={styles.empty}>Search isn’t available right now. Please try again.</p>;
  if (!shown) {
    return (
      <ul className={styles.results} aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => (
          <li key={index} className={styles.skeleton} />
        ))}
      </ul>
    );
  }

  const { items, total } = shown.data;
  if (!total) {
    return (
      <div className={styles.empty}>
        <p>
          <strong>No frames match “{shown.query}”.</strong>
        </p>
        <p>Try another word, or frame a photo of your own.</p>
        <Link to={ROUTES.customFrames} className={styles.seeAll} onClick={onNavigate}>
          Design a custom frame <ArrowRightIcon size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className={status === 'loading' ? styles.refreshing : undefined}>
      <h3 className={styles.label}>
        {total} {total === 1 ? 'piece' : 'pieces'}
      </h3>
      <ul className={styles.results}>
        {items.map((product, index) => (
          <li key={product.slug} style={{ '--i': index }}>
            <Link to={productPath(product.slug)} className={styles.result} onClick={onNavigate}>
              <img src={product.image} alt="" className={styles.thumb} />
              <span className={styles.resultText}>
                <span className={styles.resultName}>
                  <Highlight text={product.name} query={shown.query} />
                </span>
                <span className={styles.meta}>{product.collectionName}</span>
              </span>
              <Price amount={product.salePrice} listAmount={product.price} currency={product.currency} size="sm" from className={styles.resultPrice} />
            </Link>
          </li>
        ))}
      </ul>
      {total > items.length && (
        <Link to={shopPath({ q: shown.query })} className={styles.seeAll} onClick={onNavigate}>
          See all {total} results <ArrowRightIcon size={16} />
        </Link>
      )}
    </div>
  );
}

/**
 * Search panel. Opens as a native modal <dialog> (focus stays inside, Esc
 * closes it): the page fades behind a blurred backdrop and the panel drops in.
 * @param {{ open: boolean, onClose: () => void }} props
 */
export function SearchDialog({ open, onClose }) {
  const dialogRef = useRef(null);
  const inputRef = useRef(null);
  const pressedBackdrop = useRef(false);
  const [query, setQuery] = useState('');
  const [hasOpened, setHasOpened] = useState(open);
  const navigate = useNavigate();

  // Content is only rendered once the panel has been opened, so closed pages don't fetch anything.
  if (open && !hasOpened) setHasOpened(true);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog.open) {
      dialog.showModal();
      inputRef.current.select();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const trimmed = query.trim();

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate(shopPath({ q: trimmed }));
    onClose();
  };

  const pickSuggestion = (term) => {
    setQuery(term);
    inputRef.current.focus();
  };

  return (
    // The dialog itself is only "hit" on the backdrop; the panel fills it.
    // oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-label="Search"
      onClose={onClose}
      onMouseDown={(event) => {
        pressedBackdrop.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        if (pressedBackdrop.current && event.target === event.currentTarget) onClose();
      }}
    >
      <div className={styles.panel}>
        <form role="search" className={styles.form} onSubmit={handleSubmit}>
          <SearchIcon size={22} className={styles.formIcon} />
          <input
            ref={inputRef}
            type="search"
            className={styles.input}
            aria-label="Search frames"
            placeholder="Search calligraphy, modern prints, gifts…"
            autoComplete="off"
            enterKeyHint="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close search">
            <kbd className={styles.kbd}>Esc</kbd>
            <CloseIcon size={18} />
          </button>
        </form>

        {hasOpened && (
          <div className={styles.body}>
            {trimmed ? <Results query={trimmed} onNavigate={onClose} /> : <Suggestions onPick={pickSuggestion} onNavigate={onClose} />}
          </div>
        )}
      </div>
    </dialog>
  );
}
