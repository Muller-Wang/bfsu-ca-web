import "server-only";
import path from "node:path";

export function uploadRoot() {
  return path.resolve(/* turbopackIgnore: true */ process.env.UPLOAD_DIR || path.join(process.cwd(), ".data", "uploads"));
}

export function safeStoredPath(key: string) {
  const root = uploadRoot();
  const target = path.resolve(root, key);
  if (!target.startsWith(`${root}${path.sep}`)) throw new Error("Invalid file key");
  return target;
}
