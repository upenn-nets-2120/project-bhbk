import { PoolOptions } from "mysql2";

export const rdsConfig = {
  host: "instalitedb.c1jqnrtmzqmb.us-east-1.rds.amazonaws.com",
  user: "admin",
  password: "rds-password",
  database: "instalitedb",
  port: 3306,
};

export const imdbConfig = {
  host: "imdbdatabase.cryiiqiqodn9.us-east-1.rds.amazonaws.com",
  user: "admin",
  password: "rds-password",
  database: "imdbdatabase",
  port: 3306,
};
