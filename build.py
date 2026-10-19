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
                               'Awakening Astrology: readings by Bri Godard. Meet yourself through your natal chart.'),
    'readings/index.html':    ('readings.html',    'Make It Make Sense | Ophi by Bri',
                               'Meet Yourself, Quickie and Here To Help: one-on-one virtual astrology readings with Bri Godard.'),
    'this-season/index.html': ('this-season.html', 'This Season | Ophi by Bri',
                               'The current astrological weather and how it lands for each rising sign, by Bri Godard.'),
    'rituals/index.html':     ('rituals.html',     'Burn Rituals | Ophi by Bri',
                               'The burn ritual for each Ophi pocket candle: Fire, Earth, Air and Water Moons.'),
    'candles/index.html':     ('candles.html',     'Candles & Rituals | Ophi by Bri',
                               'Hand-poured pocket candles for every Moon element, each with its own ritual.'),
}

# Shelved pages: kept in src/ exactly as designed, but not published or linked anywhere.
# To bring one back, take it out of this set and run the build: its page, menu entry, footer link,
# Home tour line and door card all return. Links to it are wrapped in <!--SHELF:name--> ... <!--/SHELF:name-->.
SHELVED = {'candles'}

# Extra body classes for pages with their own mood. /rituals/ is the secret page behind the candle QR codes.
BODY_EXTRA = {'rituals/index.html': ' secret'}

def shelf(html):
    for name in SHELVED:
        html = re.sub(r'<!--SHELF:%s-->.*?<!--/SHELF:%s-->' % (name, name), '', html, flags=re.S)
    return html

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
<script>{fit}</script>
</head>
<body{bodyclass}>
'''
TAIL = '''<script src="/assets/ophi.js?v={v}"></script>
</body>
</html>
'''

# Fluid scale (19 Oct): above DESIGN_W the whole page grows with the window, like a printed page held closer.
# The page is laid out at DESIGN_W and zoomed to fit, so type, graphics and spacing keep their proportions.
# Viewport units would be zoomed twice, so the build rewrites them to --vw / --vh, which this script keeps
# equal to one real 1vw / 1vh. Phones and tablets (up to DESIGN_W) are untouched.
DESIGN_W, MAX_ZOOM = 1280, 2
FIT = ("(function(){var d=document.documentElement;function f(){var w=d.clientWidth||innerWidth,"
       "z=w>%d?Math.min(w/%d,%s):1;d.style.setProperty('--z',z);"
       "d.style.setProperty('--vw',innerWidth/z/100+'px');d.style.setProperty('--vh',innerHeight/z/100+'px');"
       "window.OPHI_Z=z}f();addEventListener('resize',f)})();") % (DESIGN_W, DESIGN_W, MAX_ZOOM)

VU = re.compile(r'(?<![\w.#%-])(-?)(\d*\.?\d+)(vw|vh)\b')
def fluid(css):
    """Viewport units -> the zoom-safe custom units, leaving url(...) data alone."""
    parts = re.split(r'(url\([^)]*\))', css)
    return ''.join(x if x.startswith('url(') else VU.sub(lambda m: 'calc(%s%s * var(--%s,1%s))' % (m.group(1), m.group(2), m.group(3), m.group(3)), x)
                   for x in parts)

DOOR_CARDS = [
    ('readings/index.html', '/readings/', 'Make It Make Sense', 'Meet Yourself, Quickie, <em>Here To Help.</em>', 'pick your reading'),
    ('this-season/index.html', '/this-season/', 'This Season', 'The sky right now, <em>by rising sign.</em>', 'read your chapter'),
    ('candles/index.html', '/candles/', 'Candles &amp; Rituals', 'A pocket candle for <em>your Moon.</em>', 'find your element'),
    ('index.html#why', '/#why', 'The story', 'Why <em>Ophiuchus?</em>', 'read the story'),
]
STAR_ARROW = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'

CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>'

def door_folio(href):
    """This Season's door names the month (the page script keeps it current)."""
    return '<b>&#x2726;</b><span data-season-label>This month</span>' if href == '/this-season/' else ''

def door_preview(href):
    """A small preview of what is behind each door."""
    if href == '/readings/':
        items = ['Sun, Moon, Rising and Ascendant ruler', 'Major aspects and chart patterns', 'Digital takeaways to keep for reflection']
        return '<ul class="door-checks">' + ''.join('<li>%s%s</li>' % (CHECK, t) for t in items) + '</ul>'
    if href == '/this-season/':
        # Filled from assets/season-data.js each month (first three sentences of the post); this line shows until a post is ready.
        return '<p class="door-peek" data-season-preview>The sky right now, read for each rising sign. A new chapter on the 1st of every month.</p>'
    if href == '/#why':
        return '<p class="door-peek">The forgotten, hidden thirteenth constellation of the zodiac, positioned between Scorpio and Sagittarius.</p>'
    if href == '/candles/':
        return '<p class="door-orbs">' + ''.join('<span class="orb-%s">%s</span>' % (e.lower(), e) for e in ('Fire', 'Earth', 'Air', 'Water')) + '</p>'
    return ''

# The two panning banners under "See your sky" (Bri, 19 Oct): one slides left, one slides right, with paper showing
# between them. Each is one big link. (They replace the two door cards.)
PANS = [
    ('/readings/#readings', 'ink', 'Make It Make <em>Sense</em>', 'Time to Meet Yourself'),
    ('/this-season/', 'paper', 'This <em>Season</em>', "What's in the sky right now?"),
]
# On its own page a banner is swapped for the Home banner (same colour, same direction).
HOME_PAN = ('/', 'Awakening <em>Astrology</em>', 'you are written in the stars')
PAN_PAGE = {'readings/index.html': '/readings/', 'this-season/index.html': '/this-season/'}

def pan(href, tone, title, hand, direction):
    unit = ('<span class="pan-i"><span class="pan-t">%s</span><span class="pan-dash">&mdash;</span>'
            '<span class="pan-h">%s</span><b class="pan-star">&#x2726;</b></span>') % (title, hand)
    run = unit * 6
    label = re.sub(r'<[^>]+>', '', title).replace('&amp;', '&') + ': ' + hand
    return ('  <a class="pan pan-%s pan-%s" href="%s" aria-label="%s">\n'
            '    <span class="pan-track" aria-hidden="true"><span class="pan-run">%s</span><span class="pan-run">%s</span></span>\n'
            '  </a>') % (tone, direction, href, label.replace('"', '&quot;'), run, run)

def doors(out):
    """The closing band on every page: 'See your sky' (cast a chart), then two panning banners to Readings and This Season."""
    html = ['<section class="hero night" id="cast">',
            '  <canvas class="stars" aria-hidden="true"></canvas>',
            '  <div class="night-inner">',
            '    <p class="folio">Free<b>&#x2726;</b>Whole sign houses<b>&#x2726;</b>Takes a minute</p>',
            '    <h2 class="flow-h">See your sky.</h2>',
            '    <p class="night-sub">Cast your natal chart. Tap any planet to see how the different parts of you get along.</p>',
            '    <a class="cta" href="/chart/">Cast my chart ' + STAR_ARROW + '</a>',
            '  </div>', '</section>', '',
            '<section class="pans" aria-label="More from Ophi">',
            '  <img class="pan-art pa-fly" src="/assets/eph/lace-butterfly-ink.webp" alt="" aria-hidden="true" loading="lazy" decoding="async">',
            '  <img class="pan-art pa-armillary" src="/assets/stamps/armillary.webp" alt="" aria-hidden="true" loading="lazy" decoding="async">',
            '  <img class="pan-art pa-glitter" src="/assets/journal/sparkle-cross.webp" alt="" aria-hidden="true" loading="lazy" decoding="async">']
    for k, (href, tone, title, hand) in enumerate(PANS):
        if PAN_PAGE.get(out) and href.startswith(PAN_PAGE[out]):
            href, title, hand = HOME_PAN
        html.append(pan(href, tone, title, hand, 'left' if k == 0 else 'right'))
    html.append('</section>')
    return '\n'.join(html)

def main():
    css = fluid(rd('src/ophi.base.css') + rd('src/site.css') + rd('src/soft.css') + rd('src/flow.css'))
    js = rd('src/ophi.base.js')
    menu = rd('assets/menu.js')
    menu = re.sub(r"var SHELVED = \[[^\]]*\];", 'var SHELVED = [%s];' % ', '.join("'%s'" % n for n in sorted(SHELVED)), menu, count=1)
    wr('assets/menu.js', menu)
    import hashlib
    v = hashlib.sha1((css + js + menu).encode()).hexdigest()[:8]
    sv = hashlib.sha1(rd('assets/season-data.js').encode()).hexdigest()[:8]   # cache-buster: changes whenever the shared files do
    wr('assets/ophi.css', css)
    wr('assets/ophi.js', js)
    parts = {k: rd('src/partials/%s.html' % k) for k in ('top', 'nav', 'footer', 'footer-lite', 'readings')}
    import shutil
    for out, (src, title, desc) in PAGES.items():
        if out.split('/')[0] in SHELVED:   # not published: remove any old copy of the built page
            shutil.rmtree(os.path.join(ROOT, os.path.dirname(out)), ignore_errors=True)
            continue
        body = rd('src/pages/' + src)
        for k, val in parts.items(): body = body.replace('{{%s}}' % k, val)
        body = body.replace('{{doors}}', doors(out))
        body = shelf(body)
        # the season file changes every month: give it its own version so browsers never keep an old reading
        body = re.sub(r'/assets/season-data\.js(\?v=\w+)?', '/assets/season-data.js?v=' + sv, body)
        assert '{{' not in body, (src, re.findall(r'\{\{\w+\}\}', body))
        bc = ' class="flow%s"' % BODY_EXTRA.get(out, '')
        body = re.sub(r'style="[^"]*"', lambda m: fluid(m.group(0)), body)
        wr(out, HEAD.format(title=title, desc=desc, v=v, bodyclass=bc, fit=FIT) + body + TAIL.format(v=v))
    # chart page: add the shared menu once
    ch = rd('chart/index.html')
    ch = re.sub(r'<script src="/assets/menu\.js[^"]*" defer></script>\n?', '', ch)
    ch = re.sub(r'<script src="/assets/trail\.js[^"]*" defer></script>\n?', '', ch)
    ch = re.sub(r'<script src="/assets/chart-music\.js[^"]*" defer></script>\n?', '', ch)
    ch = ch.replace('</head>', '<script src="/assets/chart-music.js?v=%s" defer></script>\n</head>' % hashlib.sha1(rd('assets/chart-music.js').encode()).hexdigest()[:8], 1)
    ch = ch.replace('</head>', '<script src="/assets/trail.js?v=%s" defer></script>\n</head>' % v, 1)
    ch = re.sub(r'<link rel="stylesheet" href="/assets/chart-fixes\.css[^"]*">\n?', '', ch)
    ch = ch.replace('</head>', '<link rel="stylesheet" href="/assets/chart-fixes.css?v=%s">\n</head>' % v, 1)
    ch = ch.replace('</head>', '<link rel="icon" type="image/png" href="/assets/favicon.png">\n<script src="/assets/menu.js?v=%s" defer></script>\n</head>' % v, 1) \
        if '/assets/favicon.png' not in ch else ch.replace('</head>', '<script src="/assets/menu.js?v=%s" defer></script>\n</head>' % v, 1)
    wr('chart/index.html', ch)
    print('built', ', '.join(o for o in PAGES if o.split('/')[0] not in SHELVED), '+ chart menu; shelved:', ', '.join(sorted(SHELVED)) or 'none', '; version', v)

if __name__ == '__main__':
    main()
