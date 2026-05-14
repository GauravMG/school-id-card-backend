docker compose up --build --force-recreate -d
docker compose exec api npx prisma migrate dev --name init
docker compose exec api npm run db:seed