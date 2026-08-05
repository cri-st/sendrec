import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getSupportedMimeType, getSupportedVideoMimeType, blobTypeFromMimeType, estimateVideoBitrate } from "./mediaFormat";

describe("getSupportedMimeType", () => {
  const originalMediaRecorder = globalThis.MediaRecorder;

  afterEach(() => {
    globalThis.MediaRecorder = originalMediaRecorder;
  });

  it("returns video/mp4 when mp4 is supported", () => {
    globalThis.MediaRecorder = {
      isTypeSupported: vi.fn((type: string) => type === "video/mp4"),
    } as unknown as typeof MediaRecorder;
    expect(getSupportedMimeType()).toBe("video/mp4");
  });

  it("returns webm when mp4 is not supported but webm vp9+opus is", () => {
    globalThis.MediaRecorder = {
      isTypeSupported: vi.fn((type: string) => type === "video/webm;codecs=vp9,opus"),
    } as unknown as typeof MediaRecorder;
    expect(getSupportedMimeType()).toBe("video/webm;codecs=vp9,opus");
  });

  it("returns video/mp4 when MediaRecorder is undefined", () => {
    // @ts-expect-error testing undefined case
    delete globalThis.MediaRecorder;
    expect(getSupportedMimeType()).toBe("video/mp4");
  });

  it("returns webm vp8+opus when only vp8 is supported (Firefox)", () => {
    globalThis.MediaRecorder = {
      isTypeSupported: vi.fn((type: string) =>
        type === "video/webm;codecs=vp8,opus" || type === "video/webm"
      ),
    } as unknown as typeof MediaRecorder;
    expect(getSupportedMimeType()).toBe("video/webm;codecs=vp8,opus");
  });

  it("returns plain webm when only plain webm is supported", () => {
    globalThis.MediaRecorder = {
      isTypeSupported: vi.fn((type: string) => type === "video/webm"),
    } as unknown as typeof MediaRecorder;
    expect(getSupportedMimeType()).toBe("video/webm");
  });

  it("returns video/mp4 when nothing is supported", () => {
    globalThis.MediaRecorder = {
      isTypeSupported: vi.fn().mockReturnValue(false),
    } as unknown as typeof MediaRecorder;
    expect(getSupportedMimeType()).toBe("video/mp4");
  });
});

describe("getSupportedVideoMimeType", () => {
  const originalMediaRecorder = globalThis.MediaRecorder;

  afterEach(() => {
    globalThis.MediaRecorder = originalMediaRecorder;
  });

  it("returns video/mp4 when mp4 is supported", () => {
    globalThis.MediaRecorder = {
      isTypeSupported: vi.fn((type: string) => type === "video/mp4"),
    } as unknown as typeof MediaRecorder;
    expect(getSupportedVideoMimeType()).toBe("video/mp4");
  });

  it("returns webm vp9 when mp4 is not supported but webm vp9 is", () => {
    globalThis.MediaRecorder = {
      isTypeSupported: vi.fn((type: string) => type === "video/webm;codecs=vp9"),
    } as unknown as typeof MediaRecorder;
    expect(getSupportedVideoMimeType()).toBe("video/webm;codecs=vp9");
  });

  it("returns webm vp8 when only vp8 is supported (Firefox)", () => {
    globalThis.MediaRecorder = {
      isTypeSupported: vi.fn((type: string) =>
        type === "video/webm;codecs=vp8" || type === "video/webm"
      ),
    } as unknown as typeof MediaRecorder;
    expect(getSupportedVideoMimeType()).toBe("video/webm;codecs=vp8");
  });

  it("returns plain webm when only plain webm is supported", () => {
    globalThis.MediaRecorder = {
      isTypeSupported: vi.fn((type: string) => type === "video/webm"),
    } as unknown as typeof MediaRecorder;
    expect(getSupportedVideoMimeType()).toBe("video/webm");
  });

  it("returns video/mp4 when MediaRecorder is undefined", () => {
    // @ts-expect-error testing undefined case
    delete globalThis.MediaRecorder;
    expect(getSupportedVideoMimeType()).toBe("video/mp4");
  });
});

describe("blobTypeFromMimeType", () => {
  it("returns video/webm for webm mime types", () => {
    expect(blobTypeFromMimeType("video/webm;codecs=vp9,opus")).toBe("video/webm");
    expect(blobTypeFromMimeType("video/webm;codecs=vp9")).toBe("video/webm");
    expect(blobTypeFromMimeType("video/webm")).toBe("video/webm");
  });

  it("returns video/mp4 for mp4 mime types", () => {
    expect(blobTypeFromMimeType("video/mp4")).toBe("video/mp4");
  });

  it("returns video/mp4 for unknown types", () => {
    expect(blobTypeFromMimeType("video/quicktime")).toBe("video/mp4");
  });
});

describe("estimateVideoBitrate", () => {
  it("caps 720p and below at 2.5 Mbps", () => {
    expect(estimateVideoBitrate(1280, 720)).toBe(2_500_000);
    expect(estimateVideoBitrate(640, 480)).toBe(2_500_000);
  });

  it("caps 1080p at 4 Mbps", () => {
    expect(estimateVideoBitrate(1920, 1080)).toBe(4_000_000);
  });

  it("caps 1440p at 6 Mbps", () => {
    expect(estimateVideoBitrate(2560, 1440)).toBe(6_000_000);
  });

  it("caps anything above 1440p at 8 Mbps", () => {
    expect(estimateVideoBitrate(3840, 2160)).toBe(8_000_000);
  });
});
