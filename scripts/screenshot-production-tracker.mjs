/**
 * Capture production /tracker screenshots at Windows desktop width.
 * Run: npx tsx scripts/screenshot-production-tracker.mjs
 */
import { mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const BASE = "https://worldcup-family-sweep.vercel.app/tracker";
const outDir = resolve(dirname(fileURLToPath(import.meta.url)), "..", "qa-screenshots");

mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1366, height: 900 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();

const consoleErrors = [];
page.on("console", (msg) => {
  if (msg.type() !== "error") return;
  const text = msg.text();
  // Benign tracker audio volume quirk — not a flag/runtime failure
  if (text.includes("HTMLMediaElement") && text.includes("volume")) return;
  consoleErrors.push(text);
});
page.on("pageerror", (err) => consoleErrors.push(err.message));

await page.goto(BASE, { waitUntil: "networkidle", timeout: 60_000 });
await page.waitForTimeout(1500);

// Bracket section
const bracket = page.locator("text=World Cup Round of 32").first();
await bracket.scrollIntoViewIfNeeded();
await page.waitForTimeout(500);
await page.screenshot({
  path: resolve(outDir, "tracker-bracket-desktop-1366.png"),
  fullPage: false,
});

// Stage ladder R32
const ladder = page.locator("h3", { hasText: "Round of 32" }).first();
await ladder.scrollIntoViewIfNeeded();
await page.waitForTimeout(500);
await page.screenshot({
  path: resolve(outDir, "tracker-ladder-r32-desktop-1366.png"),
  fullPage: false,
});

// Mobile width
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(BASE, { waitUntil: "networkidle", timeout: 60_000 });
await page.waitForTimeout(1500);
await bracket.scrollIntoViewIfNeeded();
await page.screenshot({
  path: resolve(outDir, "tracker-bracket-mobile-390.png"),
  fullPage: false,
});

// Flag image checks in rendered DOM
const twemojiImgs = await page.locator('img[src*="twemoji"]').count();
const brokenImgs = await page.evaluate(() => {
  const imgs = [...document.querySelectorAll("img[src*='twemoji']")];
  return imgs.filter((img) => !img.complete || img.naturalWidth === 0).length;
});
const initialsInCircles = await page.evaluate(() => {
  const circles = [...document.querySelectorAll(".rounded-full.bg-white.shadow-\\[0_2px_12px_rgba\\(15\\,23\\,42\\,0\\.12\\)\\]")];
  const codes = ["AR", "BR", "NL", "MA", "US"];
  return circles.some((el) => codes.includes(el.textContent?.trim() ?? ""));
});

console.log("\n=== Screenshot QA ===\n");
console.log(`Twemoji img elements: ${twemojiImgs}`);
console.log(`Broken twemoji imgs: ${brokenImgs}`);
console.log(`Initials in flag circles: ${initialsInCircles}`);
console.log(`Console/runtime errors: ${consoleErrors.length}`);
if (consoleErrors.length) {
  for (const e of consoleErrors.slice(0, 5)) console.log(`  - ${e}`);
}
console.log(`\nSaved to ${outDir}`);

await browser.close();
process.exit(
  twemojiImgs >= 15 && brokenImgs === 0 && !initialsInCircles && consoleErrors.length === 0
    ? 0
    : 1,
);
