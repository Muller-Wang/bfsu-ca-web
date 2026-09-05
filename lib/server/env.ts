import "server-only";

export const isDemoEnabled = () => process.env.DEMO_MODE === "1";

export function sessionSecret(): Uint8Array {
  const value = process.env.SESSION_SECRET;
  if (value) {
    if (value.length < 32) throw new Error("SESSION_SECRET must contain at least 32 characters");
    return new TextEncoder().encode(value);
  }
  if (process.env.NODE_ENV !== "production") {
    return new TextEncoder().encode("bfsu-makers-club-local-development-secret-only");
  }
  throw new Error("SESSION_SECRET is required in production");
}

export function databaseUrl(): string {
  const value = process.env.DATABASE_URL;
  if (!value) throw new Error("DATABASE_URL is required when DEMO_MODE is not enabled");
  return value;
}
