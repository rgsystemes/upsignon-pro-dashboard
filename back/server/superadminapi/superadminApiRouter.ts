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

export const suparadminApiRouter = express.Router();

suparadminApiRouter.use(async (req, res, next) => {
  const isSuperadmin = await checkIsSuperAdmin(req, res);
  if (!isSuperadmin) {
    return res.status(401).end();
  }
  next();
});

// ADMIN USERS
suparadminApiRouter.get('/admins', get_admins);
suparadminApiRouter.post('/insert-admin', insert_admin);
suparadminApiRouter.post('/delete-admin/:id', delete_admin);
suparadminApiRouter.post('/update-admin-group', update_admin_group);

// GROUPS
suparadminApiRouter.get('/groups', get_groups);
suparadminApiRouter.post('/insert-group', insert_group);
suparadminApiRouter.post('/update-group', update_group);
suparadminApiRouter.post('/delete-group/:id', delete_group);

// SETTINGS
suparadminApiRouter.post('/update-setting', update_setting);
