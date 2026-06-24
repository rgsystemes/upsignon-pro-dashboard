import { logError } from '../helpers/logger';
import { resendBankSetupEmailToMe } from '../helpers/resendBankSetupEmailToAdmins';

export const resend_bank_setup_email = async (req: any, res: any): Promise<void> => {
  try {
    await resendBankSetupEmailToMe(req, req.proxyParamsBankId);
    res.status(200).json({});
  } catch (e) {
    logError('resend_bank_setup_email', e);
    res.status(400).json({});
  }
};
