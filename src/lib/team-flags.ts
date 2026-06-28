const TWEMOJI_CDN =
  "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72";

/** Regional-indicator pair (🇦🇷) or subnational tag sequence (🏴󠁧󠁢󠁥󠁮󠁧󠁿) */
export function flagEmojiToTwemojiSrc(emoji: string): string | null {
  const trimmed = emoji.trim();
  if (!trimmed || trimmed === "⚽") return null;

  const codepoints: string[] = [];
  for (const char of trimmed) {
    const cp = char.codePointAt(0);
    if (cp === undefined || cp === 0xfe0f) continue;
    codepoints.push(cp.toString(16));
  }

  if (codepoints.length === 0) return null;

  const isRegionalPair =
    codepoints.length === 2 &&
    codepoints.every((cp) => {
      const n = parseInt(cp, 16);
      return n >= 0x1f1e6 && n <= 0x1f1ff;
    });

  const isSubnational = (() => {
    if (codepoints[0] !== "1f3f4") return false;
    const tags = codepoints.slice(1);
    if (tags.length === 0) return false;
    const letterTags =
      tags[tags.length - 1] === "e007f" ? tags.slice(0, -1) : tags;
    return (
      letterTags.length > 0 &&
      letterTags.every((cp) => {
        const n = parseInt(cp, 16);
        return n >= 0xe0061 && n <= 0xe007a;
      })
    );
  })();

  if (!isRegionalPair && !isSubnational) return null;

  return `${TWEMOJI_CDN}/${codepoints.join("-")}.png`;
}
