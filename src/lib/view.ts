import type { Project } from "@/content/projects";
import { formatTime } from "@/lib/player";
import { getImage, getVideo, jpegAtMost, mediaUrl } from "@/lib/media";
import type { WorkItem } from "@/components/work/WorkCard";

/** Server-side: turns a project into the plain props client cards need. */
export function toWorkItem(p: Project): WorkItem {
  const cover = getImage(p.cover);
  const video = p.video ? getVideo(p.video) : undefined;
  return {
    slug: p.slug,
    title: p.title,
    category: p.category,
    year: p.year,
    cover,
    coverTexture: jpegAtMost(cover, 1280),
    preview: video ? mediaUrl(video.preview) : undefined,
    duration: video ? formatTime(video.duration) : undefined,
  };
}
