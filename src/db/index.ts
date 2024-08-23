import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const dbUrl = Bun.env.DATABASE_URL ?? '/dev/null';
const pg = postgres(dbUrl);
const dbClient = drizzle(pg);

export { dbClient };
