import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { z } from "zod";
import * as schema from "./schema";

const databaseUri = z.url().parse(process.env.DATABASE_URI);

export const db = drizzle({ client: neon(databaseUri), schema });
