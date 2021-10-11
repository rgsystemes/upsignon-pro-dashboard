import express from 'express';
import { authorize_device } from './authorize_device';
import { count_shared_accounts } from './count_shared_accounts';
import { count_shared_devices } from './count_shared_devices';
import { count_users } from './count_users';
import { deactivate_device } from './deactivate_device';
import { deactivate_device_all_users } from './deactivate_device_all_users';
import { delete_allowed_email } from './delete_allowed_email';
import { delete_device } from './delete_device';
import { delete_pwd_reset_request } from './delete_pwd_reset_request';
import { delete_shared_account } from './delete_shared_account';
import { delete_shared_account_user } from './delete_shared_account_user';
import { delete_url } from './delete_url';
import { delete_user } from './delete_user';
import { extract_emails_for_duplicate_passwords } from './extract_emails_for_duplicate_passwords';
import { extract_emails_for_long_unused } from './extract_emails_for_long_unused';
import { extract_emails_for_medium_passwords } from './extract_emails_for_medium_passwords';
import { extract_emails_for_shared_device } from './extract_emails_for_shared_device';
import { extract_emails_for_weak_passwords } from './extract_emails_for_weak_passwords';
import { get_allowed_emails } from './get_allowed_emails';
import { get_password_stats } from './get_password_stats';
import { get_settings } from './get_settings';
import { get_shared_accounts } from './get_shared_accounts';
import { get_shared_devices } from './get_shared_devices';
import { get_urls } from './get_urls';
import { get_users } from './get_users';
import { get_user_devices } from './get_user_devices';
import { grant_pwd_reset_request } from './grant_pwd_reset_request';
import { insert_allowed_email } from './insert_allowed_email';
import { insert_url } from './insert_url';
import { update_allowed_email } from './update_allowed_email';
import { update_setting } from './update_setting';
import { update_shared_account_manager } from './update_shared_account_manager';
import { update_url } from './update_url';

export const apiRouter = express.Router();

// Users
apiRouter.get('/users', get_users);
apiRouter.get('/count-users', count_users);
apiRouter.post('/delete-user/:userId', delete_user);

// Devices
apiRouter.get('/user-devices/:userId', get_user_devices);
apiRouter.post('/delete-device/:deviceId', delete_device);
apiRouter.post('/deactivate-device/:deviceId', deactivate_device);
apiRouter.post('/authorize-device/:deviceId', authorize_device);

// Shared devices
apiRouter.get('/shared-devices', get_shared_devices);
apiRouter.post('/deactivate-device-all-users/:deviceId', deactivate_device_all_users);
apiRouter.get('/count-shared-devices', count_shared_devices);

// Password reset requests
apiRouter.post('/delete-pwd-reset-request/:requestId', delete_pwd_reset_request);
apiRouter.post('/grant-pwd-reset-request/:requestId', grant_pwd_reset_request);

// Shared accounts
apiRouter.get('/shared-accounts', get_shared_accounts);
apiRouter.get('/count-shared-accounts', count_shared_accounts);
apiRouter.post('/delete-shared-account/:sharedAccountId', delete_shared_account);
apiRouter.post('/delete-shared-account-user/:sharedAccountUserId', delete_shared_account_user);
apiRouter.post('/update-shared-account-manager', update_shared_account_manager);

// Stats
apiRouter.get('/get-password-stats', get_password_stats);

// Extracts
apiRouter.get('/extract-emails-for-duplicate-passwords', extract_emails_for_duplicate_passwords);
apiRouter.get('/extract-emails-for-weak-passwords', extract_emails_for_weak_passwords);
apiRouter.get('/extract-emails-for-medium-passwords', extract_emails_for_medium_passwords);
apiRouter.get('/extract-emails-for-shared-device', extract_emails_for_shared_device);
apiRouter.get('/extract-emails-for-long-unused', extract_emails_for_long_unused);

// Settings
apiRouter.get('/settings', get_settings);
apiRouter.post('/setting', update_setting);

// Allowed emails
apiRouter.get('/allowed-emails', get_allowed_emails);
apiRouter.post('/delete-allowed-email/:id', delete_allowed_email);
apiRouter.post('/update-allowed-email', update_allowed_email);
apiRouter.post('/insert-allowed-email', insert_allowed_email);

// Urls
apiRouter.get('/urls', get_urls);
apiRouter.post('/delete-url/:id', delete_url);
apiRouter.post('/update-url', update_url);
apiRouter.post('/insert-url', insert_url);
