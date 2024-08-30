import { type Request, type Response } from 'express';
import { dbClient } from '../../db';
import { roleUsers } from '../../db/schema/roleUsers';

const assignListController = async (req: Request, res: Response) => {
  const result = await dbClient.select().from(roleUsers).execute();
  return res.status(200).json(result);
};

export default assignListController;
