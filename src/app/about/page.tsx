import type { Metadata } from "next";
import { RevealText } from "@/components/motion/RevealText";
import { Members } from "@/components/sections/Members";
import { Services } from "@/components/sections/Services";
import { Timeline } from "@/components/sections/Timeline";
import { WorkCTA } from "@/components/sections/WorkCTA";
import { projects } from "@/content/projects";
import { site } from "@/content/site";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "The Photographers",
  description: `Meet ${site.members.map((m) => m.name).join(" and ")}, the photographers and filmmakers behind ThePictureBoys.`,
};

export default function AboutPage() {
  return (
    <div data-dim>
      <header className={`${styles.hero} container`}>
        <p className="eyebrow">About us</p>
        <RevealText as="h1" className={`${styles.title} display`} text="The Photographers" trigger="mount" delay={0.3} />
        <p className={`${styles.lede} serif`}>
          Two friends, {site.members[0].first} &amp; {site.members[1].first}, who never put the camera down.
        </p>
      </header>
      <Members members={site.members} />
      <Timeline />
      <Services items={site.services} />
      <WorkCTA count={projects.length} />
    </div>
  );
}
