import { logError } from '../../helpers/logger';
import { nextShamirConfigIndex } from './_nextShamirConfigIndex';

export const getNextShamirConfigIndex = async (req: any, res: any): Promise<void> => {
  try {
    const nextShamirConfigIdx = await nextShamirConfigIndex(req.proxyParamsBankId);
    return res.status(200).json({ nextShamirConfigIndex: nextShamirConfigIdx });
  } catch (e) {
    logError('getNextShamirConfigIndex', e);
    res.status(400).end();
  }
};
