import cors from 'cors';
import express from 'express';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import router from './src/routes/routes.js';

const server = express();

server.use(cors());
server.use(express.json());
dotenv.config();

const mongoClient = new MongoClient(process.env.MONGO_URI);
export let db;

mongoClient
  .connect()
  .then(() => {
    db = mongoClient.db('my-wallet');
    console.log('Ready to go');
  })
  .catch((error) => console.log(error));

server.use(router);

server.listen(5000, () => console.log('Listening on port 5000'));
