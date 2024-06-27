#!/bin/bash
cd front
~/.npm-global/bin/yarn install
./buildFront.sh


cd ../back
~/.npm-global/bin/yarn install
~/.npm-global/bin/yarn build-server
cd ..

~/.npm-global/bin/pm2 startOrGracefulReload ./back/dashboard.config.js --update-env
