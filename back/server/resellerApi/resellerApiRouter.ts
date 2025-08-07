import express from 'express';
import { insert_bank } from './banks/insert_bank';
import { update_bank } from './banks/update_bank';
import { delete_bank } from './banks/delete_bank';
import { admins } from './admins/admins';
import { insert_admin } from './admins/insert_admin';
import { delete_admin } from './admins/delete_admin';
import { get_licences } from '../api/get_licences';
import { licenceAssign } from '../helpers/licence_assign';

export const resellerApiRouter = express.Router();

// BANKS
resellerApiRouter.post('/insert-bank', insert_bank);
resellerApiRouter.post('/update-bank', update_bank);
resellerApiRouter.post('/delete-bank/:id', delete_bank);

// ADMINS
resellerApiRouter.get('/reseller-admins', admins);
resellerApiRouter.post('/insert-reseller-admin', insert_admin);
resellerApiRouter.post('/delete-reseller-admin/:adminId', delete_admin);

// LICENCES
resellerApiRouter.get('/licences', (req, res) => get_licences(req, res, false));
resellerApiRouter.post('/licences-assign', (req, res) => licenceAssign(req, res, false));
