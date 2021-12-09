npx react-scripts build
if [ $? -eq 0 ]
then
  echo "Front build OK"
else
  echo "Front build failed, retrying with legacy option"
  npx react-scripts --openssl-legacy-provider build
  if [ $? -eq 0 ]
  then
    echo "Front build OK"
  fi
fi
