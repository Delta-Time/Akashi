import getPrivateKey from './getPrivateKey';
import { v4 as uuidv4 } from 'uuid';
import { dbClient } from '../db';
import { users } from '../db/schema/users';
import { eq } from 'drizzle-orm';
import { sign } from 'jsonwebtoken';
import { roles } from '../db/schema/roles';
import { roleUsers } from '../db/schema/roleUsers';
import { apps } from '../db/schema/apps';

const jwtIssue = async (userId: number): Promise<string> => {
  const secret = await getPrivateKey();
  const uuid = uuidv4();

  const u = await dbClient
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (u.length != 1) {
    throw new Error('ユーザー情報参照エラー');
  }

  const user = u[0];

  // subjectのアップデート
  await dbClient
    .update(users)
    .set({ jwtSub: uuid })
    .where(eq(users.id, user.id));

  const role = await dbClient
    .select({
      appCode: apps.code,
      roleCode: roles.code,
    })
    .from(roleUsers)
    .leftJoin(roles, eq(roleUsers.roleId, roles.id))
    .leftJoin(apps, eq(roles.appId, apps.id))
    .leftJoin(users, eq(roleUsers.userId, users.id))
    .where(eq(users.id, user.id))
    .execute();

  const roleSet = role.reduce(
    (acc, curr) => {
      if (curr.appCode !== null) {
        if (!acc[curr.appCode]) {
          acc[curr.appCode] = [];
        }
        acc[curr.appCode].push(curr.roleCode ?? 'unknown');
      }
      return acc;
    },
    {} as Record<string, string[]>,
  );

  const payload = {
    username: user.username,
    sub: uuid,
    jwt_version: process.env.JWT_VERSION ?? 'unknown',
    role: roleSet,
  };

  const token = sign(payload, secret);

  return token;
};

export default jwtIssue;
