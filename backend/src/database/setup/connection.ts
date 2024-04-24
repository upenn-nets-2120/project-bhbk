import { createPool } from "mysql2/promise";
import { rdsConfig } from "./config";

export const connection = createPool(rdsConfig);
  