import express from 'express';
import { delete_user } from './delete_user';
import { get_users } from './get_users';

export const apiRouter = express.Router();

apiRouter.get('/users', get_users);
apiRouter.post('/delete-user/:userId', delete_user);
