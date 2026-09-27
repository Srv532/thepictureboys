import type { Metadata } from "next";
import { RevealText } from "@/components/motion/RevealText";
import { WorkGrid } from "@/components/work/WorkGrid";
import { projects, usedCategories } from "@/content/projects";
import { toWorkItem } from "@/lib/view";
import styles from "./work.module.css";

export const metadata: Metadata = { title: "Work", description: "Films and photographs by ThePictureBoys." };

export default function WorkPage() {
  return (
    <div className={`${styles.page} container`} data-dim>
      <header className={styles.head}>
        <p className="eyebrow">Portfolio · {projects.length} projects</p>
        <RevealText as="h1" className={`${styles.title} display`} text="The Work" trigger="mount" delay={0.3} />
        <p className={`${styles.lede} serif`}>Films, stills and everything in between.</p>
      </header>
      <WorkGrid items={projects.map(toWorkItem)} categories={[...usedCategories()]} />
    </div>
  );
}
