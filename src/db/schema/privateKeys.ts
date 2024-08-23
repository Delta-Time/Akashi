import { serial, varchar, timestamp, pgTable } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const privateKeys = pgTable('private_keys', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 65535 }).notNull(),
  expiredAt: timestamp('expired_at'),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
});
