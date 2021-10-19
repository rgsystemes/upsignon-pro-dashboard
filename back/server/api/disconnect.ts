export const disconnect = async (req: any, res: any): Promise<void> => {
  try {
    req.session.destroy();
    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};
