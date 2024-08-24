import { keyInSelect } from 'readline-sync';
import { dbClient } from '../db';
import { apps } from '../db/schema/apps';
import { users } from '../db/schema/users';
import { roles } from '../db/schema/roles';
import { and, eq } from 'drizzle-orm';
import { roleUsers } from '../db/schema/roleUsers';

console.clear();

while (true) {
  console.log('ロール割り当てを行います。 (0でキャンセル)');

  // ▽ユーザー
  const userList = await dbClient.select().from(users).execute();
  if (userList.length <= 0) {
    console.log('ユーザーが存在しません');
    process.exit(1);
  }
  const userChoices = userList.map((u) => u.username);
  // choices は nullならlist.length = 0 になり終了されるから、空にならない
  const userIndex = keyInSelect(userChoices as string[], 'ユーザーを選択: ');

  if (userIndex === -1) {
    console.clear();
    break;
  }

  const userId = userList[userIndex].id;

  // ▽アプリ
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
    break;
  }

  const appId = appList[index].id;

  // ▽ロール
  const roleList = await dbClient
    .select()
    .from(roles)
    .where(eq(roles.appId, appId))
    .execute();
  if (roleList.length <= 0) {
    console.log('アプリケーションが存在しません');
    process.exit(1);
  }
  const roleChoices = roleList.map((r) => r.name);
  // choices は nullなら list.length = 0 になり終了されるから、空にならない
  const roleIndex = keyInSelect(roleChoices as string[], 'ロールを選択: ');

  if (roleIndex === -1) {
    console.clear();
    break;
  }

  const roleId = roleList[roleIndex].id;

  const existsCheck = await dbClient
    .select()
    .from(roleUsers)
    .where(and(eq(roleUsers.roleId, roleId), eq(roleUsers.userId, userId)));
  if (existsCheck.length <= 0) {
    await dbClient.insert(roleUsers).values({
      roleId,
      userId,
    });
    console.clear();
    console.log('追加OK');
  } else {
    console.clear();
    console.log('既に追加されています。');
  }
}

process.exit(0);
