let baseFrontUrl =
  process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : process.env.PUBLIC_URL;
let baseServerUrl =
  process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : process.env.PUBLIC_URL;

// remove trailing /
baseFrontUrl.replace(/\/$/, '');
baseServerUrl.replace(/\/$/, '');

const group = window.location.href.replace(baseFrontUrl, '').split('/')[1];
const frontUrl = baseFrontUrl + '/' + group;
const serverUrl = baseServerUrl + '/' + group;
export { baseFrontUrl, frontUrl, serverUrl, group, baseServerUrl };
