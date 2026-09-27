import { hasMedia } from "@/lib/media";

export const categories = ["Films", "Aerial", "Culture", "Heritage", "Nature", "Street", "Automotive"] as const;
export type Category = (typeof categories)[number];

export type Project = {
  slug: string;
  title: string;
  category: Category;
  year: string;
  description: string;
  /** Media ids (from src/content/media-manifest.json). Never shown on the site. */
  cover: string;
  video?: string;
  stills: string[];
  featured?: boolean;
};

export const projects: Project[] = [
  {
    slug: "inspired-from-the-office",
    title: "Inspired From The Office",
    category: "Films",
    year: "2025",
    description: "A day in the city through a moving window: commuters, street corners and the small rhythms of an ordinary workday.",
    cover: "18080020727239984",
    video: "18080020727239984",
    stills: [],
    featured: true,
  },
  {
    slug: "fishermans-wake",
    title: "Fisherman's Wake",
    category: "Aerial",
    year: "2025",
    description: "From above, a fishing boat cuts a white line through a grey sea. A study in texture, motion and colour.",
    cover: "17958311831907766",
    stills: ["17958311831907766", "17881011720451069", "18091788166965837"],
    featured: true,
  },
  {
    slug: "nritya",
    title: "Nritya",
    category: "Culture",
    year: "2025",
    description: "Dancers in a moment of stillness before the performance. Tradition, poise and expression in black and white.",
    cover: "17989984106907788",
    stills: ["17989984106907788"],
    featured: true,
  },
  {
    slug: "guardian-of-the-sky",
    title: "Guardian of the Sky",
    category: "Heritage",
    year: "2025",
    description: "A mythic guardian carved in stone, framed against an open sky.",
    cover: "18329943370214898",
    stills: ["18329943370214898"],
    featured: true,
  },
  {
    slug: "deepam",
    title: "Deepam",
    category: "Films",
    year: "2025",
    description: "Small flames against the night. Lamps flickering along a wall, and the quiet warmth they bring.",
    cover: "18087598729805106",
    video: "18087598729805106",
    stills: [],
  },
  {
    slug: "monsoon-diaries",
    title: "Monsoon Diaries",
    category: "Films",
    year: "2025",
    description: "Rain on rooftops, wet tiles and swaying palms. The monsoon, seen from home.",
    cover: "17874158433375037",
    video: "17874158433375037",
    stills: [],
  },
  {
    slug: "harbour-hours",
    title: "Harbour Hours",
    category: "Street",
    year: "2025",
    description: "Boats in, birds overhead and a harbour already busy with the day's work.",
    cover: "18029349737573528",
    stills: ["18029349737573528"],
  },
  {
    slug: "last-light",
    title: "Last Light",
    category: "Nature",
    year: "2025",
    description: "The sun sinks into the sea while silhouettes gather on the shore to watch it go.",
    cover: "18083475992045424",
    stills: ["18083475992045424"],
    featured: true,
  },
  {
    slug: "gopuram",
    title: "Gopuram",
    category: "Heritage",
    year: "2025",
    description: "A temple tower rising into a deep blue sky, every tier alive with detail.",
    cover: "18366633415087888",
    stills: ["18366633415087888"],
  },
  {
    slug: "temple-grounds",
    title: "Temple Grounds",
    category: "Heritage",
    year: "2025",
    description: "An old tree stands guard over quiet lawns and ancient stone.",
    cover: "18400356568193386",
    stills: ["18400356568193386"],
  },
  {
    slug: "under-the-canopy",
    title: "Under the Canopy",
    category: "Nature",
    year: "2025",
    description: "Light breaking through branches over still water.",
    cover: "17994670793860106",
    stills: ["17994670793860106"],
  },
  {
    slug: "wild-eye",
    title: "Wild Eye",
    category: "Nature",
    year: "2025",
    description: "Curious, close and a little bit comic. A portrait from the wild side.",
    cover: "18107309773634212",
    stills: ["18107309773634212"],
  },
  {
    slug: "street-machines",
    title: "Street Machines",
    category: "Automotive",
    year: "2025",
    description: "Chrome, colour and curves, parked up and caught in soft daylight.",
    cover: "17989526354910002",
    stills: ["17989526354910002"],
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
export const featuredProjects = () => projects.filter((p) => p.featured);
export const usedCategories = () => categories.filter((c) => projects.some((p) => p.category === c));

export function nextProject(slug: string) {
  const i = projects.findIndex((p) => p.slug === slug);
  return projects[(i + 1) % projects.length];
}

/** Returns a list of problems (missing media, duplicate slugs). Empty = valid. */
export function validateProjects(list: Project[] = projects, exists: (id: string) => boolean = hasMedia) {
  const problems: string[] = [];
  const slugs = new Set<string>();
  for (const p of list) {
    if (slugs.has(p.slug)) problems.push(`Duplicate slug "${p.slug}"`);
    slugs.add(p.slug);
    for (const id of [p.cover, ...(p.video ? [p.video] : []), ...p.stills]) {
      if (!exists(id)) problems.push(`"${p.title}" references missing media`);
    }
  }
  return problems;
}
