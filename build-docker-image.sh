docker image prune -f
cd front
yarn
yarn run react-scripts build
cd ../back
yarn
yarn build-server
cd ..
docker build --no-cache -t giregdekerdanet/upsignon-pro-dashboard:latest .
docker push giregdekerdanet/upsignon-pro-dashboard:latest