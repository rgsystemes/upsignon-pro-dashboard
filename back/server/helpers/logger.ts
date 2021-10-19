export const logInfo = (...m: any[]): void => {
  console.log(new Date().toISOString().split('.')[0], ...m);
};

export const logError = (...m: any[]): void => {
  logError(new Date().toISOString().split('.')[0], ...m);
};
