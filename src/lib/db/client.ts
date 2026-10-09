import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { z } from "zod";
import * as schema from "./schema";

const databaseUri = z.url().parse(process.env.DATABASE_URI);

// The end-to-end database (compose.e2e.yml) answers over plain HTTP through
// its local proxy; every other host is Neon.
export const LOCAL_DB_HOST = "db.localtest.me";
if (new URL(databaseUri).hostname === LOCAL_DB_HOST) {
  neonConfig.fetchEndpoint = (host) => `http://${host}:4444/sql`;
}

export const db = drizzle({ client: neon(databaseUri), schema });
