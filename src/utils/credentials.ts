import dotenv from "dotenv";
dotenv.config({ path: "./configs/.env" });
dotenv.config({ path: "./configs/local.env" });

export type UserCredentials = {
  email: string;
  password: string;
  name: string;
  secret?: string;
};

/**
 * Returns credentials for the given user type from environment variables.
 * @param userType - e.g. 'external_user', 'admin', 'internal_user'
 */
export async function fetchCredentials(
  userType: string,
): Promise<UserCredentials> {
  const prefix = userType.toUpperCase().replace(/-/g, "_");
  return {
    email: process.env[`${prefix}_EMAIL`] ?? "",
    password: process.env[`${prefix}_PASSWORD`] ?? "",
    name: process.env[`${prefix}_NAME`] ?? userType,
    secret: process.env[`${prefix}_SECRET`] ?? "",
  };
}
