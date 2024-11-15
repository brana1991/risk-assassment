import { ProjectType } from '@/app/dashboard/projects/types';
import { InferSelectModel } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

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
  workingGroupDocuments: text('working_group_documents_urls').notNull().default('[]'),
  neutralPersonDocuments: text('neutral_person_documents_urls').notNull().default('[]'),
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
  projectTypeId: text('project_type_id').references(() => projectTypeTable.id),
  projectSectionTypeId: text('project_section_type_id').references(
    () => projectSectionTypeTable.id,
  ),
});

export const projectTypeTable = sqliteTable('projectType', {
  id: text('id').primaryKey().notNull(),
  type: text('type').$type<ProjectType>().default(ProjectType.CATASTROPHE_RISK).notNull(),
});

export const projectSectionTypeTable = sqliteTable('projectSections', {
  id: text('id').primaryKey().notNull(),
});

export const catastropheSections = sqliteTable('catastropheSections', {
  id: text('id').primaryKey().notNull(),
  sectionId: text('section_id')
    .references(() => projectSectionTypeTable.id)
    .notNull(),
  participantsSection: text('participants_section').notNull()
    .default(`За израду Процене ризика од катастрофа Општа болница „Др Радивој Симовновић“ Сомбор ангажовало је на основу уговора број 22-1836/7 од 01.09.2022. године привредно друштво Заштита на раду и заштита животне средине „Београд“ доо Београд на адреси Дескашева 7, 11000 Београд, које заступа директор др Миодраг Пергал. Лице за контакт: Драгана Николић, телефон: 062 800 5019.
Пре почетка израде процене ризика од катастрофа одржан је састанак где су представници Опште болнице „Др Радивој Симоновић“ Сомбор упознали чланове тима израђивача процене са специфичностима и политиком привредног друштва и историјом догађаја, на локацији на којој су смештени. Том приликом је извршена прелиминарна идентификација опасности које у датом тренутку могу да угрозе запослене, пацијенте и и друга лица која се зетекну на локацијама болнице али и њихову критичну инфраструктуру што ће детаљније бити представљено у следећој табели:
`),
});

export type Session = InferSelectModel<typeof sessionTable>;
export type User = InferSelectModel<typeof userTable>;
export type Projects = InferSelectModel<typeof projectTable>;
export type ProjectSection = InferSelectModel<typeof projectSectionTypeTable>;
export type CatastropheSections = InferSelectModel<typeof catastropheSections>;
export type ProjectTableType = InferSelectModel<typeof projectTypeTable>;
export type Client = InferSelectModel<typeof client>;
