"use client";

import { useEffect } from "react";

export default function ConsoleFilter() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    const origError = console.error;
    console.error = (...args: unknown[]) => {
      const first = typeof args[0] === "string" ? args[0] : "";
      if (first.includes("disableTransition prop")) return;
      origError(...args as Parameters<typeof console.error>);
    };
    return () => {
      console.error = origError;
    };
  }, []);
  return null;
}


