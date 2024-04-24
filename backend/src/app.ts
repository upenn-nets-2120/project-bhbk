import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import sessions from 'express-session';

import * as middlewares from './middlewares';
import api from './api';
import MessageResponse from './types/MessageResponse';

require('dotenv').config();

const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(sessions({
  secret: 'supersecret',
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 60 * 24 },
  resave: false
}))
app.use(express.json());

app.get<{}, MessageResponse>('/', (req, res) => {
  res.json({
    message: 'Welcome to InstaLite API!',
  });
});

app.use(api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
