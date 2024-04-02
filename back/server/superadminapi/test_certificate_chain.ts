import { checkServerCertificateChain } from '../helpers/certificateChainChecker';
import { db } from '../helpers/db';
import { logError } from '../helpers/logger';

export const test_certificate_chain = async (req: any, res: any): Promise<void> => {
  try {
    const settingsRes = await db.query(
      "SELECT value FROM settings WHERE key='PRO_SERVER_URL_CONFIG'",
    );
    if (settingsRes.rowCount === 0) {
      return res.status(200).json({ isComplete: false });
    }

    const isCertificateChainComplete = await checkServerCertificateChain(
      new URL(settingsRes.rows[0]?.value?.url).host,
    );
    // Return res
    return res.status(200).json({ isComplete: isCertificateChainComplete });
  } catch (e) {
    logError('ERROR testing certificate chain:', e);
    res.status(400).send();
  }
};
