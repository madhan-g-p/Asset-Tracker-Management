# Asset Management App

## Setup

1. Copy `.env.example` to `.env` and set your DB/JWT values.
2. Install deps: `npm install`
3. Run DB migrations: `npx sequelize-cli db:migrate --env local`
4. Seed demo data: `npx sequelize-cli db:seed:all --env local`
5. Start: `npm run dev` (local) or `npm start`

## Auth

- Login: `POST /auth/login` with JSON `{ "username": "admin", "password": "admin123" }`, get JWT.
- Include JWT as Bearer in `Authorization` header for all private routes.

## Local Development

- Environment: Set `NODE_ENV=local` for local DB and seeders.