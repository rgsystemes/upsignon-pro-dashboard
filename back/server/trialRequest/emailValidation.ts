import { db } from '../helpers/db';

const CONFIRMATION_TABLE_NAME = 'trial_request_confirmations';
let ensureConfirmationTablePromise: Promise<void> | null = null;

export const ensureConfirmationTable = async (): Promise<void> => {
  if (!ensureConfirmationTablePromise) {
    ensureConfirmationTablePromise = db
      .query(
        `
          CREATE TABLE IF NOT EXISTS ${CONFIRMATION_TABLE_NAME} (
            token_hash VARCHAR PRIMARY KEY,
            status VARCHAR NOT NULL CHECK (status IN ('processing', 'completed')),
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          )
        `,
      )
      .then(() => undefined)
      .catch((error) => {
        ensureConfirmationTablePromise = null;
        throw error;
      });
  }
  await ensureConfirmationTablePromise;
};

export const claimConfirmationToken = async (tokenHash: string): Promise<boolean> => {
  const insertResult = await db.query(
    `
      INSERT INTO ${CONFIRMATION_TABLE_NAME} (token_hash, status)
      VALUES ($1, 'processing')
      ON CONFLICT DO NOTHING
      RETURNING token_hash
    `,
    [tokenHash],
  );
  return (insertResult.rowCount || 0) > 0;
};

export const markConfirmationCompleted = async (tokenHash: string): Promise<void> => {
  await db.query(
    `
      UPDATE ${CONFIRMATION_TABLE_NAME}
      SET status = 'completed', updated_at = NOW()
      WHERE token_hash = $1
    `,
    [tokenHash],
  );
};

export const releaseConfirmationClaim = async (tokenHash: string): Promise<void> => {
  await db.query(
    `
      DELETE FROM ${CONFIRMATION_TABLE_NAME}
      WHERE token_hash = $1 AND status = 'processing'
    `,
    [tokenHash],
  );
};
