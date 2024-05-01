import { migrate } from "drizzle-orm/mysql2/migrator";
import { db } from "./setup";
import { connection } from "./setup/connection";

migrate(db, { migrationsFolder: "src/database/migrations" }).then(() =>
  connection.end()
);
