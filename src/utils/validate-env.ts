import { cleanEnv, str, port } from "envalid";
import dotenv from "dotenv";

dotenv.config();

function validateEnv(): void {
  cleanEnv(process.env, {
    NODE_ENV: str({
      choices: ["development", "production"],
    }),
    MONGO_PASSWORD: str(),
    MONGO_PATH: str(),
    MONGO_USER: str(),
    PORT: port({ default: 3000 }),
    AUTHENTICATION_TOKEN_EXPIRY: str(),
    AUTHENTICATION_REFRESH_TOKEN_EXPIRY: str(),
  });
}

export const COOKIE_NAME = process.env.COOKIE_NAME || "token";
export const COOKIE_SECRET = process.env.COOKIE_SECRET || "default_secret";
export const COOKIE_MAX_AGE = parseInt(
  process.env.COOKIE_MAX_AGE || "86400000",
  10,
);
export const COOKIE_SECURE = process.env.COOKIE_SECURE === "true";
export const COOKIE_HTTP_ONLY = process.env.COOKIE_HTTP_ONLY === "true";
export const COOKIE_SAME_SITE = (process.env.COOKIE_SAME_SITE || "Lax") as
  | "Lax"
  | "Strict"
  | "None";

export default validateEnv;
