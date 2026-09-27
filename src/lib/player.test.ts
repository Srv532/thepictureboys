import { describe, expect, it } from "vitest";
import { formatTime, keyToAction, stepSpeed } from "./player";

describe("formatTime", () => {
  it("formats m:ss and h:mm:ss", () => {
    expect(formatTime(0)).toBe("0:00");
    expect(formatTime(39.5)).toBe("0:39");
    expect(formatTime(125)).toBe("2:05");
    expect(formatTime(3725)).toBe("1:02:05");
  });
  it("treats NaN/negative as zero", () => {
    expect(formatTime(NaN)).toBe("0:00");
    expect(formatTime(-4)).toBe("0:00");
  });
});

describe("stepSpeed", () => {
  it("steps through the speed list and clamps at the ends", () => {
    expect(stepSpeed(1, 1)).toBe(1.25);
    expect(stepSpeed(1, -1)).toBe(0.75);
    expect(stepSpeed(2, 1)).toBe(2);
    expect(stepSpeed(0.25, -1)).toBe(0.25);
  });
  it("snaps off-list speeds to the neighbouring step", () => {
    expect(stepSpeed(1.1, 1)).toBe(1.25);
    expect(stepSpeed(1.1, -1)).toBe(1);
  });
});

describe("keyToAction", () => {
  it("maps player shortcuts", () => {
    expect(keyToAction(" ")).toEqual({ type: "toggle" });
    expect(keyToAction("ArrowRight")).toEqual({ type: "seekBy", seconds: 5 });
    expect(keyToAction("j")).toEqual({ type: "seekBy", seconds: -10 });
    expect(keyToAction("7")).toEqual({ type: "seekPercent", percent: 70 });
    expect(keyToAction(">")).toEqual({ type: "speed", dir: 1 });
    expect(keyToAction("q")).toBeNull();
  });
});
