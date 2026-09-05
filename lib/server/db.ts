import "server-only";
import postgres, { type Sql } from "postgres";
import { databaseUrl } from "./env";

let client: Sql | null = null;

export function db(): Sql {
  if (!client) {
    client = postgres(databaseUrl(), {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false,
    });
  }
  return client;
}
