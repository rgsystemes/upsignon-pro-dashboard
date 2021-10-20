let frontServerUrl =
  process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : process.env.PUBLIC_URL;
let backServerUrl =
  process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : process.env.PUBLIC_URL;

// remove trailing /
frontServerUrl.replace(/\/$/, '');
backServerUrl.replace(/\/$/, '');

export { frontServerUrl, backServerUrl };
