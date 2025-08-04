import express from 'express';
import { insert_bank } from './banks/insert_bank';
import { update_bank } from './banks/update_bank';
import { delete_bank } from './banks/delete_bank';
import { admins } from './admins/admins';
import { insert_admin } from './admins/insert_admin';
import { delete_admin } from './admins/delete_admin';

export const resellerApiRouter = express.Router();

// BANKS
resellerApiRouter.post('/insert-bank', insert_bank);
resellerApiRouter.post('/update-bank', update_bank);
resellerApiRouter.post('/delete-bank/:id', delete_bank);

// ADMINS
resellerApiRouter.get('/reseller-admins', admins);
resellerApiRouter.post('/insert-reseller-admin', insert_admin);
resellerApiRouter.post('/delete-reseller-admin/:adminId', delete_admin);
