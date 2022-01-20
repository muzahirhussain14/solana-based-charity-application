Sequelize Migrations
- To make migration
    npx sequelize-cli migration:generate --name create-test-table
- to run all migrations:
    npx sequelize-cli db:migrate

- to run all migrations with env
    npx sequelize-cli db:migrate --env development

- to make new seeder:
    npx sequelize-cli seed:generate --name demo-user
  to run all seeders:
    npx sequelize-cli db:seed:all
 - to run a single seeder:
    npx sequelize-cli db:seed --seed 202002191200-language.js

 - undo all migrations done till this point:
    npx sequelize-cli db:migrate:undo:all

- admin credentials
    admin@admin.com
    admin