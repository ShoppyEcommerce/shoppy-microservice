import { Sequelize } from "sequelize";

export const databaseConnection = new Sequelize(
  process.env.PGDATABASE as string,
  process.env.PGUSER as string,
  process.env.PGPASSWORD as string,
  {
    dialect: "postgres",
    host: process.env.PGHOST,
    port: parseInt(process.env.DB_PORT as string),
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
      sslmode: "require",
    },
  }
);
