import { db } from '../../helpers/db';

export const nextShamirConfigIndex = async (bankId: number): Promise<number> => {
  const previousConfigs = await db.query(
    'SELECT COUNT(1) as count FROM shamir_configs WHERE bank_id=$1',
    [bankId],
  );

  return Number(previousConfigs.rows[0].count) + 1;
};
