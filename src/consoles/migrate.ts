import fs from 'fs';
import { dbClient } from '../db';
import { sql } from 'drizzle-orm';

const runMigration = async (filePath: string) => {
  const sqlQuery = fs.readFileSync(filePath, 'utf-8');
  await dbClient.execute(sql.raw(sqlQuery));
  console.log('Migrate OK.');
};

runMigration('src/db/migration.sql');
process.exit(0);
