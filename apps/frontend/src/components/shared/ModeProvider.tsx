"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Mode = "mock" | "live" | null;

const ModeContext = createContext<Mode>(null);

export function useMode() {
  return useContext(ModeContext);
}

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>(null);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
    fetch(`${base}/health`)
      .then((r) => r.json())
      .then((data: { mode?: string }) => {
        if (data.mode === "live" || data.mode === "mock") {
          setMode(data.mode);
        }
      })
      .catch(() => {
        // Health check failed — leave mode as null
      });
  }, []);

  return <ModeContext.Provider value={mode}>{children}</ModeContext.Provider>;
}
