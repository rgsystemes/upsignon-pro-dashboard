let frontServerUrl =
  process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : process.env.PUBLIC_URL;
let baseApiServerUrl =
  process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : process.env.PUBLIC_URL;

// remove trailing /
frontServerUrl.replace(/\/$/, '');
baseApiServerUrl.replace(/\/$/, '');

const group = window.location.href.replace(frontServerUrl, '').split('/')[1];
frontServerUrl += '/' + group;
const backServerUrl = baseApiServerUrl + '/' + group; // TODO could be refactored to apiServerUrl with added /api at the end
export { frontServerUrl, backServerUrl, group, baseApiServerUrl };
