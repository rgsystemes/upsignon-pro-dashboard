import { inviteNewAdmin } from '../helpers/inviteNewAdmin';

export const insert_admin = async (req: any, res: any): Promise<void> => {
  try {
    const newEmail = req.body.newEmail;

    await inviteNewAdmin(newEmail);

    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};
