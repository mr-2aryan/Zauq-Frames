import { Link } from 'react-router';
import { cn } from '@/utils/cn';
import { blogPostPath, formatPostDate } from '../../blog.js';
import styles from './PostCard.module.css';

/**
 * A blog post teaser: cover, category, title, excerpt and reading time.
 * `featured` lays it out wide, with the image beside the text.
 * @param {{ post: { slug: string, title: string, excerpt: string, category: string, readingMinutes: number, date: string, cover: string }, featured?: boolean }} props
 */
export function PostCard({ post, featured = false }) {
  const HeadingTag = featured ? 'h2' : 'h3';
  return (
    <Link to={blogPostPath(post.slug)} className={cn(styles.card, featured && styles.featured)}>
      <span className={styles.media}>
        <img src={post.cover} alt="" loading={featured ? 'eager' : 'lazy'} className={styles.image} />
        <span className={styles.category}>{post.category}</span>
      </span>
      <span className={styles.body}>
        {featured && <span className={styles.kicker}>Latest article</span>}
        <HeadingTag className={styles.title}>{post.title}</HeadingTag>
        <span className={styles.excerpt}>{post.excerpt}</span>
        <span className={styles.meta}>
          {formatPostDate(post.date)} · {post.readingMinutes} min read
        </span>
        <span className={styles.more}>Read article →</span>
      </span>
    </Link>
  );
}
