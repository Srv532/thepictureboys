import { site } from "@/content/site";
import { Marquee } from "@/components/motion/Velocity";
import { TLink } from "@/components/motion/TLink";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer} data-dim>
      <Marquee baseVelocity={-2.5}>
        {Array.from({ length: 4 }, (_, i) => (
          <span key={i} className={`${styles.big} display`}>
            Stories told in <em className="serif">frames</em> <span className={styles.star}>✺</span>
          </span>
        ))}
      </Marquee>
      <div className={`${styles.grid} container`}>
        <div>
          <p className="eyebrow">Explore</p>
          <ul className={styles.links}>
            <li><TLink href="/work">Work</TLink></li>
            <li><TLink href="/about">Photographers</TLink></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow">The Photographers</p>
          <ul className={styles.links}>
            {site.members.map((m) => (
              <li key={m.name}>
                <a href={m.instagram.url} target="_blank" rel="noreferrer" data-magnetic>
                  {m.name} <span aria-hidden>↗</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.meta}>
          <p>{site.tagline}</p>
          <p>© {new Date().getFullYear()} {site.name}</p>
        </div>
      </div>
    </footer>
  );
}
