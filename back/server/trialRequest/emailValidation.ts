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
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            is_processing BOOLEAN NOT NULL DEFAULT FALSE
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

export const activateConfirmationToken = async (tokenHash: string): Promise<boolean> => {
  const insertResult = await db.query(
    `
      INSERT INTO ${CONFIRMATION_TABLE_NAME} (token_hash)
      VALUES ($1)
      ON CONFLICT DO NOTHING
      RETURNING token_hash
    `,
    [tokenHash],
  );
  return (insertResult.rowCount || 0) > 0;
};

export const checkConfirmationClaim = async (tokenHash: string): Promise<boolean> => {
  const result = await db.query(
    `
      UPDATE ${CONFIRMATION_TABLE_NAME}
      SET is_processing = TRUE
      WHERE token_hash = $1 AND created_at >= NOW() - INTERVAL '2 days' AND is_processing = FALSE
      RETURNING token_hash
    `,
    [tokenHash],
  );
  return (result.rowCount || 0) > 0;
};

export const releaseLockOnConfirmationClaim = async (tokenHash: string): Promise<void> => {
  await db.query(
    `
      UPDATE ${CONFIRMATION_TABLE_NAME}
      SET is_processing = FALSE
      WHERE token_hash = $1
    `,
    [tokenHash],
  );
};

export const releaseConfirmationClaimAndCleanup = async (tokenHash: string): Promise<void> => {
  await db.query(
    `
      DELETE FROM ${CONFIRMATION_TABLE_NAME}
      WHERE token_hash = $1 OR created_at < NOW() - INTERVAL '2 days'
    `,
    [tokenHash],
  );
};
