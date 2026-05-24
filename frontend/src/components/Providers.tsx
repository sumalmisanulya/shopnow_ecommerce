"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import ToastContainer from "./ToastContainer";

export default function Providers({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <>
      {children}
      <ToastContainer />
    </>
  );
}
