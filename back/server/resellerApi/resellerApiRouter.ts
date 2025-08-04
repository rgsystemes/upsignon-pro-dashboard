import express from 'express';
import { insert_bank } from './banks/insert_bank';
import { update_bank } from './banks/update_bank';
import { delete_bank } from './banks/delete_bank';

export const resellerApiRouter = express.Router();

// BANKS
resellerApiRouter.post('/insert-bank', insert_bank);
resellerApiRouter.post('/update-bank', update_bank);
resellerApiRouter.post('/delete-bank/:id', delete_bank);
