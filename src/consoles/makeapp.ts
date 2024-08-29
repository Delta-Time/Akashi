import { question } from 'readline-sync';
import { dbClient } from '../db';
import { eq } from 'drizzle-orm';
import { apps } from '../db/schema/apps';

console.clear();

while (true) {
  console.log('アプリケーションを追加します。(C-cでキャンセル)');
  const name = question('name: ');
  const code = question('code: ');

  console.log('重複チェック中…');

  const count = await dbClient
    .select()
    .from(apps)
    .where(eq(apps.code, code))
    .limit(1);

  if (count.length != 0) {
    console.clear();
    console.log('codeが重複しています。');
    continue;
  }

  console.log('重複チェックOK（重複なし）');
  console.log('登録中…');

  await dbClient.insert(apps).values({
    name,
    code,
  });

  console.log(`登録しました: ${name}`);
  break;
}

process.exit(0);
