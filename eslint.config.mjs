import next from "eslint-config-next";

const config = [
  ...next,
  { ignores: [".next/**", "public/media/**", "node_modules/**"] },
];

export default config;
