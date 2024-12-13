function getNumber(untrustedInput: any, defaultValue: number): number {
  const trustedNumber = Number.parseInt(untrustedInput);
  if (Number.isNaN(trustedNumber)) return defaultValue;
  return trustedNumber;
}
function getNumberOrNull(untrustedInput: any): null | number {
  const trustedNumber = Number.parseInt(untrustedInput);
  if (Number.isNaN(trustedNumber)) return null;
  return trustedNumber;
}

function getString(untrustedInput: any): null | string {
  if (!untrustedInput) return null;
  if (typeof untrustedInput !== 'string') return null;
  return untrustedInput;
}

function getLowerCaseString(untrustedInput: any): null | string {
  if (!untrustedInput) return null;
  if (typeof untrustedInput !== 'string') return null;
  return untrustedInput.toLowerCase();
}

function getBoolean(untrustedInput: any) {
  return !!untrustedInput;
}

function cleanForHTMLInjections(untrustedInput: string) {
  return untrustedInput?.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function getArrayOfNumbers(untrustedInput: any): null | number[] {
  if (!Array.isArray(untrustedInput)) return null;
  if (untrustedInput.some((el) => typeof el !== 'number')) return null;
  return untrustedInput;
}

export const inputSanitizer = {
  getNumber,
  getNumberOrNull,
  getString,
  getLowerCaseString,
  getBoolean,
  cleanForHTMLInjections,
  getArrayOfNumbers,
};
