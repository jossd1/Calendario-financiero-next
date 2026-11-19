import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config(); // Carga explícitamente el archivo .env de la raíz

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});