import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core';

export const apps = pgTable('apps', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }),
  code: varchar('code', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
