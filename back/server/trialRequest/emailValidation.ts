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
      .then(() =>
        db.query(
          `ALTER TABLE ${CONFIRMATION_TABLE_NAME} ADD COLUMN IF NOT EXISTS hubspot_submitted BOOLEAN NOT NULL DEFAULT FALSE`,
        ),
      )
      .then(() =>
        db.query(
          `ALTER TABLE ${CONFIRMATION_TABLE_NAME} ADD COLUMN IF NOT EXISTS admin_id VARCHAR`,
        ),
      )
      .then(() =>
        db.query(`ALTER TABLE ${CONFIRMATION_TABLE_NAME} ADD COLUMN IF NOT EXISTS email VARCHAR`),
      )
      .then(() =>
        db.query(
          `CREATE UNIQUE INDEX IF NOT EXISTS ${CONFIRMATION_TABLE_NAME}_email_idx ON ${CONFIRMATION_TABLE_NAME} (email)`,
        ),
      )
      .then(() => undefined)
      .catch((error) => {
        ensureConfirmationTablePromise = null;
        throw error;
      });
  }
  await ensureConfirmationTablePromise;
};

// One outstanding confirmation per email at a time: submitting the trial request again (e.g.
// the user lost the first email, or filled the form in a second browser) supersedes any previous
// unconfirmed token for that email instead of creating a second, independently valid one - so at
// most one confirmation link can ever race its way to reserveTrialAdmin/HubSpot for a given email.
// Returns false, without touching anything, if a confirmation for that email is currently being
// processed (is_processing = TRUE) - a trial is already in the middle of being created.
export const activateConfirmationToken = async (
  tokenHash: string,
  email: string,
): Promise<boolean> => {
  const insertResult = await db.query(
    `
      INSERT INTO ${CONFIRMATION_TABLE_NAME} (token_hash, email)
      VALUES ($1, lower($2))
      ON CONFLICT (email) DO UPDATE
        SET token_hash = EXCLUDED.token_hash, created_at = NOW()
        WHERE ${CONFIRMATION_TABLE_NAME}.is_processing = FALSE
      RETURNING token_hash
    `,
    [tokenHash, email],
  );
  return (insertResult.rowCount || 0) > 0;
};

// Returns null if the claim could not be acquired (already processing, already confirmed and
// cleaned up, or expired). Otherwise returns what previous attempts for this token already
// completed, so callers can resume without redoing (and duplicating) those steps on retry:
// - hubspotSubmitted: HubSpot was already notified for this token
// - adminId: the admins row already reserved for this token's email
export const checkConfirmationClaim = async (
  tokenHash: string,
): Promise<{ hubspotSubmitted: boolean; adminId: string | null } | null> => {
  const result = await db.query(
    `
      UPDATE ${CONFIRMATION_TABLE_NAME}
      SET is_processing = TRUE
      WHERE token_hash = $1 AND created_at >= NOW() - INTERVAL '2 days' AND is_processing = FALSE
      RETURNING hubspot_submitted, admin_id
    `,
    [tokenHash],
  );
  if (!result.rowCount) {
    return null;
  }
  return {
    hubspotSubmitted: result.rows[0].hubspot_submitted === true,
    adminId: result.rows[0].admin_id ?? null,
  };
};

export const markHubspotSubmitted = async (tokenHash: string): Promise<void> => {
  await db.query(
    `
      UPDATE ${CONFIRMATION_TABLE_NAME}
      SET hubspot_submitted = TRUE
      WHERE token_hash = $1
    `,
    [tokenHash],
  );
};

export const markAdminReserved = async (tokenHash: string, adminId: string): Promise<void> => {
  await db.query(
    `
      UPDATE ${CONFIRMATION_TABLE_NAME}
      SET admin_id = $2
      WHERE token_hash = $1
    `,
    [tokenHash, adminId],
  );
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
