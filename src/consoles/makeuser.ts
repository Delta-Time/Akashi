import { question } from 'readline-sync';
import { dbClient } from '../db';
import { users } from '../db/schema/users';
import { eq } from 'drizzle-orm';
import { hash } from 'argon2';

console.clear();

while (true) {
  console.log('ユーザーを追加します。(C-cでキャンセル)');
  const username = question('username: ');
  const password = question('password: ', { hideEchoBack: true });
  const confirm = question('password(retype): ', { hideEchoBack: true });

  if (password != confirm) {
    console.clear();
    console.log('passwordが一致しません');
    continue;
  }

  if (password.length < 8) {
    console.clear();
    console.log('passwordは8文字以上が必要');
    continue;
  }

  console.log('重複チェック中…');

  const count = await dbClient
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (count.length != 0) {
    console.clear();
    console.log('usernameが重複しています。');
    continue;
  }

  console.log('重複チェックOK（重複なし）');
  console.log('登録中…');

  const hashedPassword = await hash(password);

  await dbClient.insert(users).values({
    username,
    password: hashedPassword,
  });

  console.log(`登録しました: ${username}`);
  break;
}

process.exit(0);
