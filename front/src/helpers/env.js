let baseFrontUrl =
  process.env.NODE_ENV === 'development' ? 'http://localhost:8090' : process.env.PUBLIC_URL;
let baseServerUrl =
  process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : process.env.PUBLIC_URL;

// remove trailing /
baseFrontUrl = baseFrontUrl.replace(/\/$/, '');
baseServerUrl = baseServerUrl.replace(/\/$/, '');

let resellerId, bankId;
if (window.location.href.startsWith(`${baseFrontUrl}/reseller/`)) {
  resellerId = window.location.href.replace(baseFrontUrl, '').split('/')[2];
  bankId = null;
} else {
  bankId = window.location.href.replace(baseFrontUrl, '').split('/')[1];
  resellerId = null;
}
const bankFrontUrl = baseFrontUrl + '/' + bankId;
const bankOrResellerServerUrl =
  baseServerUrl + (resellerId ? '/reseller/' + resellerId : '/' + bankId);

let isSaasServer = false;
try {
  if (process.env.NODE_ENV === 'development') isSaasServer = true;
  isSaasServer =
    new URL(process.env.PUBLIC_URL).hostname.split('.').slice(-2).join('.') === 'upsignon.eu';
} catch (e) {}

export {
  baseFrontUrl,
  bankFrontUrl,
  bankOrResellerServerUrl,
  bankId,
  baseServerUrl,
  isSaasServer,
  resellerId,
};
