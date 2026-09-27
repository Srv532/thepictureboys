"use client";
import Link from "next/link";
import type { ComponentProps } from "react";
import { useTransitionNav } from "./Transition";

/** Internal link that plays the film-cut transition before navigating. */
export function TLink({ href, onClick, ...rest }: ComponentProps<typeof Link> & { href: string }) {
  const { navigate } = useTransitionNav();
  return (
    <Link
      href={href}
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        navigate(href);
      }}
    />
  );
}
