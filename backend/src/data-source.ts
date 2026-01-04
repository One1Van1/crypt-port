import { DataSource } from 'typeorm';

const isDevelopment = process.env.NODE_ENV !== 'production';

export default new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'crypt_port',
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/migrations/*.js'],
  synchronize: false,
  logging: true,
});
