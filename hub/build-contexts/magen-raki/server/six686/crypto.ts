import crypto from "node:crypto";

export function sha512(data: unknown): string {
  return crypto
    .createHash("sha512")
    .update(JSON.stringify(data))
    .digest("hex");
}

export function sha256(data: unknown): string {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(data))
    .digest("hex");
}

export function createId(): string {
  return crypto.randomUUID();
}
