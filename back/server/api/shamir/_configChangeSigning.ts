// NB this content will be signed, so it must not contain
// any data that could change if migrating from onprem to SaaS

export type ShamirChangeSignature = {
  holderVaultId: number;
  signedAt: string;
  approved: boolean;
  signature: string;
};

export type ShamirShareholderFootprint = {
  vaultId: number;
  vaultEmail: string;
  vaultBankPublicId: string;
  vaultSigningPubKey: string;
  nbShares: number;
};

export type ShamirConfigFootprint = {
  configId: number;
  configName: string;
  bankPublicId: string;
  createdAt: string;
  minShares: number;
  supportEmail: string;
  creatorEmail: string;
  shareholders: ShamirShareholderFootprint[];
};
export type ShamirChange = {
  previousShamirConfig: null | ShamirConfigFootprint;
  thisShamirConfig: ShamirConfigFootprint;
};
