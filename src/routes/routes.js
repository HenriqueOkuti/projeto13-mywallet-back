import express from 'express';
import { loginRouter, signinRouter } from './authRouter.js';
import { newtransactionRouter, transactionsRouter } from './userRouter.js';

const router = express.Router();
router.use(loginRouter);
router.use(signinRouter);
router.use(newtransactionRouter);
router.use(transactionsRouter);

export default router;
