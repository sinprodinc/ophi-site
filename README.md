# Ophi by Bri — ophibybri.com

Static site, deployed by Cloudflare Pages on every push to `main`. Cloudflare runs no build step: **run `python3 build.py`
before committing** so the published files match `src/`.

| Published path | Built from | What it is |
|---|---|---|
| `/` (`index.html`) | `src/pages/home.html` | Home |
| `/readings/` | `src/pages/readings.html` | The three readings, with Cal.com links |
| `/this-season/` | `src/pages/this-season.html` | Current skies, by rising sign |
| `/chart/` | chart source zip (`dist/ophi-natal-chart.html`) | Public Ophi Natal Chart; `build.py` adds the menu |
| `assets/ophi.css` | `src/ophi.base.css` + `src/site.css` | All site styles (stamps, lace, etc. are inline in it) |
| `assets/ophi.js` | `src/ophi.base.js` | Cursor, scroll reveal, floating stamps, music, testimonial carousel |
| `assets/menu.js` | (edited directly) | Hamburger menu on every page. The page list is at its top |
| `assets/fonts/` | | Modern Romance, KIN668, Mom's Typewriter |
| `assets/ophi-music.mp3` | | Site music, streamed when the Music button is pressed |
| `_headers` | | Pre-launch `noindex`. Remove at launch |

Shared pieces live in `src/partials/` (`top`, `nav`, `footer`). Pages use `{{top}}`, `{{nav}}` and `{{footer}}`.

## Adding a page
1. Add `src/pages/<name>.html`.
2. Register it in `PAGES` in `build.py`.
3. Add it to `PAGES` in `assets/menu.js`.
4. Add it to the footer's "Pages" column in `src/partials/footer.html`.

## Never commit
- The private Chart Studio.
- Client readings, session notes, or reference readings.
- Anything with a client's birth data.
