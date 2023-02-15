#!/bin/bash
cd front
/home/upsignonpro/.npm-global/bin/yarn install
./buildFront.sh


cd ../back
/home/upsignonpro/.npm-global/bin/yarn install
/home/upsignonpro/.npm-global/bin/yarn build-server
cd ..

/home/upsignonpro/.npm-global/bin/pm2 stop upsignon-pro-dashboard
/home/upsignonpro/.npm-global/bin/pm2 start ./back/dashboard.config.js --update-env
