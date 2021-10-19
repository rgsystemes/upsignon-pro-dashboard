/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const { inviteNewAdmin } = require('../compiledServer/helpers/inviteNewAdmin');

const email = process.argv[2];
if (!email) {
  console.error(
    `ERROR: You need to provide an email. Use '${process.argv[0]} ${process.argv[1]} email@domain.com'`,
  );
  return process.exit(1);
}

inviteNewAdmin(email)
  .then(() => {
    console.log(`Added  ${email} as admin and sent email.`);
    process.exit(0);
  })
  .catch((e) => {
    console.error(`Could not add ${email} as admin.`, e);
    process.exit(1);
  });
