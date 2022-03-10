import { db } from '../helpers/connection';
import { logError } from '../helpers/logger';

export const get_shared_folders = async (req: any, res: any): Promise<void> => {
  try {
    const sharedFolders = await db.query(
      'SELECT shared_folders.id, shared_folders.name, count(shared_accounts.id) AS count FROM shared_folders RIGHT JOIN shared_accounts ON shared_accounts.shared_folder_id=shared_folders.id WHERE shared_folders.group_id=$1 GROUP BY shared_folders.id ORDER BY shared_folders.id DESC',
      [req.proxyParamsGroupId],
    );
    res.status(200).json(sharedFolders.rows);
  } catch (e) {
    logError(e);
    res.status(400).end();
  }
};
