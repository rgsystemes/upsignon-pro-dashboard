// NB this content will be signed, so it must not contain
// any data that could change if migrating from onprem to SaaS

export type ShamirShareholderToSign = {
  vaultEmail: string;
  vaultBankPublicId: string;
  vaultSigningPubKey: string;
  nbShares: number;
};
type ShamirConfigToSign = {
  minShares: number;
  creatorEmail: string;
  supportEmail: string;
  shareholders: ShamirShareholderToSign[];
  createdAt: string;
};

export type ShamirConfigChangeToSign = {
  previousShamirConfig: null | ShamirConfigToSign;
  nextShamirConfig: ShamirConfigToSign;
};

export type ShamirChangeSignatures = {
  [shareholderIdx: number]: {
    approvedAt: string;
    signature: string;
  };
};

export const getShamirConfigChangeToSignForFirstConfig = (
  minShares: number,
  creatorEmail: string,
  supportEmail: string,
  shareholders: ShamirShareholderToSign[],
  createdAt: string,
): string => {
  const configChange: ShamirConfigChangeToSign = {
    previousShamirConfig: null,
    nextShamirConfig: {
      creatorEmail,
      minShares,
      supportEmail,
      shareholders,
      createdAt,
    },
  };
  const configChangeToSign = JSON.stringify(configChange);

  return configChangeToSign;
};
