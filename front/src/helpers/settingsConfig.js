export const settingsConfig = {
  DISABLE_MANUAL_VALIDATION_FOR_PASSWORD_FORGOTTEN: {
    groupsTitle: 'sasettings_disable_reset_pwd_manual_admin_check',
    recommendedValue: false,
    userTitle: null,
  },
  DISABLE_OFFLINE_MODE_DEFAULT_DESKTOP: {
    groupsTitle: 'sasettings_disable_offline_desktop',
    recommendedValue: false,
    userTitle: 'user_allowed_offline_desktop',
    reverseMeaningForUser: true,
    dbNameForUser: 'allowed_offline_desktop',
  },
  DISABLE_OFFLINE_MODE_DEFAULT_MOBILE: {
    groupsTitle: 'sasettings_disable_offline_mobile',
    recommendedValue: false,
    userTitle: 'user_allowed_offline_mobile',
    reverseMeaningForUser: true,
    dbNameForUser: 'allowed_offline_mobile',
  },
  ALLOWED_TO_EXPORT: {
    groupsTitle: 'sasettings_allow_csv_export',
    recommendedValue: false,
    userTitle: 'user_allowed_csv_export',
    reverseMeaningForUser: false,
    dbNameForUser: 'allowed_to_export',
  },
  ALLOWED_WINDOWS: {
    groupsTitle: 'sasettings_allow_windows',
    recommendedValue: true,
    userTitle: 'user_allow_windows',
    reverseMeaningForUser: false,
  },
  ALLOWED_MACOS: {
    groupsTitle: 'sasettings_allow_macos',
    recommendedValue: true,
    userTitle: 'user_allow_macos',
    reverseMeaningForUser: false,
  },
  ALLOWED_LINUX: {
    groupsTitle: 'sasettings_allow_linux',
    recommendedValue: true,
    userTitle: 'user_allow_linux',
    reverseMeaningForUser: false,
  },
  ALLOWED_IOS: {
    groupsTitle: 'sasettings_allow_ios',
    recommendedValue: true,
    userTitle: 'user_allow_ios',
    reverseMeaningForUser: false,
  },
  ALLOWED_ANDROID: {
    groupsTitle: 'sasettings_allow_android',
    recommendedValue: true,
    userTitle: 'user_allow_android',
    reverseMeaningForUser: false,
  },
  REQUIRE_ADMIN_CHECK_FOR_SECOND_DEVICE: {
    groupsTitle: 'sasettings_require_admin_check_for_second_device',
    recommendedValue: false,
    userTitle: null,
  },
};

// NB :
//  - When null, the value will be considered as "recommendedValue"
