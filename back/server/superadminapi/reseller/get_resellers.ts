/* eslint-disable @typescript-eslint/no-var-requires */
import { db } from '../../helpers/db';
import { logError } from '../../helpers/logger';
import { Request, Response } from 'express';

export const get_resellers = async (req: Request, res: Response): Promise<void> => {
  try {
    const dbRes = await db.query(
      `SELECT
        r.id,
        r.name,
        r.created_at,
        ARRAY_AGG(
            JSON_BUILD_OBJECT(
              'id', b.id,
              'name', b.name
            )
        ) FILTER (WHERE b.id IS NOT NULL) AS banks
      FROM resellers AS r
      LEFT JOIN banks AS b ON b.reseller_id=r.id
      GROUP BY r.id
      ORDER BY r.name ASC`,
    );
    res.status(200).send(
      dbRes.rows.map((r) => {
        return {
          ...r,
          banks:
            r.banks?.sort((b1: { name: string }, b2: { name: string }) => {
              return b1.name > b2.name ? 1 : -1;
            }) || [],
        };
      }),
    );
  } catch (e) {
    logError('get_resellers', e);
    res.status(400).end();
  }
};
