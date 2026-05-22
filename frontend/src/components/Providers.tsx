"use client";

import { SessionProvider } from "next-auth/react";
import ToastContainer from "./ToastContainer";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <ToastContainer />
    </SessionProvider>
  );
}
