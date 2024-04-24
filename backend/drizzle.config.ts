import { defineConfig } from 'drizzle-kit'
import { rdsConfig } from './src/database/setup/config'

export default defineConfig({
    schema: './src/database/schema.ts',
    out: './src/database/migrations',
    breakpoints: true,
    driver: 'mysql2',
    dbCredentials: {
        host: rdsConfig.host,
        password: rdsConfig.password,
        port: rdsConfig.port,
        user: rdsConfig.user,
        database: rdsConfig.database
    }
  })