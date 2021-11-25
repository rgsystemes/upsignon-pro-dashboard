git pull origin production --ff-only
cd front
yarn install
npx react-scripts build
if [ $? -eq 0 ]
then
  echo "Front build OK"
else
  npx react-scripts --openssl-legacy-provider build
  if [ $? -eq 0 ]
  then
    echo "Front build OK"
  fi
fi


cd ../back
yarn install
yarn build-server
cd ..
pm2 startOrReload ./back/dashboard.config.js
pm2 save
