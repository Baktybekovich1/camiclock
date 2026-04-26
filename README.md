# CamiClock

CamiClock is a full-stack time management web app with:
- Symfony 8 API (`backend`)
- React + Vite frontend (`frontend`)
- Docker stack for `php-fpm + nginx + postgresql`

## Features
- Registration and login (JWT)
- User dashboard with category timer
- Daily/weekly plans by category
- Progress analytics (spent vs target vs gap)
- Profile editing
- Admin panel for user management
- Public About page for unauthenticated users

## Local Development (Docker)
1. Start services:
   ```bash
   docker compose up -d --build
   ```
2. Run backend migrations:
   ```bash
   docker compose exec php php bin/console doctrine:migrations:migrate --no-interaction
   ```
3. Create admin user:
   ```bash
   docker compose exec php php bin/console app:create-admin admin@camiclock.local admin123 Admin Owner
   ```

App URLs:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8080`

## Production Compose
Use `docker-compose.prod.yml`:
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Note:
- Ensure `backend/config/jwt/private.pem` and `backend/config/jwt/public.pem` exist.
- If you change `JWT_PASSPHRASE`, regenerate keys with `php bin/console lexik:jwt:generate-keypair --overwrite`.

## Environment
Frontend can override API URL:
- `frontend/.env` with `VITE_API_URL=http://localhost:8080`

Backend JWT keys are generated in `backend/config/jwt/`.
