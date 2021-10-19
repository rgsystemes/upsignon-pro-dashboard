# Installation

On a debian machine (with nginx, openssl, git, node, yarn and pm2 installed)

If you have a proxy to filter outgoing connections, configure it:

- for git
- for yarn

- `git pull origin production --ff-only`
- `cp dot-env-example .env`
- edit .env file with your own environment variables
  - do not forget to change SESSION_SECRET to a random string: use the command below to generate one
    `openssl rand -hex 30`
- `./update.sh`

Then configure nginx.
