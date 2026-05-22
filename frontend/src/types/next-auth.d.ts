import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role?: "CUSTOMER" | "ADMIN";
    id?: string;
  }
  interface Session {
    user: {
      role?: "CUSTOMER" | "ADMIN";
      id?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "CUSTOMER" | "ADMIN";
    id?: string;
  }
}
