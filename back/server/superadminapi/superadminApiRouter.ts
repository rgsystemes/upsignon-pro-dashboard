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
import { update_superadmin_status } from './update_superadmin_status';
import { get_password_stats } from '../api/get_password_stats';
import { get_usage_stats } from '../api/get_usage_stats';
import { get_setting } from './get_setting';
import { test_email } from './test_email';

export const superadminApiRouter = express.Router();

superadminApiRouter.use(async (req, res, next) => {
  // @ts-ignore
  if (!req.session.isSuperadmin) {
    return res.status(401).end();
  }
  next();
});

superadminApiRouter.get('/test-email', test_email);

// ADMIN USERS
superadminApiRouter.get('/admins', get_admins);
superadminApiRouter.post('/insert-admin', insert_admin);
superadminApiRouter.post('/delete-admin/:id', delete_admin);
superadminApiRouter.post('/update-admin-group', update_admin_group);
superadminApiRouter.post('/update-superadmin-status', update_superadmin_status);

// GROUPS
superadminApiRouter.get('/groups', get_groups);
superadminApiRouter.post('/insert-group', insert_group);
superadminApiRouter.post('/update-group', update_group);
superadminApiRouter.post('/delete-group/:id', delete_group);

// SETTINGS
superadminApiRouter.post('/get-setting', get_setting);
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

// Stats
superadminApiRouter.get('/get-password-stats', (req, res) => {
  get_password_stats(req, res, true);
});
superadminApiRouter.get('/get-usage-stats', (req, res) => get_usage_stats(req, res, true));
