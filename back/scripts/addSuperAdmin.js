/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env'), quiet: true });

const db = require('../compiledServer/helpers/db').db;

function createToken(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

async function createTemporaryAdminTable() {
  try {
    await db.query(
      "CREATE TABLE IF NOT EXISTS temporary_admins (token VARCHAR, expiration_time TIMESTAMP(0) DEFAULT current_timestamp(0) + interval '5 minutes')",
    );
    await db.query(
      'ALTER TABLE temporary_admins ALTER expiration_time TYPE timestamp with time zone',
    );
  } catch (e) {
    console.error(e); //
    throw e;
  }
}

async function createTemporaryAdmin() {
  const token = createToken(20);
  await db.query(`INSERT INTO temporary_admins (token) VALUES ($1)`, [token]);
  if (!process.env.SERVER_URL) {
    console.error('THIS SCRIPT DOES NOT WORK IN DEV MODE. SEE developerDoc.md');
    // if the front and backend do not use the same URL,
    // then the cookie system does not work with the manualConnect system.
  } else {
    console.log('You can log into your dashboard using this one-time link (valid for 5 minutes):');
    console.log(`${process.env.SERVER_URL.replace(/\/$/, '')}/manualConnect?token=${token}`);
  }
}

createTemporaryAdminTable()
  .then(createTemporaryAdmin)
  .then(() => {
    process.exit(0);
  })
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
