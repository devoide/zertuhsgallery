const ID = /^[A-Za-z0-9_-]{11}$/;

/**
 * Extracts the 11-char video id from any common YouTube link
 * (watch?v=, youtu.be/, /shorts/, /embed/, /live/, m./music. subdomains)
 * or a bare id. Returns null if it isn't a YouTube video.
 */
export function parseYouTubeId(input: string): string | null {
  const value = input.trim();
  if (ID.test(value)) return value;

  let url: URL;
  try {
    url = new URL(value.startsWith("http") ? value : `https://${value}`);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^(www|m|music)\./, "");
  let id: string | null = null;

  if (host === "youtu.be") {
    id = url.pathname.split("/")[1] ?? null;
  } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const [, kind, rest] = url.pathname.split("/");
    if (kind === "watch") id = url.searchParams.get("v");
    else if (["shorts", "embed", "live", "v"].includes(kind)) id = rest ?? null;
  }

  return id && ID.test(id) ? id : null;
}

/** privacy-enhanced embed (no cookies until the viewer presses play) */
export function youTubeEmbedUrl(id: string) {
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0`;
}
