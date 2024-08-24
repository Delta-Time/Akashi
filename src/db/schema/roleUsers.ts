import { pgTable, bigint, foreignKey, integer } from 'drizzle-orm/pg-core';
import { roles } from './roles';
import { users } from './users';

export const roleUsers = pgTable('role_users', {
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  roleId: integer('role_id')
    .notNull()
    .references(() => roles.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
});
