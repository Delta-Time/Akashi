import { body } from 'express-validator';

export const issueValidationRules = [
  body('username')
    .isString()
    .withMessage('ユーザー名は文字列である必要があります')
    .isLength({ max: 255 })
    .withMessage('ユーザー名は255文字以内である必要があります')
    .notEmpty()
    .withMessage('ユーザー名は必須です'),
  body('password')
    .isString()
    .withMessage('パスワードは文字列である必要があります')
    .isLength({ max: 65535 })
    .withMessage('パスワードは65535文字以内である必要があります')
    .notEmpty()
    .withMessage('パスワードは必須です'),
];
