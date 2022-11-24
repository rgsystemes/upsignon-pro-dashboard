#!/bin/bash
git pull origin production --ff-only
cd front
yarn install
./buildFront.sh


cd ../back
yarn install
yarn build-server
cd ..

pm2 stop upsignon-pro-dashboard
pm2 start ./back/dashboard.config.js
