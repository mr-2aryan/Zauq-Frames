import { useId, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { SearchIcon } from '@/components/icons';
import { shopPath } from '@/config/routes';
import { cn } from '@/utils/cn';
import styles from './SearchForm.module.css';

/** Searches the shop: submits to `/shop?q=…`. */
export function SearchForm({ onSearch, className }) {
  const id = useId();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate(shopPath({ q: query.trim() }));
    onSearch?.();
  };

  return (
    <form role="search" className={cn(styles.form, className)} onSubmit={handleSubmit}>
      <SearchIcon size={18} className={styles.icon} />
      <label htmlFor={id} className="sr-only">
        Search frames
      </label>
      <input
        id={id}
        type="search"
        className={styles.input}
        placeholder="Search calligraphy, prints…"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <button type="submit" className="sr-only">
        Search
      </button>
    </form>
  );
}
