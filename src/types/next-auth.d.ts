import { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Extended User interface with role field
   */
  interface User {
    role?: string;
  }

  /**
   * Extended Session interface with role in user
   */
  interface Session {
    user: User & DefaultSession["user"];
  }
}
