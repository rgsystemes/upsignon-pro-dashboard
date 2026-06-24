const isDevelopment = import.meta.env.DEV;

const configuredPublicUrl = import.meta.env.PUBLIC_URL;
const runtimePublicUrl = `${window.location.origin}${import.meta.env.BASE_URL}`;
let baseFrontUrl = isDevelopment ? 'http://localhost:8090' : configuredPublicUrl || runtimePublicUrl;
let baseServerUrl = isDevelopment ? 'http://localhost:3001' : configuredPublicUrl || runtimePublicUrl;
const publicBasePath = import.meta.env.BASE_URL.replace(/\/$/, '');

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
  if (isDevelopment) isSaasServer = true;
  else
    isSaasServer = new URL(baseServerUrl).hostname.split('.').slice(-2).join('.') === 'upsignon.eu';
} catch (e) {}

export {
  baseFrontUrl,
  bankFrontUrl,
  bankOrResellerServerUrl,
  bankId,
  baseServerUrl,
  isSaasServer,
  resellerId,
  publicBasePath,
  isDevelopment,
};
