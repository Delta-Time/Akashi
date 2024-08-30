import { type Request, type Response } from 'express';
import { dbClient } from '../../db';
import { roleUsers } from '../../db/schema/roleUsers';
import { users } from '../../db/schema/users';
import { eq } from 'drizzle-orm';
import { roles } from '../../db/schema/roles';

const assignCreateController = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId, 10);
  const roleId = parseInt(req.params.roleId, 10);

  const userExist = await dbClient
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
    .execute();

  const roleExist = await dbClient
    .select()
    .from(roles)
    .where(eq(roles.id, roleId))
    .limit(1)
    .execute();

  if (userExist.length <= 0 || roleExist.length <= 0) {
    return res.status(400).json({ status: '91' });
  }

  const result = await dbClient.insert(roleUsers).values({
    userId,
    roleId,
  });

  if (!result) {
    return res.status(400).json({ status: '92' });
  }

  return res.status(201).json({ status: '02' });
};

export default assignCreateController;
