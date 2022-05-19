import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

require('dotenv').config();

const config: PostgresConnectionOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'example',
  database: process.env.DB_NAME || 'postgres',
  entities: ['dist/**/**.entity.js'],
  migrations: ['dist/src/db/migrations/*.js'],
  cli: {
    migrationsDir: 'src/db/migrations',
  },
  synchronize: false,
};

export default config;
