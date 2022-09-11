//IMPORTS:
import dayjs from 'dayjs';
import { db } from '../../server.js';

//New transaction
export async function NewTransaction(req, res, next) {
  const recievedToken = req.headers.authorization.replaceAll('Bearer ', '');
  const recievedBody = req.body;
  try {
    const searchToken = await db
      .collection('sessions')
      .findOne({ token: recievedToken });
    const userId = searchToken.userId;
    const searchUser = await db.collection('users').findOne({ _id: userId });
    const userTransactions = searchUser.transactions;
    const key = userTransactions.length;
    const newTransaction = {
      type: recievedBody.type,
      name: recievedBody.name,
      value: recievedBody.value,
      date: dayjs().format('DD/MM'),
      key: key,
      isValid: true,
    };
    userTransactions.push(newTransaction);
    await db
      .collection('users')
      .updateOne({ _id: userId }, { $set: { transactions: userTransactions } });
    res.sendStatus(201);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}

//Transactions
export async function Transactions(req, res, next) {
  const recievedToken = req.headers.authorization.replaceAll('Bearer ', '');
  try {
    const searchToken = await db
      .collection('sessions')
      .findOne({ token: recievedToken });
    if (!searchToken) {
      return res.sendStatus(401);
    }
    const userId = searchToken.userId;
    const searchUser = await db.collection('users').findOne({ _id: userId });
    if (!searchUser) {
      return res.sendStatus(404);
    }
    const transactionHistory = [];
    const transactions = searchUser.transactions;

    for (let i = 0, len = transactions.length; i < len; i++) {
      if (transactions[i].isValid) {
        transactionHistory.push(transactions[i]);
      }
    }

    const userData = {
      name: searchUser.name,
      transactionHistory: transactionHistory,
    };

    return res.send(userData);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
  res.sendStatus(200);
}

//BONUS FEATURES:
//DELETE: axios.delete

//MODIFY: axios.put
