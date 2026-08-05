export function getSupportedMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "video/mp4";
  if (MediaRecorder.isTypeSupported("video/mp4")) return "video/mp4";
  if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus"))
    return "video/webm;codecs=vp9,opus";
  if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus"))
    return "video/webm;codecs=vp8,opus";
  if (MediaRecorder.isTypeSupported("video/webm")) return "video/webm";
  return "video/mp4";
}

export function getSupportedVideoMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "video/mp4";
  if (MediaRecorder.isTypeSupported("video/mp4")) return "video/mp4";
  if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9"))
    return "video/webm;codecs=vp9";
  if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8"))
    return "video/webm;codecs=vp8";
  if (MediaRecorder.isTypeSupported("video/webm")) return "video/webm";
  return "video/mp4";
}

// Screen recordings have no explicit bitrate cap from the browser by default,
// which can produce very large files (multiple hundred MB for a 15min 1080p+
// capture) that are slow to buffer/stream on playback. Cap it based on
// resolution — screen content (text, scrolling) needs more bits per pixel
// than typical camera footage, so these are generous relative to standard
// camera-bitrate tables, but still bounded.
export function estimateVideoBitrate(width: number, height: number): number {
  const pixels = width * height;
  if (pixels <= 1280 * 720) return 2_500_000; // 720p and below
  if (pixels <= 1920 * 1080) return 4_000_000; // 1080p
  if (pixels <= 2560 * 1440) return 6_000_000; // 1440p
  return 8_000_000; // 4K/retina and above
}

export const WEBCAM_VIDEO_BITS_PER_SECOND = 1_000_000;

export function blobTypeFromMimeType(mimeType: string): string {
  return mimeType.startsWith("video/webm") ? "video/webm" : "video/mp4";
}
