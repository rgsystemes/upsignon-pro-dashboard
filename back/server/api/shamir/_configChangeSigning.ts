// NB this content will be signed, so it must not contain
// any data that could change if migrating from onprem to SaaS

export type ShamirShareholderToSign = {
  vaultEmail: string;
  vaultBankPublicId: string;
  vaultSigningPubKey: string;
  nbShares: number;
};
export type ShamirConfigToSign = {
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

export const getShamirConfigChangeToSign = (
  previousConfig: ShamirConfigToSign | null,
  newConfig: ShamirConfigToSign,
): string => {
  const configChange: ShamirConfigChangeToSign = {
    previousShamirConfig: previousConfig,
    nextShamirConfig: newConfig,
  };
  const configChangeToSign = JSON.stringify(configChange);

  return configChangeToSign;
};
