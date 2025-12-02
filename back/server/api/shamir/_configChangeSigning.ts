type ShamirShareholder = {
  vaultEmail: string;
  vaultBankId: number;
  vaultSigningPubKey: number;
  nbShares: number;
};
type ShamirConfig = {
  configId: number;
  configName: string;
  bankId: number;
  minShares: number;
  shareholders: ShamirShareholder[];
  creatorEmail: string;
  supportEmail: string;
  createdAt: string;
};

type ShamirConfigChange = {
  previousShamirConfig: null | ShamirConfig;
  nextShamirConfig: ShamirConfig;
};

type ShamirChangeSignature = {
  configChange: string;
  signatures: {
    [shareholderIdx: number]: {
      approvedAt: string;
      signature: string;
    };
  };
};

export const getShamirConfigChangeToSign = (
  configId: number,
  configName: string,
  bankId: number,
  minShares: number,
  creatorEmail: string,
  supportEmail: string,
  createdAt: string,
  shareholders: ShamirShareholder[],
): string => {
  const configChange: ShamirConfigChange = {
    previousShamirConfig: null,
    nextShamirConfig: {
      bankId,
      configId,
      configName,
      createdAt,
      creatorEmail,
      minShares,
      shareholders,
      supportEmail,
    },
  };
  const configChangeToSign = JSON.stringify(configChange);

  return configChangeToSign;
};
