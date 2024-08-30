import { type Request, type Response } from 'express';
import { dbClient } from '../../db';
import { roleUsers } from '../../db/schema/roleUsers';
import { and, eq } from 'drizzle-orm';

const assignDeleteController = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId, 10);
  const roleId = parseInt(req.params.roleId, 10);

  const result = await dbClient
    .delete(roleUsers)
    .where(and(eq(roleUsers.userId, userId), eq(roleUsers.roleId, roleId)));

  if (!result) {
    return res.status(400).json({ status: '91' });
  }

  return res.status(200).json({ status: '02' });
};

export default assignDeleteController;
