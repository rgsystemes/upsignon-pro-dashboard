let baseFrontUrl =
  process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : process.env.PUBLIC_URL;
let baseServerUrl =
  process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : process.env.PUBLIC_URL;

// remove trailing /
baseFrontUrl.replace(/\/$/, '');
baseServerUrl.replace(/\/$/, '');

const group = window.location.href.replace(baseFrontUrl, '').split('/')[1];
const frontUrl = baseFrontUrl + '/' + group;
const backServerUrl = baseServerUrl + '/' + group; // TODO could be refactored to apiServerUrl with added /api at the end
export { baseFrontUrl, frontUrl, backServerUrl, group, baseServerUrl };
