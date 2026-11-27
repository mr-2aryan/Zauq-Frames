/**
 * The database schema, as numbered steps. Each runs once, in order, in its own
 * transaction, and is recorded in `schema_migrations`. Never edit a step that
 * has run — add a new one.
 *
 * Each collection is a table of records: an `id`, the record itself as JSONB
 * (`data`) and its timestamps, with indexes on the fields it is looked up by.
 */
const collection = (table) => `
  create table ${table} (
    id text primary key,
    data jsonb not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  );`;

export const MIGRATIONS = [
  {
    id: '001_initial',
    sql: `
      ${collection('users')}
      create unique index users_email on users ((data->>'email'));

      ${collection('orders')}
      create index orders_customer on orders ((data->>'customerId'));

      ${collection('reviews')}
      create index reviews_product on reviews ((data->>'productId'));

      ${collection('messages')}

      ${collection('subscribers')}
      create unique index subscribers_email on subscribers ((data->>'email'));

      -- Sign-in sessions: only a hash of each token is kept.
      create table sessions (
        token_hash text primary key,
        user_id text not null references users (id) on delete cascade,
        expires_at timestamptz not null,
        created_at timestamptz not null default now()
      );
      create index sessions_user on sessions (user_id);
    `,
  },
  {
    // The shop's catalogue and settings move into the database so the admin can edit them;
    // uploaded images are files on disk, recorded in `media` (never stored in the database).
    id: '002_catalogue_and_admin',
    sql: `
      ${collection('collections')}
      create unique index collections_slug on collections ((data->>'slug'));

      ${collection('products')}
      create unique index products_slug on products ((data->>'slug'));
      create index products_collection on products ((data->>'collection'));

      -- Shop settings, one record per key (e.g. 'frames': sizes, prices, delivery, promotion).
      ${collection('settings')}
      create unique index settings_key on settings ((data->>'key'));

      -- Uploaded images: where each file and its resized copies are stored on disk.
      ${collection('media')}

      -- Who did what in the admin, and when.
      ${collection('admin_activity')}
      create index admin_activity_created on admin_activity (created_at desc);

      -- A session is either a shop sign-in or an admin sign-in; one can't stand in for the other.
      alter table sessions add column scope text not null default 'shop';
    `,
  },
  {
    // When each sign-in was last used: admin sessions end after an hour of no activity.
    id: '003_session_activity',
    sql: `alter table sessions add column last_seen_at timestamptz not null default now();`,
  },
  {
    // Blog posts, edited in the admin (they used to live in the shop's code).
    id: '004_blog',
    sql: `
      ${collection('blog_posts')}
      create unique index blog_posts_slug on blog_posts ((data->>'slug'));
    `,
  },
];
