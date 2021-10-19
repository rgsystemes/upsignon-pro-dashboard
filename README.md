# Installation

On a debian machine (with nginx, openssl, git, node, yarn and pm2 installed)

If you have a proxy to filter outgoing connections, configure it:

- for git
- for yarn

- `git clone --branch production https://github.com/UpSignOn/upsignon-pro-dashboard.git`
- `cd upsignon-pro-dashboard`
- `chmod 777 update.sh`
- `cp dot-env-example .env`
- edit .env file with your own environment variables
  - do not forget to change SESSION_SECRET to a random string: use the command below to generate one
    `openssl rand -hex 30`
- `./update.sh` (this takes about 2 minutes)
- `node ./back/scripts/addFirstAdmin.js <email@domain.com>`

Then configure nginx.
