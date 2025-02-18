import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const extract_admins = async (req: any, res: any): Promise<void> => {
  try {
    const queryString = 'SELECT email FROM admins ORDER BY email ASC';
    const dbRes = await db.query(queryString, []);

    let csvContent = '';
    if (dbRes.rowCount && dbRes.rowCount > 0) {
      csvContent += Object.keys(dbRes.rows[0]).join(';') + '\n';
      csvContent += dbRes.rows.map((r) => Object.values(r).join(';')).join('\n');
    }
    res.header('Content-Type', 'text/csv');
    const d = new Date().toISOString().split('T')[0];
    res.attachment(`upsignon-pro-admins-${d}.csv`);
    res.send(csvContent);
  } catch (e) {
    logError('extract_admins', e);
    res.status(400).end();
  }
};
