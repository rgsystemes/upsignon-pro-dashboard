import express from 'express';
import { delete_admin } from './delete_admin';
import { checkIsSuperAdmin } from '../helpers/checkIsSuperAdmin';
import { delete_group } from './delete_group';
import { get_groups } from './get_groups';
import { update_group } from './update_group';
import { get_admins } from './get_admins';
import { insert_group } from './insert_group';
import { insert_admin } from './insert_admin';
import { update_setting } from './update_setting';
import { update_admin_group } from './update_admin_group';

export const superadminApiRouter = express.Router();

superadminApiRouter.use(async (req, res, next) => {
  const isSuperadmin = await checkIsSuperAdmin(req, res);
  if (!isSuperadmin) {
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
