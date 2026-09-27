import { TLink } from "@/components/motion/TLink";

export default function NotFound() {
  return (
    <section className="container" style={{ minHeight: "100svh", display: "grid", placeContent: "center", gap: 24, textAlign: "center" }}>
      <p className="eyebrow">Error 404</p>
      <h1 className="display" style={{ fontSize: "clamp(72px, 16vw, 260px)" }}>
        Lost <span className="serif" style={{ color: "var(--ember)" }}>footage</span>
      </h1>
      <p style={{ color: "var(--muted)" }}>This frame didn&apos;t make the final cut.</p>
      <TLink href="/" data-magnetic style={{ justifySelf: "center", padding: "18px 30px", borderRadius: 999, background: "var(--ember)", color: "var(--ink)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", fontSize: 14 }}>
        Back to the reel
      </TLink>
    </section>
  );
}
