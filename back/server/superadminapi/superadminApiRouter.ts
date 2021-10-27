import express from 'express';
import { delete_admin } from '../api/delete_admin';
import { checkIsSuperAdmin } from '../helpers/checkIsSuperAdmin';
import { delete_group } from './delete_group';
import { get_groups } from './get_groups';
import { update_group } from './update_group';
import { get_superadmins } from './get_superadmins';
import { insert_group } from './insert_group';
import { insert_super_admin } from './insert_super_admin';
import { update_setting } from './update_setting';

export const suparadminApiRouter = express.Router();

suparadminApiRouter.use(async (req, res, next) => {
  const isSuperadmin = await checkIsSuperAdmin(req, res);
  if (!isSuperadmin) {
    return res.status(401).end();
  }
  next();
});

// SUPER ADMIN USERS
suparadminApiRouter.get('/super-admins', get_superadmins);
suparadminApiRouter.post('/insert-super-admin', insert_super_admin);
suparadminApiRouter.post('/delete-super-admin/:id', delete_admin);

// GROUPS
suparadminApiRouter.get('/groups', get_groups);
suparadminApiRouter.post('/insert-group', insert_group);
suparadminApiRouter.post('/update-group', update_group);
suparadminApiRouter.post('/delete-group/:id', delete_group);

// SETTINGS
suparadminApiRouter.post('/update-setting', update_setting);
