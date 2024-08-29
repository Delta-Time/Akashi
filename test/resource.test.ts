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

  for (const r of ['list', 'create', 'read', 'update', 'delete']) {
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
});

afterAll(async () => {
  // 全消ししておく（面倒なので）
  await dbClient.delete(roleUsers);
  await dbClient.delete(roles);
  await dbClient.delete(apps);
  await dbClient.delete(users);
});

describe('リソースコントローラ API テスト', () => {
  describe('Users リソース操作', () => {
    it('POST /users/create で新しいユーザーを作成する', async () => {
      const response = await request(app)
        .post('/users/create')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          username: 'testuser',
          password: 'password123',
        });

      expect(response.status).toBe(201);
      expect(response.body[0]).toHaveProperty('username', 'testuser');
    });

    it('GET /users/list でユーザー一覧を取得する', async () => {
      const response = await request(app)
        .get('/users/list')
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
    });

    it('GET /users/read/:id でID指定のユーザーを取得する', async () => {
      const createUserResponse = await request(app)
        .post('/users/create')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          username: 'readtestuser',
          password: 'password123',
        });

      const userId = createUserResponse.body[0].id;

      const response = await request(app)
        .get(`/users/read/${userId}`)
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('username', 'readtestuser');
    });

    it('PUT /users/update/:id で既存ユーザーを更新する', async () => {
      const createUserResponse = await request(app)
        .post('/users/create')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          username: 'updatetestuser',
          password: 'password123',
        });

      const userId = createUserResponse.body[0].id;

      const response = await request(app)
        .put(`/users/update/${userId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ password: 'newpassword123' });

      expect(response.status).toBe(200);
      expect(response.body[0]).toHaveProperty('password', 'newpassword123');
    });

    it('DELETE /users/delete/:id で既存ユーザーを削除する', async () => {
      const createUserResponse = await request(app)
        .post('/users/create')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          username: 'deletetestuser',
          password: 'password123',
        });

      const userId = createUserResponse.body[0].id;

      const response = await request(app)
        .delete(`/users/delete/${userId}`)
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('Apps リソース操作', () => {
    it('POST /apps/create で新しいアプリを作成する', async () => {
      const response = await request(app)
        .post('/apps/create')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          name: 'testapp',
          code: 'A test app',
        });

      expect(response.status).toBe(201);
      expect(response.body[0]).toHaveProperty('name', 'testapp');
    });
  });

  describe('Roles リソース操作', () => {
    it('POST /roles/create で新しいロールを作成する', async () => {
      const createResponse = await request(app)
        .post('/apps/create')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          name: 'testapp',
          code: 'A test app',
        });

      const appId = createResponse.body[0].id;

      const response = await request(app)
        .post('/roles/create')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          name: 'testrole',
          code: 'A test role',
          appId,
        });

      expect(response.status).toBe(201);
      expect(response.body[0]).toHaveProperty('name', 'testrole');
    });
  });
});
