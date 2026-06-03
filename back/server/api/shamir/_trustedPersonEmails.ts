import { db } from '../../helpers/db';

/**
 * Get the emails of the shareholders of the shamir config associated to a config.
 * @param configId The id of the shamir config.
 * @returns Array of emails (string[]), or empty array if not found.
 */
export async function getShareholdersEmailsForConfig(configId: number): Promise<string[]> {
  const res = await db.query(
    `SELECT hu.email
		 FROM shamir_configs sc
		 INNER JOIN shamir_holders sh ON sh.shamir_config_id = sc.id
		 INNER JOIN users hu ON hu.id = sh.vault_id
		 WHERE sc.id = $1`,
    [configId],
  );
  return res.rows.map((row) => row.email).filter(Boolean);
}
