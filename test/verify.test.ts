import request from 'supertest';
import app from '..';
import { dbClient } from '../src/db';
import { users } from '../src/db/schema/users';
import jwt from 'jsonwebtoken';
import { hash } from 'argon2';
import getPrivateKey from '../src/helpers/getPrivateKey';
import { eq } from 'drizzle-orm';

var privateKey = '';

beforeAll(async () => {
  const hashedPassword = await hash('validpassword');
  await dbClient.insert(users).values({
    username: 'testuser',
    password: hashedPassword,
    jwtSub: 'testsub',
    createdAt: new Date(),
  });

  privateKey = await getPrivateKey();
});

afterAll(async () => {
  await dbClient.delete(users).where(eq(users.username, 'testuser'));
});

describe('POST /verify', () => {
  it('有効なトークンで検証が成功する', async () => {
    const token = jwt.sign(
      { username: 'testuser', sub: 'testsub', jwt_version: 1 },
      privateKey,
    );

    const response = await request(app).post('/verify').send({ token });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', '02');
  });

  it('トークンバージョンが異なる場合にエラーを返す', async () => {
    const token = jwt.sign(
      { username: 'testuser', sub: 'testsub', jwt_version: 2 },
      privateKey,
    ); // 異なるバージョン

    const response = await request(app).post('/verify').send({ token });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('status', '99');
    expect(response.body).toHaveProperty('reason', '82');
  });

  it('存在しないユーザーの場合にエラーを返す', async () => {
    const token = jwt.sign(
      { username: 'invaliduser', sub: 'invalidsub', jwt_version: 1 },
      privateKey,
    );

    const response = await request(app).post('/verify').send({ token });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('status', '99');
  });

  it('無効なトークンで検証失敗時にエラーを返す', async () => {
    const response = await request(app)
      .post('/verify')
      .send({ token: 'invalidtoken' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('status', '99');
    expect(response.body).toHaveProperty('reason', '99');
  });

  it('トークンがない場合にバリデーションエラーを返す', async () => {
    const response = await request(app).post('/verify').send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('status', '99');
    expect(response.body).toHaveProperty('reason', '80');
  });
});
