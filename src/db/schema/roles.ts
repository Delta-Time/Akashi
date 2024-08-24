import {
  pgTable,
  serial,
  varchar,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core';
import { apps } from './apps';

export const roles = pgTable('roles', {
  id: serial('id').primaryKey(),
  appId: integer('app_id')
    .notNull()
    .references(() => apps.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  name: varchar('name', { length: 255 }),
  code: varchar('code', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
