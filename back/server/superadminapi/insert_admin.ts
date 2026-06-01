import Joi from 'joi';
import { v4 } from 'uuid';
import { db } from '../helpers/db';
import { logError } from '../helpers/logger';
import { ALLOWED_ADMIN_ROLES } from '../helpers/adminRoles';

export const insert_admin = async (req: any, res: any): Promise<void> => {
  try {
    if (req.session.adminRole !== 'superadmin') {
      res.status(401).json({ error: 'Not allowed for restricted superadmin' });
      return;
    }

    const validatedBody = Joi.attempt(
      req.body,
      Joi.object({
        newEmail: Joi.string().email().required(),
        adminRole: Joi.string()
          .valid(...ALLOWED_ADMIN_ROLES)
          .required(),
      }),
    );

    const newId = v4();
    await db.query(
      `INSERT INTO admins (id, email, admin_role) VALUES ($1, lower($2), $3) ON CONFLICT (email) DO UPDATE SET admin_role=$3`,
      [newId, validatedBody.newEmail, validatedBody.adminRole],
    );
    res.status(200).end();
  } catch (e: unknown) {
    if (e instanceof Joi.ValidationError) {
      return res.status(400).json({ error: 'Invalid input', details: e.details });
    }
    logError('insert_admin', e);
    res.status(400).end();
  }
};
