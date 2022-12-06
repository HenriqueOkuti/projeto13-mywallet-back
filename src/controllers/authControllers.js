//IMPORTS:
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import joi from 'joi';
import { db } from '../../server.js';

//Sign in
export async function SignIn(req, res) {
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
}

//Login
export async function Login(req, res) {
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
}
