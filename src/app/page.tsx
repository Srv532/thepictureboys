import { Hero } from "@/components/sections/Hero";
import { Statement } from "@/components/sections/Statement";
import { Stats } from "@/components/sections/Stats";
import { FeaturedStack } from "@/components/sections/FeaturedStack";
import { FilmStrip } from "@/components/sections/FilmStrip";
import { FrameMarquee } from "@/components/sections/FrameMarquee";
import { Services } from "@/components/sections/Services";
import { WorkCTA } from "@/components/sections/WorkCTA";
import { featuredProjects, projects } from "@/content/projects";
import { site } from "@/content/site";
import { getImage, getVideo, mediaUrl } from "@/lib/media";

export default function Home() {
  const hero = getVideo(site.heroVideo);
  const photoProjects = projects.filter((p) => !p.video);
  const stills = photoProjects.flatMap((p) => p.stills.map((id) => ({ slug: p.slug, title: p.title, image: getImage(id) })));

  return (
    <>
      <Hero film={mediaUrl(hero.mp4)} poster={mediaUrl(hero.poster.full)} />
      <div data-dim>
        <Statement />
        <Stats
          items={[
            site.stats[0],
            { value: projects.length, suffix: "", label: "Stories in the reel" },
            site.stats[1],
          ]}
        />
        <FeaturedStack
          cards={featuredProjects().map((p) => ({
            slug: p.slug,
            title: p.title,
            category: p.category,
            year: p.year,
            isFilm: Boolean(p.video),
            cover: getImage(p.cover),
            preview: p.video ? mediaUrl(getVideo(p.video).preview) : undefined,
          }))}
        />
        <FilmStrip frames={stills} />
        <FrameMarquee images={projects.map((p) => ({ alt: p.title, image: getImage(p.cover) }))} />
        <Services items={site.services} />
        <WorkCTA count={projects.length} />
      </div>
    </>
  );
}
