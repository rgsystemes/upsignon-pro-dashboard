import { forceProStatusUpdate } from '../helpers/forceProStatusUpdate';
import { logError } from '../helpers/logger';
import { updateBank } from '../helpers/updateBank';

export const update_bank_as_superadmin = async (req: any, res: any): Promise<void> => {
  try {
    await updateBank(req.session, {
      bankId: req.body.id,
      name: req.body.name,
      resellerId: req.body.resellerId,
      settings: req.body.settings,
    });
    forceProStatusUpdate();
    res.status(200).end();
  } catch (e) {
    logError('update_bank_as_admin', e);
    res.status(400).end();
  }
};
