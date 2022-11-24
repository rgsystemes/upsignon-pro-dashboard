#!/bin/bash
cd front
yarn install
./buildFront.sh


cd ../back
yarn install
yarn build-server
cd ..

pm2 stop upsignon-pro-dashboard
pm2 start ./back/dashboard.config.js --update-env
