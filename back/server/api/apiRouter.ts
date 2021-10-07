import express from 'express';
import { delete_user } from './delete_user';
import { get_users } from './get_users';
import { get_user_devices } from './get_user_devices';

export const apiRouter = express.Router();

apiRouter.get('/users', get_users);
apiRouter.post('/delete-user/:userId', delete_user);
apiRouter.get('/user-devices/:userId', get_user_devices);
