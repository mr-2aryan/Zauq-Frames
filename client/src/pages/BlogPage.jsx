import { useState } from 'react';
import { PageHero } from '@/components/common';
import { CtaBand, InfoSection } from '@/components/info';
import { Button } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { SITE } from '@/config/site';
import { PostCard } from '@/features/blog/components/PostCard/PostCard.jsx';
import { BLOG_CATEGORIES, POSTS } from '@/features/blog/data/posts.js';
import { cn } from '@/utils/cn';
import styles from './BlogPage.module.css';

/** /blog — the blog: the latest article, category filters and every post. */
export default function BlogPage() {
  const [category, setCategory] = useState('');
  const [latest, ...rest] = POSTS;
  const categories = BLOG_CATEGORIES.filter((name) => POSTS.some((post) => post.category === name));
  const shown = category ? POSTS.filter((post) => post.category === category) : rest;

  return (
    <>
      <title>{`Blog | ${SITE.name}`}</title>
      <meta name="description" content="Ideas and guides for framed art: choosing sizes, planning a gallery wall, hanging and caring for frames, custom photos and Islamic calligraphy." />

      <PageHero
        breadcrumbs={[{ label: 'Home', to: ROUTES.home }, { label: 'Blog' }]}
        kicker="The Zauq blog"
        title="Ideas for"
        titleLight="beautiful walls."
        lead="Practical guides on choosing sizes, planning gallery walls, hanging and caring for frames — and the stories behind the pieces we make."
        media={<img src="/images/products/flowing-curves-scene1.jpg" alt="A framed abstract print in a warm living room" />}
      />

      <InfoSection>
        <div data-reveal="fade-up">
          <PostCard post={latest} featured />
        </div>
      </InfoSection>

      <InfoSection kicker="All articles" title="Browse the blog">
        <div role="group" aria-label="Filter by category" className={styles.chips}>
          {[{ value: '', label: 'All' }, ...categories.map((name) => ({ value: name, label: name }))].map((chip) => (
            <button
              key={chip.value || 'all'}
              type="button"
              className={cn(styles.chip, category === chip.value && styles.chipActive)}
              aria-pressed={category === chip.value}
              onClick={() => setCategory(chip.value)}
            >
              {chip.label}
            </button>
          ))}
        </div>

        <ul className={styles.grid}>
          {shown.map((post, index) => (
            <li key={post.slug} data-reveal="fade-up" style={{ '--reveal-delay': `${(index % 3) * 70}ms` }}>
              <PostCard post={post} />
            </li>
          ))}
        </ul>
      </InfoSection>

      <CtaBand
        title="Found your idea?"
        text="Every piece comes in five sizes, framed and ready to hang."
        actions={
          <>
            <Button to={ROUTES.shop} variant="light" size="lg">
              Shop the collection
            </Button>
            <Button to={ROUTES.customFrames} variant="secondary" size="lg">
              Frame your photo
            </Button>
          </>
        }
      />
    </>
  );
}
