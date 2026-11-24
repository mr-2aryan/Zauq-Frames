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
];
