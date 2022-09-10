import cors from 'cors';
import express from 'express';
import { MongoClient, ObjectId, ReturnDocument } from 'mongodb';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import dayjs from 'dayjs';
import dotenv from 'dotenv';
import joi from 'joi';

const server = express();

server.use(cors());
server.use(express.json());
dotenv.config();

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;

mongoClient
  .connect()
  .then(() => {
    db = mongoClient.db('my-wallet');
    console.log('Ready to go');
  })
  .catch((error) => console.log(error));

server.post('/sign-in', async (req, res) => {
  const newUser = req.body;

  const joiUser = joi.object({
    name: joi.string().required(),
    email: joi.string().required(),
    password: joi.string().required(),
  });
  const joiFeedback = joiUser.validate(newUser);
  if (joiFeedback.error) {
    return res.sendStatus(422);
  }

  try {
    const searchUser = await db
      .collection('users')
      .findOne({ email: newUser.email });
    if (searchUser) {
      return res.sendStatus(409);
    }
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }

  const STEPS = 10;
  const passwordHash = bcrypt.hashSync(newUser.password, STEPS);

  await db
    .collection('users')
    .insertOne({ ...newUser, password: passwordHash, transactions: [] });
  res.sendStatus(201);
});

server.post('/login', async (req, res) => {
  const credentials = req.body;

  const joiCredentials = joi.object({
    email: joi.string().required(),
    password: joi.string().required(),
  });
  let joiFeedback = joiCredentials.validate(credentials);
  if (joiFeedback.error) {
    return res.sendStatus(422);
  }

  try {
    const searchUser = await db
      .collection('users')
      .findOne({ email: credentials.email });
    const verification =
      searchUser &&
      bcrypt.compareSync(credentials.password, searchUser.password);

    if (verification) {
      const token = uuid();
      await db.collection('sessions').insertOne({
        token,
        userId: searchUser._id,
      });
      res.send(token);
    } else {
      return res.sendStatus(409);
    }
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});

server.post('/new-transaction', async (req, res) => {
  const recievedToken = req.headers.authorization.replaceAll('Bearer ', '');
  const recievedBody = req.body;
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
});

server.get('/transactions', async (req, res) => {
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
});

//DELETE:

//MODIFY:

server.listen(5000, () => console.log('Listening on port 5000'));
