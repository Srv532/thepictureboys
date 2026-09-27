export const site = {
  name: "ThePictureBoys",
  tagline: "Photography & videography. Stories told in frames.",
  description:
    "ThePictureBoys is a photography and videography duo capturing places, people and moments. Cinematic stills and films.",
  founded: "November",
  members: [
    {
      name: "Sravan Shaji",
      first: "Sravan",
      last: "Shaji",
      role: "Photographer · Filmmaker",
      instagram: { handle: "@srvnshaji", url: "https://instagram.com/srvnshaji" },
    },
    {
      name: "Pranav Rajeev",
      first: "Pranav",
      last: "Rajeev",
      role: "Photographer · Filmmaker",
      instagram: { handle: "@pranav__rajeev_", url: "https://instagram.com/pranav__rajeev_" },
    },
  ],
  /** Background film for the home hero. */
  heroVideo: "18080020727239984",
  stats: [
    { value: 12, suffix: "+", label: "Years behind a camera" },
    { value: 2, suffix: "", label: "Storytellers" },
  ],
  services: [
    { title: "Photography", text: "Portraits, culture, travel and everyday moments, shot with an eye for light." },
    { title: "Videography", text: "Short films, reels and highlight edits with a cinematic, story-first feel." },
    { title: "Aerial", text: "Top-down perspectives and sweeping frames from above." },
    { title: "Events & Culture", text: "Performances, festivals and celebrations, captured as they happen." },
  ],
} as const;

