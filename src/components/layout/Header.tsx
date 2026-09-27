"use client";
import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { TLink } from "@/components/motion/TLink";
import { useScrollApi } from "@/components/motion/SmoothScroll";
import { useIntroDone } from "@/components/motion/Intro";
import { site } from "@/content/site";
import styles from "./Header.module.css";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/about", label: "Photographers" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const pathname = usePathname();
  const [menuPath, setMenuPath] = useState(pathname);
  // Close the menu whenever the route changes.
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setOpen(false);
  }
  const { lock, unlock } = useScrollApi();
  const introDone = useIntroDone();

  useEffect(() => {
    if (!open) return;
    lock();
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => {
      unlock();
      window.removeEventListener("keydown", esc);
    };
  }, [open, lock, unlock]);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > 200 && y > last);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.header
        className={styles.header}
        data-dim
        initial={{ y: "-120%" }}
        animate={{ y: !introDone || (hidden && !open) ? "-120%" : "0%" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <TLink href="/" className={`${styles.logo} display`} aria-label="ThePictureBoys home">
          The<span>Picture</span>Boys
        </TLink>
        <nav className={styles.nav} aria-label="Main">
          {NAV.slice(1).map((n) => (
            <TLink key={n.href} href={n.href} className={styles.link} data-magnetic aria-current={pathname === n.href ? "page" : undefined}>
              <span data-text={n.label}>{n.label}</span>
            </TLink>
          ))}
        </nav>
        <button
          className={styles.burger}
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="menu"
          aria-label={open ? "Close menu" : "Open menu"}
          data-magnetic
        >
          <span className={open ? styles.x1 : ""} />
          <span className={open ? styles.x2 : ""} />
        </button>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="menu"
            className={styles.menu}
            initial={{ clipPath: "circle(0% at calc(100% - 40px) 40px)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 40px) 40px)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 40px) 40px)" }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          >
            <nav aria-label="Menu">
              {NAV.map((n, i) => (
                <div className={styles.menuRow} key={n.href}>
                  <motion.div
                    initial={{ y: "110%" }}
                    animate={{ y: "0%" }}
                    exit={{ y: "110%" }}
                    transition={{ delay: 0.15 + i * 0.06, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <TLink href={n.href} className={`${styles.menuLink} display`} onClick={() => setOpen(false)}>
                      <small>0{i + 1}</small>
                      {n.label}
                    </TLink>
                  </motion.div>
                </div>
              ))}
            </nav>
            <div className={styles.menuFoot}>
              {site.members.map((m) => (
                <a key={m.name} href={m.instagram.url} target="_blank" rel="noreferrer">
                  {m.instagram.handle}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
