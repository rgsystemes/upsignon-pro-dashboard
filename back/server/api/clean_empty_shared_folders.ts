import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const clean_empty_shared_folders = async (req: any, res: any): Promise<void> => {
  try {
    await db.query(
      'DELETE FROM shared_folders WHERE (SELECT COUNT(*) FROM shared_accounts WHERE shared_folders.id=shared_accounts.shared_folder_id) = 0',
    );
    res.status(200).end();
  } catch (e) {
    logError(e);
    res.status(400).end();
  }
};
