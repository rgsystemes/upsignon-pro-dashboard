const translations = {
  actions: 'Actions',
  delete: 'Delete',
  validate: 'Validate',
  cancel: 'Cancel',
  menu_overview: 'Overview',
  menu_users: 'Users',
  menu_settings: 'Settings',
  loading: 'Loading data...',
  user_email: 'Email',
  user_data: 'Data',
  user_nb_devices: 'Nb of devices',
  user_nb_devices_value: '$nb devices',
  user_nb_codes_and_accounts: 'Nb of web accounts and codes (shared or not)',
  user_nb_codes_value: '$nb codes',
  user_nb_accounts_value: '$nb accounts',
  user_nb_shared_items_value: 'of which $nb shared',
  user_passwords_stats: 'Passwords stats (shared or not)',
  user_passwords_weak: '$nb weak',
  user_passwords_medium: '$nb medium',
  user_passwords_strong: '$nb strong',
  user_passwords_reused: 'of which $nb reused',
  user_delete_warning:
    'Beware, you are about to delete $email and all his data. This is irrerversible.',
  devices_for_user: 'Devices of $email',
  device_name: 'Device name',
  device_app_version: 'App version',
  device_type: 'Type',
  device_status: 'Status',
  device_last_session: 'Last session',
  device_deactivate: 'Deactivate',
  device_authorize: 'Authorize',
  device_delete_warning:
    'This will definitively delete this device and its history.\n\nYou can use the Deactivate option to no longer authorize connections from this device while keeping its history.\n\nContinue the deletion?',
  device_deactivate_warning:
    'This device will no longer be authorized but will stay in the list.\n\nDeactivate?',
  device_authorize_warning:
    'This device will be authorized without the user needing to validate his email address.\n\nMake sure this request originates from a legitimate user!\n\nAuthorize?',
  password_reset_requests: 'Password reset requests',
  password_reset_request_status: 'Status',
  password_reset_request_expired: 'Token has expired',
  password_reset_request_valid_until: 'Email sent. Token is valid until $date.',
  password_reset_request_grant: 'Grant',
  password_reset_request_delete_warning: 'Do you wish to delete this password reset request?',
  password_reset_request_grant_warning:
    'Please make sure the request was made by the user himself.\n\nGrant?',
  settings_security: 'Security settings',
  settings_reset_pwd_admin_check:
    'To reset his password, a user must obtain a validation from an administrator:',
  settings_change: 'Change',
  yes: 'YES',
  no: 'NO',
  settings_allowed_emails: 'Authorized email addresses',
  settings_allowed_emails_pattern:
    'You can enter entire email addresses or use the syntax *@domain.com to allow all addresses of a domain.',
  settings_allowed_emails_email_pattern: 'Email',
  settings_allowed_emails_add: 'Add a new email address',
  settings_allowed_emails_delete_warning:
    'This will not delete safes for users matching this email address pattern.\n\nDelete ?',
};

export default translations;
