import { randomBytes } from 'crypto';
import { dbClient } from '../db';
import { privateKeys } from '../db/schema/privateKeys';
import { desc } from 'drizzle-orm';
import { eq } from 'drizzle-orm';

const key = randomBytes(200).toString('hex');

const latestKey = await dbClient
  .select()
  .from(privateKeys)
  .orderBy(desc(privateKeys.createdAt))
  .limit(1);

if (latestKey.length == 1) {
  await dbClient
    .update(privateKeys)
    .set({ expiredAt: new Date() })
    .where(eq(privateKeys.id, latestKey[0].id));
}

console.log('Keyをローテーションしました。');
await dbClient.insert(privateKeys).values({ key });

process.exit(0);
