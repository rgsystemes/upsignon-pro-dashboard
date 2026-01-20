import { Request, Response } from 'express';
import { logError } from '../../helpers/logger';
import { nextShamirConfigIndex } from './_nextShamirConfigIndex';

export const getNextShamirConfigIndex = async (req: Request, res: Response): Promise<void> => {
  try {
    const nextShamirConfigIdx = await nextShamirConfigIndex(
      // @ts-ignore
      req.proxyParamsBankId,
    );
    res.status(200).json({ nextShamirConfigIndex: nextShamirConfigIdx });
  } catch (e) {
    logError('getNextShamirConfigIndex', e);
    res.status(400).end();
  }
};
