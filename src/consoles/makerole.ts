import { keyInSelect, question } from 'readline-sync';
import { dbClient } from '../db';
import { and, eq } from 'drizzle-orm';
import { apps } from '../db/schema/apps';
import { roles } from '../db/schema/roles';

console.clear();

while (true) {
  console.log('ロールを追加します。(C-cでキャンセル)');

  const appList = await dbClient.select().from(apps).execute();
  if (appList.length <= 0) {
    console.log('アプリケーションが存在しません');
    process.exit(1);
  }
  const choices = appList.map((app) => app.name);
  // choices は nullならappList.length = 0 になり終了されるから、空にならない
  const index = keyInSelect(choices as string[], 'アプリケーションを選択: ');

  if (index === -1) {
    console.clear();
    console.log('アプリケーションを選択する必要があります');
    continue;
  }

  const appId = appList[index].id;

  const name = question('name: ');
  const code = question('code: ');

  console.log('重複チェック中…');

  const count = await dbClient
    .select()
    .from(roles)
    .where(and(eq(roles.code, code), eq(roles.appId, appId)))
    .limit(1);

  if (count.length != 0) {
    console.clear();
    console.log('codeが重複しています。');
    continue;
  }

  console.log('重複チェックOK（重複なし）');
  console.log('登録中…');

  await dbClient.insert(roles).values({
    appId,
    name,
    code,
  });

  console.log(`登録しました: ${name}`);
  break;
}

process.exit(0);
