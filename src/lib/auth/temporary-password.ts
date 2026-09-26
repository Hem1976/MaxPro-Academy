import { randomBytes } from "node:crypto";

const CHARSET =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";

export function generateTemporaryPassword(length = 14): string {
  const bytes = randomBytes(length);
  let password = "";

  for (let index = 0; index < length; index += 1) {
    password += CHARSET[bytes[index] % CHARSET.length];
  }

  return password;
}
