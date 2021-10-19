# Installation

On a debian machine (with nginx, openssl, git, node, yarn and pm2 installed)

If you have a proxy to filter outgoing connections, configure it:

- for git
- for yarn

- `git clone --branch production https://github.com/UpSignOn/upsignon-pro-dashboard.git`

- `cd upsignon-pro-dashboard/front` // go to project front dir
- create a .env file and define your PUBLIC_URL in it

  ```
  PUBLIC_URL=https://url-to-your-dashboard/path
  ```

- `cd ../back` // go to project back dir
- `cp dot-env-example .env`
- edit .env file with your own environment variables

  - do not forget to change SESSION_SECRET to a random string: use the command below to generate one
    `openssl rand -hex 30`

- `cd ..` // go to project root dir
- `./update.sh` (this takes about 2 minutes)

- Send the url of this server to contact@upsignon.eu with this message
  `Voici l'url de notre serveur d'administration pour ajout dans votre base de données partenaires. <YOUR URL>`

  - This URL will not be requested by us. It is required to allow you to connect to your dashboard with UpSignOn.

Then configure nginx.

Then add yourself as administrator.

- `node ./back/scripts/addFirstAdmin.js <your-email@domain.com>`
  You will receive an email (if everything is well configured) that invites you to connect to your dashboard using UpSignOn.
  So you will need to have UpSignOn installed on you computer first, with your PRO space setup.
  Then enjoy the power and simplicity of our connection system by using the link you received by email.
