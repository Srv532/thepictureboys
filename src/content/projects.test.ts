import { describe, expect, it } from "vitest";
import { projects, validateProjects } from "./projects";

describe("content", () => {
  it("every project references media that exists in the manifest", () => {
    expect(validateProjects()).toEqual([]);
  });
  it("flags missing media and duplicate slugs", () => {
    const p = projects[0];
    expect(validateProjects([p, p], () => false).length).toBeGreaterThan(1);
  });
  it("never uses a raw media id as visible text", () => {
    for (const p of projects) expect(`${p.title} ${p.description}`).not.toMatch(/\d{10,}/);
  });
});
