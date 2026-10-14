#!/usr/bin/env python3
"""Builds the Ophi site from src/ into the published folders.

  python3 build.py

- assets/ophi.css   = src/ophi.base.css + src/site.css
- assets/ophi.js    = src/ophi.base.js
- index.html, readings/, this-season/  = src/pages/*.html with the shared partials filled in
- chart/index.html  gets the shared menu script added (the chart itself is built from the chart source zip)

Cloudflare serves the output as-is; there is no build step on their side, so run this before every commit.
"""
import os, re

ROOT = os.path.dirname(os.path.abspath(__file__))
def rd(p): return open(os.path.join(ROOT, p), encoding='utf-8').read()
def wr(p, s):
    p = os.path.join(ROOT, p); os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, 'w', encoding='utf-8').write(s)

PAGES = {
    # out path            source page           <title>                         description
    'index.html':             ('home.html',        'Ophi by Bri | Awakening Astrology',
                               'Applied astrology readings by Bri Godard. Meet yourself through your natal chart.'),
    'readings/index.html':    ('readings.html',    'Readings | Ophi by Bri',
                               'Meet Yourself, Quickie and Here To Help: one-on-one virtual astrology readings with Bri Godard.'),
    'this-season/index.html': ('this-season.html', 'This Season | Ophi by Bri',
                               'The current astrological weather and how it lands for each rising sign, by Bri Godard.'),
}

HEAD = '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="icon" type="image/png" href="/assets/favicon.png">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<link rel="preload" href="/assets/fonts/modern-romance.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/kin668.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/moms-typewriter.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,600&family=Special+Elite&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/ophi.css?v={v}">
<script src="/assets/menu.js?v={v}" defer></script>
</head>
<body>
'''
TAIL = '''<script src="/assets/ophi.js?v={v}"></script>
</body>
</html>
'''

def main():
    css = rd('src/ophi.base.css') + rd('src/site.css')
    js = rd('src/ophi.base.js')
    menu = rd('assets/menu.js')
    import hashlib
    v = hashlib.sha1((css + js + menu).encode()).hexdigest()[:8]   # cache-buster: changes whenever the shared files do
    wr('assets/ophi.css', css)
    wr('assets/ophi.js', js)
    parts = {k: rd('src/partials/%s.html' % k) for k in ('top', 'nav', 'footer')}
    for out, (src, title, desc) in PAGES.items():
        body = rd('src/pages/' + src)
        for k, val in parts.items(): body = body.replace('{{%s}}' % k, val)
        assert '{{' not in body, (src, re.findall(r'\{\{\w+\}\}', body))
        wr(out, HEAD.format(title=title, desc=desc, v=v) + body + TAIL.format(v=v))
    # chart page: add the shared menu once
    ch = rd('chart/index.html')
    ch = re.sub(r'<script src="/assets/menu\.js[^"]*" defer></script>\n?', '', ch)
    ch = ch.replace('</head>', '<link rel="icon" type="image/png" href="/assets/favicon.png">\n<script src="/assets/menu.js?v=%s" defer></script>\n</head>' % v, 1) \
        if '/assets/favicon.png' not in ch else ch.replace('</head>', '<script src="/assets/menu.js?v=%s" defer></script>\n</head>' % v, 1)
    wr('chart/index.html', ch)
    print('built', ', '.join(PAGES), '+ chart menu; version', v)

if __name__ == '__main__':
    main()
