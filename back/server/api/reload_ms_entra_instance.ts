import { logError } from '../helpers/logger';
import { MicrosoftGraph } from 'upsignon-ms-entra';

export const reloadMSEntraInstance = async (req: any, res: any): Promise<void> => {
  try {
    MicrosoftGraph.reloadInstanceForGroup(req.proxyParamsBankId);
    res.status(200).end();
  } catch (e) {
    logError('reloadMSEntraInstance', e);
    res.status(400).end();
  }
};

export const listMSEntraAPIs = async (req: any, res: any): Promise<void> => {
  try {
    res.status(200).send(MicrosoftGraph.listNeededAPIs());
  } catch (e) {
    logError('listMSEntraAPIs', e);
    res.status(400).end();
  }
};
