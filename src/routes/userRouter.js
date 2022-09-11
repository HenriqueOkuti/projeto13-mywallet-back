import express from 'express';
import {
  NewTransaction,
  Transactions,
} from '../controllers/userControllers.js';

//NEW TRANSACTION:
const newtransactionRouter = express.Router();
newtransactionRouter.post('/new-transaction', NewTransaction);
export { newtransactionRouter };

//TRANSACTIONS:
const transactionsRouter = express.Router();
transactionsRouter.get('/transactions', Transactions);
export { transactionsRouter };

//BONUS FEATURES:
//DELETE: axios.delete

//MODIFY: axios.put
