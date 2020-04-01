docker-compose down --rmi 'all'
git pull origin master
npm run build:prod
docker-compose up -d
docker volume prune