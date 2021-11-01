/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const v4 = require('uuid').v4;
const bcrypt = require('bcrypt');
const db = require('../compiledServer/helpers/connection').db;

const email = process.argv[2];
if (!email) {
  console.error(
    `ERROR: You need to provide an email. Use '${process.argv[0]} ${process.argv[1]} email@domain.com'`,
  );
  return process.exit(1);
}

function createPassword(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

async function insert(email) {
  const newId = v4();
  const newPassword = createPassword(20);
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await db.query(
    `INSERT INTO admins (id, email, is_superadmin, password_hash) VALUES ($1, lower($2), true, $3) ON CONFLICT (email) DO UPDATE SET password_hash=$3, is_superadmin=true`,
    [newId, email, passwordHash],
  );
  console.log(`A temporary password has been generated for ${email}.`);
  console.log(`The password is: ${newPassword}`);
  console.log(
    `You can log into your dashboard at ${process.env.SERVER_URL.replace(/\/$/, '')}/login.html`,
  );
  return newPassword;
}

insert(email)
  .then(() => {
    process.exit(0);
  })
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
