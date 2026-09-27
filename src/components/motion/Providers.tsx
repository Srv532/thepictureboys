"use client";
import { MotionConfig } from "motion/react";
import { MotionModeProvider } from "./MotionMode";
import { SmoothScroll } from "./SmoothScroll";
import { TransitionProvider } from "./Transition";
import { IntroProvider } from "./Intro";
import { Cursor } from "./Cursor";
import { Grain } from "./Grain";
import { ToneObserver } from "./Tone";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <MotionModeProvider>
        <SmoothScroll>
          <TransitionProvider>
            <IntroProvider>
              {children}
              <ToneObserver />
              <Grain />
              <Cursor />
            </IntroProvider>
          </TransitionProvider>
        </SmoothScroll>
      </MotionModeProvider>
    </MotionConfig>
  );
}
