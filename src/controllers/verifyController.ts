import { Router, type Request, type Response } from 'express';
import { verifyValidator } from '../validators/verifyValidator';
import { validationResult } from 'express-validator';
import { verify } from 'jsonwebtoken';
import getPrivateKey from '../helpers/getPrivateKey';
import { dbClient } from '../db';
import { users } from '../db/schema/users';
import { eq } from 'drizzle-orm';

interface AkashiPayload {
  username: string;
  sub: string;
  jwt_version: number;
}

const verifyController = Router();

/*
status
- OK: 02
- NG: 99
reason
- トークンが渡されていない（バリデーションエラー）：80
- トークンが古いソフトで発行されている: 82
- ユーザーが既に他のトークンを発行したか無効にした: 83
- トークン破損（検証失敗）: 99
*/

verifyController.post(
  '/',
  verifyValidator,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: '99', reason: '80' });
    }

    const secret = await getPrivateKey();
    const currentVersion = process.env.JWT_VERSION ?? (-1 as number);
    const { token } = req.body;

    try {
      const decoded = verify(token, secret) as AkashiPayload;

      // トークンバージョンチェック
      if (decoded.jwt_version != currentVersion) {
        return res.status(400).json({ status: '99', reason: '82' });
      }

      // 当該ユーザー存在チェック
      const targetUser = await dbClient
        .select()
        .from(users)
        .where(eq(users.jwtSub, decoded.sub))
        .limit(1);
      if (targetUser.length != 1) {
        return res.status(400).json({ status: '99', reason: '83' });
      }

      // トークン正常
      return res.status(200).json({ status: '02' });
    } catch {
      return res.status(400).json({ status: '99', reason: '99' });
    }
  },
);

export default verifyController;
