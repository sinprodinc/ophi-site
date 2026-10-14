# Ophi by Bri — ophibybri.com

Static site, deployed by Cloudflare Pages on every push to `main`. No build step.

| Path | What it is |
|---|---|
| `/` (`index.html`) | Website (single page for now; to be split into Home, Readings, About) |
| `/chart/` | Public Ophi Natal Chart (built from the chart source, `dist/ophi-natal-chart.html`) |
| `/chart/cities-*.txt` | Place list the chart's birthplace search loads |
| `_headers` | Pre-launch `noindex` header; remove at launch |

## Never commit
- The private Chart Studio, client readings, session notes, or reference readings.
- Anything with a client's birth data.

## Cloudflare Pages settings
- Framework preset: None
- Build command: (empty)
- Build output directory: `/`
