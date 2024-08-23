import { Router, type Request, type Response } from 'express';
import { validationResult } from 'express-validator';
import { issueValidationRules } from '../validators/issueValidator';
import { dbClient } from '../db';
import { users } from '../db/schema/users';
import { verify } from 'argon2';
import { eq } from 'drizzle-orm';
import jwtIssue from '../helpers/jwtIssue';

const issueController = Router();

// status:
//  OK: 01
//  NG: 99

issueController.post(
  '/',
  issueValidationRules,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: '99', message: errors.array() });
    }

    const { username, password } = req.body;

    const u = await dbClient
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (u.length != 1) {
      return res.status(400).json({ status: '99', message: 'ログイン失敗' });
    }

    const loginUser = u[0];
    const isValid = await verify(loginUser.password, password);

    if (!isValid) {
      return res.status(400).json({ status: '99', message: 'ログイン失敗' });
    }

    // ログイン成功
    const userId = loginUser.id;
    const jwtToken = await jwtIssue(userId);

    return res.status(200).json({ status: '01', token: jwtToken });
  },
);

export default issueController;
