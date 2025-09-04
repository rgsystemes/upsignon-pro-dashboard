# HOW to change role when developping

Roles are 'superadmin', 'restricted_superadmin', 'admin'

# Become 'superadmin'

- in .env, change DEV_FALLBACK_USE_DB_ROLE to false
- restart back server

# Become 'restricted_superadmin'

- in psql, run `UPDATE admins SET admin_role='restricted_superadmin' WHERE email='<VALUE OF DEV_FALLBACK_ADMIN_EMAIL IN .env>';`
- in .env, change DEV_FALLBACK_USE_DB_ROLE to true
- restart back server

**Become 'admin'**

- in psql, run `UPDATE admins SET admin_role='admin' WHERE email='<VALUE OF DEV_FALLBACK_ADMIN_EMAIL IN .env>';`
- in .env, change DEV_FALLBACK_USE_DB_ROLE to true
- restart back server
