# To run locally

- install postgresql
- create a db
- start the upsignon-pro-server to setup the db
- configure your front/.env and /back/.env files

  - front/.env
    -> PUBLIC_URL = https://localhost:3001 (backend)
  - back/.env
    -> BACKEND_URL=http://localhost:3001
    -> FRONTEND_URL=http://localhost:8090
    -> (do not configure SERVER_URL)
    -> DEV_FALLBACK_ADMIN_EMAIL=devadmin@upsignon.eu

- run this command in psql
  -> `insert into admins (id, email, is_superadmin) VALUES ('a035d19a-f5ca-4cfe-a5e6-9440d2f4ef0b', 'devadmin@upsignon.eu', true);`
- in back, `yarn build-server && yarn start-server` to be rerun for each change (there is no watcher)
- in front, `yarn start-front`
