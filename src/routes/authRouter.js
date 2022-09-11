import express from 'express';
import { Login, SignIn } from '../controllers/authControllers.js';

//SIGN-IN:
const signinRouter = express.Router();
signinRouter.post('/sign-in', SignIn);
export { signinRouter };

//LOGIN:
const loginRouter = express.Router();
loginRouter.post('/login', Login);
export { loginRouter };
