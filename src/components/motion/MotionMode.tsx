"use client";
import { createContext, useContext, useEffect, useState } from "react";

export type MotionMode = "desktop" | "touch" | "reduced";
type Ctx = { mode: MotionMode; webgl: boolean; ready: boolean };

const MotionModeContext = createContext<Ctx>({ mode: "desktop", webgl: false, ready: false });

function detectWebGL() {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function MotionModeProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Ctx>({ mode: "desktop", webgl: false, ready: false });

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () =>
      setState({
        mode: reduced.matches ? "reduced" : fine.matches ? "desktop" : "touch",
        webgl: detectWebGL(),
        ready: true,
      });
    update();
    reduced.addEventListener("change", update);
    fine.addEventListener("change", update);
    return () => {
      reduced.removeEventListener("change", update);
      fine.removeEventListener("change", update);
    };
  }, []);

  return <MotionModeContext.Provider value={state}>{children}</MotionModeContext.Provider>;
}

export const useMotionMode = () => useContext(MotionModeContext);
