import express from 'express';
import { delete_admin } from '../api/delete_admin';
import { checkIsSuperAdmin } from '../helpers/checkIsSuperAdmin';
import { get_superadmins } from './get_superadmins';
import { insert_super_admin } from './insert_super_admin';

export const suparadminApiRouter = express.Router();

suparadminApiRouter.use(async (req, res, next) => {
  const isSuperadmin = await checkIsSuperAdmin(req, res);
  if (!isSuperadmin) {
    return res.status(401).end();
  }
  next();
});

suparadminApiRouter.get('/super-admins', get_superadmins);
suparadminApiRouter.post('/insert-super-admin', insert_super_admin);
suparadminApiRouter.post('/delete-super-admin/:id', delete_admin);
