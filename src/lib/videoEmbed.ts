/** Resolve hero background video from a pasted URL (file, YouTube, Vimeo). */
export type HeroVideoKind = "file" | "youtube" | "vimeo";

export interface HeroVideoResolved {
  kind: HeroVideoKind;
  /** For file: direct URL. For embeds: iframe src */
  src: string;
}

/** Safari / iOS often cannot decode WebM in a video element; skip to avoid glitchy or blank playback. */
export function isFileVideoPlayableInBrowser(src: string): boolean {
  if (typeof document === "undefined") return true;
  const lower = src.split("?")[0]?.toLowerCase() ?? "";
  if (lower.endsWith(".webm")) {
    const v = document.createElement("video");
    return v.canPlayType('video/webm; codecs="vp8, vorbis"') !== "" || v.canPlayType("video/webm") !== "";
  }
  if (lower.endsWith(".ogg") || lower.endsWith(".ogv")) {
    const v = document.createElement("video");
    return v.canPlayType('video/ogg; codecs="theora"') !== "" || v.canPlayType("video/ogg") !== "";
  }
  return true;
}

export function resolveHeroVideoUrl(raw: string): HeroVideoResolved | null {
  const url = raw.trim();
  if (!url) return null;

  // Accept direct video files from absolute URLs, root-relative paths, and local relative paths.
  if (/\.(mp4|webm|ogg|mov|m4v)(\?|#|$)/i.test(url)) {
    if (!isFileVideoPlayableInBrowser(url)) return null;
    return { kind: "file", src: url };
  }

  const yt =
    url.match(/(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/) ||
    url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (yt?.[1]) {
    const id = yt[1];
    return {
      kind: "youtube",
      src: `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&playsinline=1&modestbranding=1&rel=0&iv_load_policy=3`,
    };
  }

  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm?.[1]) {
    return {
      kind: "vimeo",
      src: `https://player.vimeo.com/video/${vm[1]}?autoplay=1&muted=1&loop=1&background=1&dnt=1`,
    };
  }

  return null;
}
