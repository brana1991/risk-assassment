import { defineConfig } from 'drizzle-kit';

console.log(process.env.TURSO_AUTH_TOKEN, 'ovde');

export default defineConfig({
  schema: './drizzle/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  driver: 'turso',
  dbCredentials: {
    url: `${process.env.TURSO_DATABASE_URL}`,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
});
