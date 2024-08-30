import request from 'supertest';
import app from '..';
import { users } from '../src/db/schema/users';
import { apps } from '../src/db/schema/apps';
import { dbClient } from '../src/db';
import { Column, eq } from 'drizzle-orm';

import { roles } from '../src/db/schema/roles';
import { hash } from 'argon2';
import { roleUsers } from '../src/db/schema/roleUsers';

var jwtToken = '';
var assignAppId: string, assignRoleId: string, assignUserId: string;

beforeEach(async () => {
  const hashedPassword = await hash('password');

  // 全消ししておく（面倒なので）
  await dbClient.delete(roleUsers);
  await dbClient.delete(roles);
  await dbClient.delete(apps);
  await dbClient.delete(users);

  // 操作用user,app,roleの作成
  const controleUserId = await dbClient
    .insert(users)
    .values({
      password: hashedPassword,
      username: 'controluser',
    })
    .returning({ id: users.id });

  const appId = await dbClient
    .insert(apps)
    .values({
      name: 'Akashi_test',
      code: 'akashi',
    })
    .returning({ id: apps.id });

  for (const r of ['list', 'create', 'read', 'update', 'delete', 'assign']) {
    const roleId = await dbClient
      .insert(roles)
      .values({
        appId: appId[0].id,
        code: r,
        name: r,
      })
      .returning({ id: roles.id });

    await dbClient.insert(roleUsers).values({
      roleId: roleId[0].id,
      userId: controleUserId[0].id,
    });
  }

  const response = await request(app).post('/issue').send({
    username: 'controluser',
    password: 'password',
  });

  jwtToken = response.body.token;

  // assign する対象たちの準備
  const createUser = await request(app)
    .post('/users/create')
    .set('Authorization', `Bearer ${jwtToken}`)
    .send({
      username: 'testuser',
      password: 'password123',
    });

  assignUserId = createUser.body[0].id; // user

  const createApp = await request(app)
    .post('/apps/create')
    .set('Authorization', `Bearer ${jwtToken}`)
    .send({
      name: 'testapp',
      code: 'A test app',
    });

  assignAppId = createApp.body[0].id; // app

  const createRole = await request(app)
    .post('/roles/create')
    .set('Authorization', `Bearer ${jwtToken}`)
    .send({
      name: 'testrole',
      code: 'A test role',
      appId: assignAppId,
    });

  assignRoleId = createRole.body[0].id; // role
});

afterAll(async () => {
  // 全消ししておく（面倒なので）
  await dbClient.delete(roleUsers);
  await dbClient.delete(roles);
  await dbClient.delete(apps);
  await dbClient.delete(users);
});

describe('権限付与コントローラ API テスト', () => {
  it('POST /assign/ で権限を付与する', async () => {
    const response = await request(app)
      .post(`/assign/${assignUserId}/${assignRoleId}`)
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(response.status).toBe(201);

    const errResponse = await request(app)
      .post(`/assign/123456/${assignRoleId}`)
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(errResponse.status).toBe(400);
    expect(errResponse.body).toHaveProperty('status', '91');
  });

  it('DELETE /assign で権限を削除する', async () => {
    await request(app)
      .post(`/assign/${assignUserId}/${assignRoleId}`)
      .set('Authorization', `Bearer ${jwtToken}`);

    const response = await request(app)
      .delete(`/assign/${assignUserId}/${assignRoleId}`)
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', '02');
  });

  it('GET /assign で一覧を取得する', async () => {
    await request(app)
      .post(`/assign/${assignUserId}/${assignRoleId}`)
      .set('Authorization', `Bearer ${jwtToken}`);

    const response = await request(app)
      .get('/assign')
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });
});
