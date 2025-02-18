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
import { get_password_reset_requests } from '../api/get_password_reset_requests';
import { count_password_reset_requests } from '../api/count_password_reset_requests';
import { delete_pwd_reset_request } from '../api/delete_pwd_reset_request';
import { grant_pwd_reset_request } from '../api/grant_pwd_reset_request';
import { update_superadmin_status } from './update_superadmin_status';
import { get_password_stats } from '../api/get_password_stats';
import { get_usage_stats } from '../api/get_usage_stats';
import { get_setting } from './get_setting';
import { test_email } from './test_email';
import { extract_database } from '../api/extract_database';
import { extract_emails_for_duplicate_passwords } from '../api/extract_emails_for_duplicate_passwords';
import { extract_emails_for_weak_passwords } from '../api/extract_emails_for_weak_passwords';
import { extract_emails_for_medium_passwords } from '../api/extract_emails_for_medium_passwords';
import { extract_emails_for_shared_device } from '../api/extract_emails_for_shared_device';
import { extract_emails_for_long_unused } from '../api/extract_emails_for_long_unused';
import { send_email, send_email_precheck } from '../api/send_email';
import { extract_emails_msi_install } from '../api/extract_emails_msi_install';
import { get_licences } from '../api/get_licences';
import { extract_admins } from '../api/extract_admins';

export const superadminApiRouter = express.Router();

superadminApiRouter.use(async (req: any, res: any, next) => {
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
superadminApiRouter.get('/get-password-reset-requests', (req, res) => {
  get_password_reset_requests(req, res, true);
});
superadminApiRouter.post('/delete-pwd-reset-request/:requestId', (req, res) => {
  delete_pwd_reset_request(req, res, true);
});
superadminApiRouter.post('/grant-pwd-reset-request/:requestId', (req, res) => {
  grant_pwd_reset_request(req, res, true);
});

// Extracts
superadminApiRouter.get('/extract-database', (req, res) => extract_database(req, res, true));
superadminApiRouter.get('/extract-admins', (req, res) => extract_admins(req, res));
superadminApiRouter.get('/extract-emails-for-duplicate-passwords', (req, res) =>
  extract_emails_for_duplicate_passwords(req, res, true),
);
superadminApiRouter.get('/extract-emails-for-weak-passwords', (req, res) =>
  extract_emails_for_weak_passwords(req, res, true),
);
superadminApiRouter.get('/extract-emails-for-medium-passwords', (req, res) =>
  extract_emails_for_medium_passwords(req, res, true),
);
superadminApiRouter.get('/extract-emails-for-shared-device', (req, res) =>
  extract_emails_for_shared_device(req, res, true),
);
superadminApiRouter.get('/extract-emails-for-long-unused', (req, res) =>
  extract_emails_for_long_unused(req, res, true),
);
superadminApiRouter.get('/extract-emails-msi-install', (req, res) =>
  extract_emails_msi_install(req, res, true),
);

// Send emails
superadminApiRouter.post('/send-email-precheck', (req, res) => send_email_precheck(req, res, true));
superadminApiRouter.post('/send-email', (req, res) => send_email(req, res, true));

// Stats
superadminApiRouter.get('/get-password-stats', (req, res) => {
  get_password_stats(req, res, true);
});
superadminApiRouter.get('/get-usage-stats', (req, res) => get_usage_stats(req, res, true));

// Licences
superadminApiRouter.post('/get-licences', (req, res) => get_licences(req, res, true));
