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
  isLoggedIn: integer('is_logged_in').notNull().default(0),
});

export const tokenTable = sqliteTable('tokens', {
  id: integer('id').primaryKey().notNull(),
  userId: integer('user_id').notNull(),
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token').notNull(),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').notNull(),
});

export type Token = InferSelectModel<typeof tokenTable>;
export type User = InferSelectModel<typeof userTable>;
