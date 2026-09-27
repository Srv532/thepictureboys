import { describe, expect, it } from "vitest";
import { buildLadder, photoWidths, slugify, even } from "./ladder.mjs";

describe("buildLadder", () => {
  it("never upscales and tops out at the source resolution", () => {
    const rungs = buildLadder(1920, 1080);
    expect(rungs.map((r) => r.height)).toEqual([1080, 720, 480, 360]);
    expect(rungs[0]).toMatchObject({ width: 1920, height: 1080 });
  });

  it("includes 4K for 4K sources", () => {
    expect(buildLadder(3840, 2160).map((r) => r.height)).toEqual([2160, 1440, 1080, 720, 480, 360]);
  });

  it("keeps an off-ladder native resolution as the top rung", () => {
    const rungs = buildLadder(2048, 858); // 2.39:1 scope
    expect(rungs[0]).toMatchObject({ width: 2048, height: 858 });
    expect(rungs.map((r) => r.height)).toEqual([858, 720, 480, 360]);
  });

  it("measures vertical video by its short side", () => {
    const rungs = buildLadder(1080, 1920);
    expect(rungs[0]).toMatchObject({ width: 1080, height: 1920, label: "1080p" });
    expect(rungs[1]).toMatchObject({ width: 720, height: 1280, label: "720p" });
  });

  it("returns a single native rung for tiny sources", () => {
    expect(buildLadder(320, 240)).toEqual([expect.objectContaining({ width: 320, height: 240, label: "240p" })]);
  });

  it("always produces even dimensions", () => {
    for (const r of buildLadder(1917, 1079)) {
      expect(r.width % 2).toBe(0);
      expect(r.height % 2).toBe(0);
    }
  });
});

describe("photoWidths", () => {
  it("caps widths at the source width and includes the source when smaller", () => {
    expect(photoWidths(6000)).toEqual([640, 1280, 1920, 2560]);
    expect(photoWidths(1500)).toEqual([640, 1280, 1500]);
    expect(photoWidths(400)).toEqual([400]);
  });
});

describe("slugify / even", () => {
  it("makes url-safe ids", () => {
    expect(slugify("Wedding Film — Kochi 2025 (Final).MOV")).toBe("wedding-film-kochi-2025-final");
  });
  it("rounds down to even", () => {
    expect(even(1079)).toBe(1078);
    expect(even(1080)).toBe(1080);
  });
});
