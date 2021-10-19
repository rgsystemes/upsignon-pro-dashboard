git pull origin origin production --ff-only
mkdir logs
cd front
yarn install
yarn build-front
cd ../back
yarn install
yarn build-server
cd ..
pm2 start ./back/dashboard.pm2config.js
