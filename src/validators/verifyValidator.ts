import { body } from 'express-validator';

export const verifyValidator = [body('token').notEmpty()];
