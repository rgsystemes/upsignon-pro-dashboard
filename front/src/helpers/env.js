let baseFrontUrl =
  process.env.NODE_ENV === 'development' ? 'http://localhost:8090' : process.env.PUBLIC_URL;
let baseServerUrl =
  process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : process.env.PUBLIC_URL;

// remove trailing /
baseFrontUrl.replace(/\/$/, '');
baseServerUrl.replace(/\/$/, '');

const bankId = window.location.href.replace(baseFrontUrl, '').split('/')[1];
const bankFrontUrl = baseFrontUrl + '/' + bankId;
const bankServerUrl = baseServerUrl + '/' + bankId;

let isSaasServer = false;
try {
  if (process.env.NODE_ENV === 'development') isSaasServer = true;
  isSaasServer =
    new URL(process.env.PUBLIC_URL).hostname.split('.').slice(-2).join('.') === 'upsignon.eu';
} catch (e) {}

export { baseFrontUrl, bankFrontUrl, bankServerUrl, bankId, baseServerUrl, isSaasServer };
