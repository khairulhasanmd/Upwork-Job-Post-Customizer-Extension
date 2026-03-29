# Upwork Job Post Customizer

A browser extension (Firefox/Chrome) that enhances the Upwork job feed with visual customizations and a smart bid-score overlay to help freelancers quickly identify the best opportunities.

## Features

- **Bid-Score Strip** — Each job tile gets a scored percentage bar (0–100%) calculated from proposals count, client country, payment verification, total spent, and client rating.
- **Country Filtering** — Highlight preferred client countries with a glowing border and animate blocked countries with a shake badge.
- **Proposal Color Coding** — Color-codes job tiles based on the number of competing proposals (Less than 5, 5–10, 10–15, 15–20, 20–50, and others).
- **Configurable Settings** — All colors and country lists are user-configurable via the extension popup.

## Files

| File | Purpose |
|------|---------|
| `manifest.json` | Extension manifest (Manifest V2, Firefox + Chrome) |
| `content.js` | Core logic injected into Upwork job-feed pages |
| `background.js` | Background service worker (browser compat shim) |
| `configuration_panel.html` | Popup UI |
| `configuration_panel.css` | Popup styles |
| `configuration_panel.js` | Saves/restores settings via `browser.storage.sync` |
| `context_menu_helper.js` | Helper for context-menu actions (future use) |
| `icons/` | Extension icons (48×48, 72×72, 96×96, 144×144, 192×192) |

## Installation

### Firefox (Temporary / Dev)

1. Go to `about:debugging` → **This Firefox** → **Load Temporary Add-on**
2. Select `manifest.json` from this folder.

### Firefox (AMO)

Install from [addons.mozilla.org](https://addons.mozilla.org) once published.

### Chrome / Edge (Unpacked)

1. Go to `chrome://extensions/` → enable **Developer mode**
2. Click **Load unpacked** and select this folder.

## Configuration

Click the extension icon in the toolbar to open the settings popup:

- **Blocked Countries** — Comma-separated list. Matching tiles get a dimmed border and 🚫 badge.
- **Blocked Countries Color** — CSS color for the blocked border.
- **Highlight Countries** — Comma-separated list. Matching tiles get a glowing border and ⭐ badge.
- **Highlight Countries Color** — CSS color for the highlight glow.
- **Proposal Colors** — Individual CSS colors for each proposals range (Less than 5 / 5–10 / 10–15 / 15–20 / 20–50 / others).

Settings are saved to `browser.storage.sync` and synced across devices.

## Bid Score Calculation

| Signal | Max Points |
|--------|-----------|
| Proposals count | 25 |
| Client country | 15 |
| Payment verification | 25 |
| Total amount spent | 20 |
| Client rating | 15 |

The percentage is `(earned / available) × 100`, where "available" only counts signals that were actually found on the tile.

| Score | Label |
|-------|-------|
| ≥ 80% | 🔥 Must bid |
| ≥ 60% | 👍 Good odds |
| ≥ 40% | 🤔 Consider |
| ≥ 20% | ⚠️ Risky |
| < 20% | 🏃 Run away |

## Permissions

| Permission | Reason |
|-----------|--------|
| `storage` | Persist user configuration |
| `activeTab` | Access the active Upwork tab |
| `contextMenus` | Future context-menu actions |

## Browser Compatibility

- Firefox ≥ 98 (primary target, tested via AMO)
- Chrome / Edge ≥ 88 (via `chrome.*` shim)

## Known Validation Issues Fixed

- **Unsafe assignment to `innerHTML`** — Replaced with safe DOM methods (`createElement`, `textContent`, `style`) to prevent potential XSS and pass AMO linting.

## License

MIT — see [LICENSE](LICENSE) if present, otherwise free to use and modify.

## Author

**Md. Khairul Hasan** — [axiom.org.bd](https://axiom.org.bd)
