import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Picture } from "@/components/Picture";
import { RevealText } from "@/components/motion/RevealText";
import { TLink } from "@/components/motion/TLink";
import { VideoPlayer } from "@/components/player/VideoPlayer";
import { Stills } from "@/components/work/Stills";
import { getProject, nextProject, projects } from "@/content/projects";
import { formatTime } from "@/lib/player";
import { getImage, getVideo, jpegAtMost } from "@/lib/media";
import styles from "./project.module.css";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const p = getProject((await params).slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.description,
    openGraph: { title: p.title, description: p.description, images: [jpegAtMost(getImage(p.cover), 1280)] },
  };
}

export default async function ProjectPage({ params }: Params) {
  const p = getProject((await params).slug);
  if (!p) notFound();
  const video = p.video ? getVideo(p.video) : undefined;
  const stills = p.stills.map(getImage);
  const next = nextProject(p.slug);

  return (
    <article className={styles.page}>
      <header className={`${styles.head} container`} data-dim>
        <p className="eyebrow">
          {p.category} · {p.year} {video && `· ${formatTime(video.duration)}`}
        </p>
        <RevealText as="h1" className={`${styles.title} display`} text={p.title} trigger="mount" delay={0.35} />
      </header>

      <div className={`${styles.hero} container`}>
        {video ? (
          <div className={styles.theatre}>
            <VideoPlayer video={video} title={p.title} />
          </div>
        ) : (
          <Stills images={stills} title={p.title} />
        )}
      </div>

      <div data-dim>
        <section className={`${styles.body} container`}>
          <p className="eyebrow">About this {video ? "film" : "series"}</p>
          <p className={styles.desc}>{p.description}</p>
          <dl className={styles.facts}>
            <div><dt>Category</dt><dd>{p.category}</dd></div>
            <div><dt>Year</dt><dd>{p.year}</dd></div>
            <div><dt>By</dt><dd>ThePictureBoys</dd></div>
            {video && <div><dt>Duration</dt><dd>{formatTime(video.duration)}</dd></div>}
          </dl>
        </section>

        {video && stills.length > 0 && (
          <section className={`${styles.stills} container`}>
            <Stills images={stills} title={p.title} />
          </section>
        )}

        <TLink href={`/work/${next.slug}`} className={styles.next} data-cursor="Next">
          <div className={styles.nextBg}>
            <Picture image={getImage(next.cover)} alt="" fit="cover" sizes="100vw" />
          </div>
          <div className={`${styles.nextText} container`}>
            <span className="eyebrow">Next project</span>
            <span className="display">{next.title}</span>
          </div>
        </TLink>
      </div>
    </article>
  );
}
