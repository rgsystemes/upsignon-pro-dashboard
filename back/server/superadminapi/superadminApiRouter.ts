import express from 'express';
import { delete_admin } from './delete_admin';
import { delete_group } from './delete_group';
import { get_groups } from './get_groups';
import { update_group } from './update_group';
import { get_admins } from './get_admins';
import { insert_group } from './insert_group';
import { insert_admin } from './insert_admin';
import { update_setting } from './update_setting';
import { update_admin_group } from './update_admin_group';
import { get_pending_password_reset_requests } from '../api/get_pending_password_reset_requests';
import { count_password_reset_requests } from '../api/count_password_reset_requests';
import { delete_pwd_reset_request } from '../api/delete_pwd_reset_request';
import { grant_pwd_reset_request } from '../api/grant_pwd_reset_request';

export const superadminApiRouter = express.Router();

superadminApiRouter.use(async (req, res, next) => {
  // @ts-ignore
  if (!req.session.isSuperadmin) {
    return res.status(401).end();
  }
  next();
});

// ADMIN USERS
superadminApiRouter.get('/admins', get_admins);
superadminApiRouter.post('/insert-admin', insert_admin);
superadminApiRouter.post('/delete-admin/:id', delete_admin);
superadminApiRouter.post('/update-admin-group', update_admin_group);

// GROUPS
superadminApiRouter.get('/groups', get_groups);
superadminApiRouter.post('/insert-group', insert_group);
superadminApiRouter.post('/update-group', update_group);
superadminApiRouter.post('/delete-group/:id', delete_group);

// SETTINGS
superadminApiRouter.post('/update-setting', update_setting);

// Password reset requests
superadminApiRouter.get('/count-password-reset-requests', (req, res) => {
  count_password_reset_requests(req, res, true);
});
superadminApiRouter.get('/get-pending-password-reset-requests', (req, res) => {
  get_pending_password_reset_requests(req, res, true);
});
superadminApiRouter.post('/delete-pwd-reset-request/:requestId', (req, res) => {
  delete_pwd_reset_request(req, res, true);
});
superadminApiRouter.post('/grant-pwd-reset-request/:requestId', (req, res) => {
  grant_pwd_reset_request(req, res, true);
});
