import { InferSelectModel } from 'drizzle-orm';
import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';

export const client = sqliteTable('client', {
  id: text('id').primaryKey().notNull().unique(),
  name: text('name').notNull(),
  address: text('address').notNull(),
  identityNumber: integer('identity_number').notNull(),
  pib: integer('pib').unique().notNull(),
  responsiblePerson: text('responsible_person').notNull(),
});

export const userTable = sqliteTable('users', {
  id: text('id').primaryKey().notNull(),
  email: text('email').unique().notNull(),
  username: text('username').unique().notNull(),
  password: text('password').notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at'),
  isActive: integer('is_active'),
});

export const sessionTable = sqliteTable('session', {
  sessionId: text('session_id').primaryKey().notNull(),
  userId: text('user_id').references(() => userTable.id),
  sessionStart: text('session_start').notNull(),
  sessionEnd: text('session_end'),
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token').notNull(),
  expiresAt: integer('expires_at').notNull(),
});

export const projectTable = sqliteTable('projects', {
  id: text('id').primaryKey().notNull(),
  name: text('name').unique().notNull(),
  ownerId: text('owner_id').references(() => userTable.id),
  clientId: text('client_id').references(() => client.id),
  type: text('type').notNull(),
});

export type Session = InferSelectModel<typeof sessionTable>;
export type User = InferSelectModel<typeof userTable>;
export type Projects = InferSelectModel<typeof projectTable>;
export type Client = InferSelectModel<typeof client>;
