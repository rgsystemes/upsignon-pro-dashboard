git pull origin production --ff-only
cd front
yarn install
./buildFront.sh


cd ../back
yarn install
yarn build-server
cd ..
pm2 startOrReload ./back/dashboard.config.js
