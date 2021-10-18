/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../..', '.env') });

const { db } = require('../compiledServer/helpers/connection');
const { v4 } = require('uuid');

const email = process.argv[2];
if (!email) {
  console.error(
    `ERROR: You need to provide an email. Use '${process.argv[0]} ${process.argv[1]} email@domain.com'`,
  );
  return process.exit(1);
}

db.query('INSERT INTO admins (id, email) VALUES ($1, $2)', [v4(), email])
  .then(() => {
    console.log(`Added  ${email} as admin.`);
    process.exit(0);
  })
  .catch((e) => {
    console.error(`Could not add ${email} as admin.`, e);
    process.exit(1);
  });
