import dotenv from "dotenv";
dotenv.config({ path: "./configs/.env" });
dotenv.config({ path: "./configs/local.env" });

export type CredentialsMap = {
  email: string;
  password: string;
  name: string;
  secret?: string;
};

export type UserType =
  | "external-user"
  | "demo-user"
  | "admin"
  | "internal-user"
  | "support-user";

export async function fetchCredentials(
  userType: UserType,
): Promise<CredentialsMap> {
  const prefix = userType.toUpperCase().replace(/-/g, "_");
  return {
    email:
      process.env[`${prefix}_EMAIL`] ??
      (() => {
        throw new Error(`Missing email for ${userType}`);
      })(),
    password:
      process.env[`${prefix}_PASSWORD`] ??
      (() => {
        throw new Error(`Missing password for ${userType}`);
      })(),
    name:
      process.env[`${prefix}_NAME`] ??
      (() => {
        throw new Error(`Missing name for ${userType}`);
      })(),
    secret: (() => {
      const secret = process.env[`${prefix}_SECRET`];
      if (!secret) {
        const email =
          process.env[`${prefix}_EMAIL`] ??
          (() => {
            throw new Error(`Missing email for ${userType}`);
          })();
        if (!email.includes("@allegion.com"))
          throw new Error(`Missing secret for ${userType}`);
      }
      return secret;
    })(),
  };
}
