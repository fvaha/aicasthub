import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: "https://aicasthub.co,http://localhost:3000,http://localhost:3001,http://localhost:8000,http://127.0.0.1:3000,http://127.0.0.1:3001",
      adminCors: "https://aicasthub.co,https://admin.aicasthub.co,http://localhost:5173,http://localhost:9000,http://localhost:7000,http://localhost:7001",
      authCors: "https://aicasthub.co,https://admin.aicasthub.co,http://localhost:5173,http://localhost:9000,http://localhost:8000,http://localhost:3000,http://localhost:3001",
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  modules: [
    {
      resolve: "./src/modules/messaging"
    },
    {
      resolve: "./src/modules/profile"
    },
    {
      resolve: "./src/modules/actor"
    },
    {
      resolve: "./src/modules/escrow"
    }
  ]
})
