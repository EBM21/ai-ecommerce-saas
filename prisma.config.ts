import { defineConfig, env } from "prisma/config";
import "dotenv/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Ye line terminal commands (jese db push) ko aapka direct Supabase port (5432) use karne ko bolegi taake terminal hang na ho
    url: env("DIRECT_URL"),
  },
});