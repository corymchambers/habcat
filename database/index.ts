import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import * as schema from "./schema";

// Open the database
const expo = openDatabaseSync("habcat.db");

// Create drizzle instance
export const db = drizzle(expo, { schema });

// Export schema for convenience
export { schema };
