import { isNull } from 'drizzle-orm';
import { dbClient } from '../db';
import { privateKeys } from '../db/schema/privateKeys';

const getPrivateKey = async () => {
  const keys = await dbClient
    .select()
    .from(privateKeys)
    .where(isNull(privateKeys.expiredAt))
    .limit(1);
  if (keys.length != 1) {
    throw new Error('秘密鍵が設定されていません');
  }

  return keys[0].key;
};

export default getPrivateKey;
