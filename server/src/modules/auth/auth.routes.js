import { Router } from 'express';
import { validateBody } from '../../middleware/validate.js';
import { changePassword, listOrders, login, logout, me, register, updateProfile } from './auth.controller.js';
import { requireUser } from './auth.middleware.js';
import { loginSchema, passwordSchema, profileSchema, registerSchema } from './auth.schema.js';

/** /api/auth */
export const authRouter = Router();
authRouter.post('/register', validateBody(registerSchema), register);
authRouter.post('/login', validateBody(loginSchema), login);
authRouter.post('/logout', logout);
authRouter.get('/me', me);

/** /api/account — signed-in only. */
export const accountRouter = Router();
accountRouter.use(requireUser);
accountRouter.patch('/profile', validateBody(profileSchema), updateProfile);
accountRouter.post('/password', validateBody(passwordSchema), changePassword);
accountRouter.get('/orders', listOrders);
