import { InferSelectModel } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const client = sqliteTable('client', {
  id: integer('id').primaryKey().unique(),
  name: text('name'),
  address: text('name'),
  identityNumber: integer('number'),
  pib: integer('number').unique(),
  responsiblePerson: text('name'),
});

export const userTable = sqliteTable('users', {
  id: integer('id').primaryKey().notNull(),
  email: text('email').unique().notNull(),
  username: text('username').notNull(),
  password: text('password').notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at'),
  isActive: integer('is_active'),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
});

export type User = InferSelectModel<typeof userTable>;
