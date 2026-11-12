# Hadir (حاضر) — Logo kit for the website

Hadir is a web platform for attendance tracking at events, courses and workshops. Attendees scan a code and are checked in within seconds. The logo is a scan frame (three navy corner brackets) with a green check mark in the fourth corner.

## Files

| File | Use |
|---|---|
| `hadir-mark.svg` | Mark only, static. Favicon, app icon, small spaces, avatars. |
| `hadir-mark-animated.svg` | Mark only, animated. Hero, loader, splash screen, large faint background. |
| `hadir-logo.svg` | Full logo (mark + حاضر + Hadir), static. Header, footer, emails, social. |
| `hadir-logo-animated.svg` | Full logo, animated. Landing page hero or splash screen. |

## Which logo to use where (decision guide)

| Place | Use | Notes |
|---|---|---|
| Site header (desktop and tablet) | `hadir-logo.svg` | Static only. Never animate the header. |
| Site header (small phones, when the full logo gets too small) | `hadir-mark.svg` + "حاضر" as HTML text | Switch when the full logo would be under about 120 px wide. |
| Footer | `hadir-logo.svg` | Static. |
| Login, register, forgot-password pages | `hadir-logo.svg` | Static, centered above the form. |
| Favicon, browser tab, PWA / app icon | `hadir-mark.svg` | Mark only. Export PNG sizes (32, 180, 192, 512) from it. |
| Avatars, small badges, notification icons, watermarks | `hadir-mark.svg` | Any place under about 120 px wide. |
| First-load splash screen | `hadir-mark-animated.svg` | See "Loading behavior". |
| Page loading, route changes, data fetching | `hadir-mark-animated.svg` | Mark only, never the full logo. |
| Buttons while submitting / checking in | `hadir-mark-animated.svg` | Small (20–28 px). |
| Landing page hero background | `hadir-mark-animated.svg` | Large, faint (12–18% opacity), behind the content. |
| Landing page hero, when the brand name should be shown with motion | `hadir-logo-animated.svg` | Once per page, near the top. Inline the SVG so the font loads. |
| Emails, PDFs, certificates, printed material, social cards | `hadir-logo.svg` exported as PNG or PDF | Email clients do not support SVG animation or reliably support SVG. Always static. |

Rules:
- Only one animated logo may be visible on screen at a time.
- Never place the mark next to the full logo. The full logo already contains the mark.
- `hadir-logo-animated.svg` is only for the landing hero or an intro. Do not use it for loading states, headers or footers.
- If unsure, use the static version. Animation is reserved for loading and for one hero moment.

## Colors

- Navy `#172845` — brackets and text
- Green `#00AF93` — check mark and scan beam
- On dark backgrounds: brackets and text become white `#FFFFFF`, green becomes `#00D4AE`

The SVG files use fixed light-mode colors. For a dark theme, inline the SVG and override the fills and strokes with CSS variables, or swap the colors in a copy of the file.

## Animation

A 4-second loop: a green beam sweeps down through the frame, then the check mark draws itself, holds, and fades. It already respects `prefers-reduced-motion` (shows the static check instead).

Animated SVGs only run their animation when used through `<img>`, CSS `background-image`, or inline `<svg>`. They do not need JavaScript.

## Fonts (important)

The text in `hadir-logo.svg` and `hadir-logo-animated.svg` is live text, not outlines. It uses **Readex Pro 600** (Google Fonts) with the `@import` inside the SVG.

- Inline `<svg>` in HTML or opened directly in a browser: the font loads normally.
- Used through `<img src>` or CSS `background-image`: browsers block external fonts, so the text falls back to a system font. To avoid this, either inline the SVG, or load Readex Pro on the page and use the SVG's mark only with the wordmark written as HTML text.
- The wordmark font is a placeholder until the final font is chosen. To change it, edit the `font-family` in the `<style>` block of the two logo files. The font should be bold and modern, Arabic and Latin both set in the same family or a matching pair.

## Usage rules

- Keep clear space around the logo equal to the width of one bracket arm (about 15% of the mark's width).
- Minimum size: mark 24 px wide, full logo 120 px wide.
- Do not stretch, rotate, recolor outside the palette above, add shadows or outlines.
- On photos or busy backgrounds, place the logo on a solid navy or white area.
- Use the mark alone (no text) for favicon, app icon and social avatar. Use the full logo in the header and footer, with the mark on the right side of the text in RTL layouts if placed horizontally.
- The page direction is RTL (`dir="rtl"`, `lang="ar"`).

## Suggested placements

1. **Header:** full static logo (`hadir-logo.svg`, inline) or mark plus HTML text.
2. **Hero background:** `hadir-mark-animated.svg` large and centered, behind the content at 12–18% opacity, `pointer-events: none`, `aria-hidden="true"`.
3. **Loader / splash:** `hadir-mark-animated.svg` at 96–160 px.
4. **Favicon / app icon:** `hadir-mark.svg`. For the app icon, put the mark in white and `#00D4AE` on a navy `#172845` rounded square.
5. **Footer and emails:** static logo.

## Loading behavior (required)

Whenever the site is loading, the animated mark (`hadir-mark-animated.svg`) must be shown. Do not use a generic spinner, progress bar or "Loading..." text anywhere on the site.

**1. First page load: full-screen splash**
- Centered animated mark, 96–140 px wide, on a solid background (`#F5F8FA` light, `#0E1A33` dark).
- Appears only if loading takes longer than about 300 ms, so fast loads show no flash. Once shown, it stays at least about 600 ms, then fades out (about 400 ms) and is removed from the DOM.
- Covers the whole viewport (`position: fixed; inset: 0; z-index: 9999`).

**2. Navigation between pages and data fetching**
- Use the same animated mark, centered in the content area (64–96 px), as the loading state. In React/Next.js use it as the `Suspense` fallback and in `loading.tsx`; in other frameworks use it in the equivalent route-loading slot.
- Show it only if the wait is longer than about 300 ms.

**3. Buttons and small actions (submit, check-in, save)**
- Use the mark at 20–28 px inside or beside the button, and disable the button while loading. Keep the button width fixed so the layout does not jump.

**4. Accessibility**
- The loader container has `role="status"`, `aria-live="polite"` and `aria-label="جارٍ التحميل"`. The image itself has `alt=""`.
- The animation already switches to a static check under `prefers-reduced-motion`; do not add extra motion on top of it.

Example for the first-load splash:

```html
<div id="hadir-loader" role="status" aria-live="polite" aria-label="جارٍ التحميل">
  <img src="/assets/hadir-mark-animated.svg" alt="" width="120" height="116">
</div>
```

```css
#hadir-loader {
  position: fixed; inset: 0; z-index: 9999;
  display: grid; place-items: center;
  background: #F5F8FA;
  opacity: 0;
  animation: hadir-in .2s .3s forwards;   /* appears only after 300 ms */
  transition: opacity .4s;
}
#hadir-loader.done { opacity: 0 !important; pointer-events: none; animation: none; }
@media (prefers-color-scheme: dark) { #hadir-loader { background: #0E1A33; } }
@keyframes hadir-in { to { opacity: 1; } }
```

```js
const loader = document.getElementById('hadir-loader');
window.addEventListener('load', () => {
  const wait = performance.now() > 300 ? 600 : 0;   // avoid a flash on fast loads
  setTimeout(() => {
    loader.classList.add('done');
    setTimeout(() => loader.remove(), 400);
  }, wait);
});
```

Note: on a dark background the mark's navy brackets are not visible. For the dark theme, use a copy of the animated mark with white brackets (`#FFFFFF`) and green `#00D4AE`, or inline the SVG and override the colors with CSS.

## Example: hero background

```css
.hero { position: relative; background: #F5F8FA; }
.hero::before {
  content: "";
  position: absolute; inset: 0;
  background: url("/assets/hadir-mark-animated.svg") center / min(85vmin, 720px) no-repeat;
  opacity: .16;
  pointer-events: none;
}
.hero > * { position: relative; }
```
