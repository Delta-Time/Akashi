import request from 'supertest';
import app from '..';
import { dbClient } from '../src/db';
import { users } from '../src/db/schema/users';
import { hash } from 'argon2';
import { eq } from 'drizzle-orm';

beforeAll(async () => {
  const hashedPassword = await hash('validpassword');
  await dbClient.insert(users).values({
    username: 'testuser',
    password: hashedPassword,
    createdAt: new Date(),
  });
});

afterAll(async () => {
  await dbClient.delete(users).where(eq(users.username, 'testuser'));
});

describe('POST /issue', () => {
  it('ログイン成功時にJWTトークンを発行する', async () => {
    const response = await request(app).post('/issue').send({
      username: 'testuser',
      password: 'validpassword',
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', '01');
    expect(response.body).toHaveProperty('token');
  });

  it('無効なパスワードでログイン失敗時にエラーメッセージを返す', async () => {
    const response = await request(app).post('/issue').send({
      username: 'testuser',
      password: 'invalidpassword',
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('status', '99');
    expect(response.body).toHaveProperty('message', 'ログイン失敗');
  });

  it('存在しないユーザー名でログイン失敗時にエラーメッセージを返す', async () => {
    const response = await request(app).post('/issue').send({
      username: 'nonexistentuser',
      password: 'somepassword',
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('status', '99');
    expect(response.body).toHaveProperty('message', 'ログイン失敗');
  });

  it('バリデーションエラーがある場合、400エラーを返す', async () => {
    const response = await request(app).post('/issue').send({
      username: '', // 空のユーザー名
      password: 'short',
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('status', '99');
    expect(Array.isArray(response.body.message)).toBe(true); // メッセージはエラーの配列
  });
});
