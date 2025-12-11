import Joi from 'joi';
import { db } from '../../helpers/db';
import { logError } from '../../helpers/logger';
import { Request, Response } from 'express';

export const shamirSearchUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedBody = Joi.attempt(
      req.body,
      Joi.object({
        search: Joi.string().allow(''),
      }),
    );
    const s = validatedBody.search || '';
    const searchInAllBanks =
      // @ts-ignore
      req.session.adminRole === 'superadmin' || req.session.adminRole === 'restricted_superadmin';

    const whereClauses = ['(u.deactivated IS NULL OR u.deactivated = false)'];
    const params: any[] = [];
    let paramIdx = 1;
    if (s) {
      whereClauses.push(`u.email LIKE '%' || $${paramIdx} || '%'`);
      params.push(s);
      paramIdx++;
    }
    if (!searchInAllBanks) {
      whereClauses.push(`b.id = ANY($${paramIdx}::INT[])`);
      // @ts-ignore
      params.push(req.session.banks);
      paramIdx++;
    }
    const query = `
      SELECT
        u.id,
        u.email,
        b.name as bank_name,
        LENGTH(u.sharing_public_key_2) > 0 as has_sharing_public_key
      FROM users AS u
      LEFT JOIN banks AS b ON b.id = u.bank_id
      WHERE ${whereClauses.join(' AND ')}
      ORDER BY u.email ASC, b.name ASC
      LIMIT 15
    `;
    const searchRes = await db.query(query, params);
    res.status(200).json({
      searchedHolders: searchRes.rows.map((u) => ({
        id: u.id,
        email: u.email,
        bankName: u.bank_name,
        hasSharingPublicKey: u.has_sharing_public_key,
      })),
      // @ts-ignore
      adminEmail: req.session.adminEmail,
    });
  } catch (e) {
    logError('shamirSearchUsers', e);
    res.status(400).end();
  }
};
