/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

module.exports = {
  apps: [
    {
      name: 'upsignon-pro-dashboard',
      script: path.join(__dirname, './compiledServer/server.js'),
      instances: 1,
      exec_model: 'fork',
      error_file: path.join(__dirname, '../logs/dashboard-error.log'),
      out_file: path.join(__dirname, '../logs/dashboard-output.log'),
      combine_logs: true,
      kill_timeout: 3000,
      source_map_support: true,
      autorestart: true,
      min_uptime: 1000,
    },
  ],
};
