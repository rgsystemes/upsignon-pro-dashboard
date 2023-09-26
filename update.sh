#!/bin/bash
git fetch origin
git reset --hard origin/production
git clean -df
git remote prune origin

# Use a separate script so the update immediatly benefits from the new update script
if [ $? -eq 0 ];
then
  ./post-update.sh
else
  echo "The update failed."
fi
