#!/bin/bash
if [[ "$USER" != "upsignonpro" && "$USER" != "upsignon" ]]; then
  echo "You need to run the update script as upsignonpro."
  exit 1
fi

git pull origin production --ff-only
cd front
yarn install
./buildFront.sh


cd ../back
yarn install
yarn build-server
cd ..
pm2 startOrReload ./back/dashboard.config.js
