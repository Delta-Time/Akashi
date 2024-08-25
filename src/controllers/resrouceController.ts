import { type Request, type Response } from 'express';
import { dbClient } from '../db';
import { eq } from 'drizzle-orm';
import { users } from '../db/schema/users';
import { apps } from '../db/schema/apps';
import { roles } from '../db/schema/roles';

type Table = 'users' | 'apps' | 'roles';

// テーブルのマッピング
const tableMap = {
  users: users,
  apps: apps,
  roles: roles,
};

const resouceController = async (req: Request, res: Response, table: Table) => {
  const action = req.params.action;
  const id = req.params.id ? parseInt(req.params.id, 10) : null;

  // テーブルオブジェクトを取得
  const tableObject = tableMap[table];

  let result;
  try {
    switch (action) {
      case 'list':
        result = await dbClient.select().from(tableObject).execute();
        res.json(result);
        break;

      case 'create':
        const newItem = req.body;
        result = await dbClient
          .insert(tableObject)
          .values(newItem)
          .returning()
          .execute();
        res.status(201).json(result);
        break;

      case 'read':
        if (id === null) {
          return res.status(400).json({ error: '読み取りにはIDが必要です。' });
        }
        result = await dbClient
          .select()
          .from(tableObject)
          .where(eq(tableObject.id, id))
          .execute();
        if (result.length === 0) {
          return res
            .status(404)
            .json({ error: '指定されたIDのアイテムが見つかりません。' });
        }
        res.json(result[0]);
        break;

      case 'update':
        if (id === null) {
          return res.status(400).json({ error: '更新にはIDが必要です。' });
        }
        const updatedItem = req.body;
        result = await dbClient
          .update(tableObject)
          .set(updatedItem)
          .where(eq(tableObject.id, id))
          .returning()
          .execute();
        res.json(result);
        break;

      case 'delete':
        if (id === null) {
          return res.status(400).json({ error: '削除にはIDが必要です。' });
        }
        result = await dbClient
          .delete(tableObject)
          .where(eq(tableObject.id, id))
          .returning()
          .execute();
        res.json({ success: true });
        break;

      default:
        res.status(400).json({ error: '無効なアクションが指定されました。' });
    }
  } catch (error) {
    if (error instanceof Error) {
      res
        .status(500)
        .json({ error: `サーバーエラーが発生しました: ${error.message}` });
    } else {
      res.status(500).json({ error: '不明なエラーが発生しました。' });
    }
  }
};

export default resouceController;
