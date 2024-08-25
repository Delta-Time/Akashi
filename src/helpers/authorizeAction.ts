import { type Request, type Response, type NextFunction } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import axios from 'axios';

// ヘルパー関数を作成
const authorizeAction = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Authorizationヘッダーからトークンを取得
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res
        .status(401)
        .json({ error: '認証ヘッダーが存在しないか、無効です。' });
    }

    const token = authHeader.split(' ')[1];

    // 自身の/verify APIを呼び出してトークンを検証
    const verifyResponse = await axios.post('http://localhost:3000/verify', {
      token,
    });

    if (verifyResponse.data.status !== '02') {
      return res.status(401).json({ error: '無効なトークンです。' });
    }

    // トークンをデコード
    const decoded = jwt.decode(token) as JwtPayload;

    // role.akashiが存在し、必要な権限があるか確認
    const requiredAction = req.params.action;
    const roleAkashi = decoded?.role?.akashi;

    if (!roleAkashi || !roleAkashi.includes(requiredAction)) {
      return res.status(403).json({ error: '権限がありません。' });
    }

    // 権限がある場合、次のミドルウェアまたはルートハンドラに進む
    next();
  } catch (error) {
    console.error('認証エラー:', error);
    res.status(500).json({ error: 'サーバー内部エラーが発生しました。' });
  }
};

export default authorizeAction;
