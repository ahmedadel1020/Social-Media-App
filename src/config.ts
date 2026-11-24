import { resolve } from "node:path";
import { config } from "dotenv";

export const NODE_ENV = process.env.NODE_ENV ?? "development";

config({ path: resolve(`.env.${NODE_ENV}`) });

export const PORT: number = parseInt(process.env.PORT ?? "7000");

export const DB_URI: string = process.env.DB_URI as string;
export const REDIS_URI: string = process.env.REDIS_URI as string;
export const ENC_KEY: string = process.env.ENC_KEY as string;
export const IV_LENGTH: number = parseInt(process.env.IV_LENGTH ?? "16");
export const ACCESS_USER_TOKEN_SIGNATURE: string = process.env
  .ACCESS_USER_TOKEN_SIGNATURE as string;
export const ACCESS_TOKEN_EXPIERS_IN: number = parseInt(
  process.env.ACCESS_TOKEN_EXPIERS_IN ?? "1800",
);

export const REFRESH_USER_TOKEN_SIGNATURE: string = process.env
  .REFRESH_USER_TOKEN_SIGNATURE as string;
export const REFRESH_TOKEN_EXPIERS_IN: number = parseInt(
  process.env.REFRESH_TOKEN_EXPIERS_IN ?? "31536000",
);

export const ACCESS_ADMIN_TOKEN_SIGNATURE: string = process.env
  .ACCESS_ADMIN_TOKEN_SIGNATURE as string;
export const REFRESH_ADMIN_TOKEN_SIGNATURE: string = process.env
  .REFRESH_ADMIN_TOKEN_SIGNATURE as string;

export const WEB_CLIENT_ID: string[] =
  process.env.WEB_CLIENT_ID?.split(",") || [];
export const ORIGINS: string[] = process.env.ORIGINS?.split(",") || [];

export const APP_PASSWORD: string = process.env.APP_PASSWORD as string;
export const APP_EMAIL: string = process.env.APP_EMAIL as string;
export const APP_NAME: string = process.env.APP_NAME as string;
export const FRONTEND_URL: string = process.env.FRONTEND_URL as string;

export const AWS_ACCESS_KEY_ID: string = process.env
  .AWS_ACCESS_KEY_ID as string;
export const AWS_SECRET_ACCESS_KEY: string = process.env
  .AWS_SECRET_ACCESS_KEY as string;
export const AWS_REGION: string = process.env.AWS_REGION as string;
export const AWS_BUCKET_NAME: string = process.env.AWS_BUCKET_NAME as string;
export const APPLICATION_NAME: string = process.env.APPLICATION_NAME as string;
export const AWS_EXPIRES_IN: number = parseInt(
  process.env.AWS_EXPIRES_IN ?? "1800",
);
