import { serial, varchar, timestamp, pgTable } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 255 }).notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  jwtSub: varchar('jwt_sub', { length: 255 }),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
});
