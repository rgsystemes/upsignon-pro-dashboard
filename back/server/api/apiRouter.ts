import express from 'express';
import { authorize_device } from './authorize_device';
import { deactivate_device } from './deactivate_device';
import { delete_device } from './delete_device';
import { delete_user } from './delete_user';
import { get_users } from './get_users';
import { get_user_devices } from './get_user_devices';

export const apiRouter = express.Router();

apiRouter.get('/users', get_users);
apiRouter.post('/delete-user/:userId', delete_user);
apiRouter.get('/user-devices/:userId', get_user_devices);
apiRouter.post('/delete-device/:deviceId', delete_device);
apiRouter.post('/deactivate-device/:deviceId', deactivate_device);
apiRouter.post('/authorize-device/:deviceId', authorize_device);
