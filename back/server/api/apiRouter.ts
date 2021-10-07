import express from 'express';
import { get_users } from './get_users';

export const apiRouter = express.Router();

apiRouter.get('/users', get_users);
