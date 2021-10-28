let baseFrontUrl =
  process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : process.env.PUBLIC_URL;
let baseServerUrl =
  process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : process.env.PUBLIC_URL;

// remove trailing /
baseFrontUrl.replace(/\/$/, '');
baseServerUrl.replace(/\/$/, '');

const groupId = window.location.href.replace(baseFrontUrl, '').split('/')[1];
const frontUrl = baseFrontUrl + '/' + groupId;
const serverUrl = baseServerUrl + '/' + groupId;
export { baseFrontUrl, frontUrl, serverUrl, groupId, baseServerUrl };
