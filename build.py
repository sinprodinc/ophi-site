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

SITE = 'https://ophibybri.com'
PAGES = {
    # out path            source page           <title> (about 50-60 characters)               description (about 140-160)
    # Bri, 2 Nov 2026: titles and descriptions written for search results and link previews.
    'index.html':             ('home.html',        'Ophi by Bri | Awakening Astrology with Bri Godard',
                               'Awakening Astrology by Bri Godard: one-on-one natal chart readings, a free birth chart calculator and a monthly forecast for every rising sign.'),
    'readings/index.html':    ('readings.html',    'What Is a Natal Chart? Astrology Explained | Ophi by Bri',
                               'New to astrology? A plain-language guide to your natal chart, your Sun, Moon and Rising, and how a reading with Bri Godard can help you see yourself.'),
    'book/index.html':        ('book.html',        'Book an Astrology Reading with Bri Godard | Ophi by Bri',
                               'One-on-one virtual natal chart readings with Bri Godard. Choose your reading, pick a time in your own time zone and pay securely online.'),
    'this-season/index.html': ('this-season.html', 'This Season | Ophi by Bri',    # filled in per month by tools/season_build.py
                               'The sky this month, read for each rising sign by astrologer Bri Godard.'),
    'rituals/index.html':     ('rituals.html',     'Burn Rituals | Ophi by Bri',
                               'The burn ritual for each Ophi pocket candle: Fire, Earth, Air and Water Moons.'),
    'candles/index.html':     ('candles.html',     'Moon Candles | Ophi by Bri',
                               'Hand-poured pocket candles for every Moon element: Fire, Earth, Air and Water. Ships within Canada.'),
    'privacy/index.html':     ('privacy.html',     'Privacy Policy | Ophi by Bri',
                               'How Ophi by Bri collects, uses and protects your personal information, including birth details, bookings, session recordings and email.'),
    '404.html':               ('404.html',         'Page Not Found | Ophi by Bri',
                               'This page has moved or never existed. Find This Season, your free birth chart or a reading instead.'),
}

# Pages kept out of search: the secret rituals page (reached only by the candle QR codes) and the 404 page.
NOINDEX = {'rituals/index.html', '404.html'}
# Pages listed in sitemap.xml (the This Season archive pages are added by the build).
OG_IMAGE = '/assets/og/ophi-share.jpg'   # 1200x630 link preview (tools/og_image.js)
SITEMAP = ['index.html', 'readings/index.html', 'book/index.html', 'this-season/index.html', 'chart/index.html', 'privacy/index.html']

# Shelved pages: kept in src/ exactly as designed, but not published or linked anywhere.
# To bring one back, take it out of this set and run the build: its page, menu entry, footer link,
# Home tour line and door card all return. Links to it are wrapped in <!--SHELF:name--> ... <!--/SHELF:name-->.
SHELVED = {'candles'}   # Moon Candles shop on hold (Bri, 27 Oct 2026, 12:48): built and kept in src/, not published. Remove to bring it back.

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
{robots}<link rel="canonical" href="{canon}">
<meta property="og:site_name" content="Ophi by Bri">
<meta property="og:type" content="{ogtype}">
<meta property="og:title" content="{ogtitle}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{canon}">
<meta property="og:image" content="{ogimg}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Ophi by Bri, Awakening Astrology">
<meta property="og:locale" content="en_CA">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{ogtitle}">
<meta name="twitter:description" content="{desc}">
<meta name="twitter:image" content="{ogimg}">
{ld}<link rel="icon" type="image/png" href="/assets/favicon.png">
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
       "window.OPHI_Z=z;K=0}"
       # OPHI_BOX(el): an element's box in real screen pixels in every browser. Under CSS zoom Chrome reports boxes
       # in screen pixels but Safari reports them in the page's own (unzoomed) units; mouse positions are always
       # screen pixels. A hidden 100px probe tells us which, once per window size.
       "var K=0;function k(){if(K)return K;var z=window.OPHI_Z||1;if(z==1||!document.body)return 1;"
       "var p=document.getElementById('ophi-probe');if(!p){p=document.createElement('div');p.id='ophi-probe';"
       "p.style.cssText='position:absolute;left:0;top:0;width:100px;height:1px;visibility:hidden;pointer-events:none';"
       "document.body.appendChild(p)}var w=p.getBoundingClientRect().width;K=w?z/(w/100):1;return K}"
       "window.OPHI_BOX=function(el){var r=el.getBoundingClientRect(),s=k();if(s>.99&&s<1.01)return r;"
       "return{left:r.left*s,top:r.top*s,right:r.right*s,bottom:r.bottom*s,width:r.width*s,height:r.height*s,x:r.left*s,y:r.top*s}};"
       "f();addEventListener('resize',f)})();") % (DESIGN_W, DESIGN_W, MAX_ZOOM)

VU = re.compile(r'(?<![\w.#%-])(-?)(\d*\.?\d+)(vw|vh)\b')
def fluid(css):
    """Viewport units -> the zoom-safe custom units, leaving url(...) data alone."""
    parts = re.split(r'(url\([^)]*\))', css)
    return ''.join(x if x.startswith('url(') else VU.sub(lambda m: 'calc(%s%s * var(--%s,1%s))' % (m.group(1), m.group(2), m.group(3), m.group(3)), x)
                   for x in parts)

DOOR_CARDS = [
    ('readings/index.html', '/readings/', 'Make It Make Sense', 'Meet Yourself, Quickie, <em>Growth &amp; Redirection.</em>', 'pick your reading'),
    ('this-season/index.html', '/this-season/', 'This Season', 'The sky right now, <em>by rising sign.</em>', 'read your chapter'),
    ('candles/index.html', '/candles/', 'Moon Candles', 'A pocket candle for <em>your Moon.</em>', 'shop your element'),
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
# The two panning banners under "See your sky" (Bri, 19 Oct): one slides left, one slides right. Each is one big link.
# Bri, 28 Oct: a banner never points to the page it sits on. Each page shows the first two of this list that aren't
# itself, so the Book banner says "Book a Reading" (it used to say Make It Make Sense while linking to /book/).
PANS = [
    ('/book/', 'Book a <em>Reading</em>', 'Time to Meet Yourself'),
    ('/this-season/', 'This <em>Season</em>', "What's in the sky right now?"),
    ('/readings/', 'Make It Make <em>Sense</em>', 'new to astrology? start here'),
    ('/', 'Awakening <em>Astrology</em>', 'you are written in the stars'),
]
PAGE_URL = {'index.html': '/', 'readings/index.html': '/readings/', 'book/index.html': '/book/',
            'this-season/index.html': '/this-season/', 'candles/index.html': '/candles/'}

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
            # Bri, 29 Oct: nothing on top of this band on any page (no butterfly, no paper star)
            ]
    here = PAGE_URL.get(out)
    picks = [p for p in PANS if p[0] != here][:2]
    for k, (href, title, hand) in enumerate(picks):
        html.append(pan(href, 'ink' if k == 0 else 'paper', title, hand, 'left' if k == 0 else 'right'))
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
    parts = {k: rd('src/partials/%s.html' % k) for k in ('top', 'nav', 'footer-lite', 'readings')}
    import shutil
    import json, sys
    sys.path.insert(0, os.path.join(ROOT, 'tools'))
    import season_build as SB
    from book_content import faq_html, ld_faq, ld_offers, ld_article, ld_crumbs, LD_PERSON, LD_BUSINESS
    D = SB.load(ROOT)
    home = SB.home_key(D) if D else None
    archive = SB.archive_keys(D) if D else []
    # the month arrows reach back six months and ahead as far as Bri has written (same rule as the page script)
    def addm(k, n):
        y, m = int(k[:4]), int(k[5:7]) - 1 + n
        y += m // 12; m %= 12
        return '%04d-%02d' % (y, m + 1)
    open_keys = sorted(k for k in (D or {}) if SB.ready(D, k) and k >= addm(SB.this_month(), -6)) if D else []
    if home and home not in open_keys: open_keys = sorted(open_keys + [home])
    sitemap = list(SITEMAP)

    def page(out, src, title, desc, canon, extra_ld=(), season_key=None, ogtype='website'):
        body = rd('src/pages/' + src)
        for k, val in parts.items(): body = body.replace('{{%s}}' % k, val)
        body = body.replace('{{doors}}', doors('this-season/index.html' if season_key else out))
        if season_key is not None or src == 'this-season.html':
            body = SB.fill(body, D, season_key or home, home, open_keys)
        if src == 'book.html':
            body = body.replace('{{faq}}', faq_html())
        body = shelf(body)
        # the season file changes every month: give it its own version so browsers never keep an old reading
        body = re.sub(r'/assets/season-data\.js(\?v=\w+)?', '/assets/season-data.js?v=' + sv, body)
        assert '{{' not in body, (src, re.findall(r'\{\{[\w-]+\}\}', body))
        bc = ' class="flow%s"' % BODY_EXTRA.get(out, '')
        body = re.sub(r'style="[^"]*"', lambda m: fluid(m.group(0)), body)
        ld = ''.join('<script type="application/ld+json">%s</script>\n' % json.dumps(x, ensure_ascii=False) for x in extra_ld)
        robots = '<meta name="robots" content="noindex">\n' if out in NOINDEX else ''
        ogtitle = title.split(' | ')[0] if title.count(' | ') else title
        wr(out, HEAD.format(title=title, desc=desc, v=v, bodyclass=bc, fit=FIT, robots=robots, canon=canon, ogtype=ogtype,
                            ogtitle=ogtitle.replace('"', '&quot;'), ogimg=SITE + OG_IMAGE, ld=ld) + body + TAIL.format(v=v))

    for out, (src, title, desc) in PAGES.items():
        if out.split('/')[0] in SHELVED:   # not published: remove any old copy of the built page
            shutil.rmtree(os.path.join(ROOT, os.path.dirname(out)), ignore_errors=True)
            continue
        canon = SITE + '/' + (out[:-len('index.html')] if out.endswith('index.html') else out)
        lds, ogtype = [], 'website'
        if out == 'index.html': lds = [LD_PERSON, LD_BUSINESS]
        if out == 'book/index.html': lds = [LD_BUSINESS] + ld_offers() + [ld_faq()]
        if out == 'this-season/index.html' and D:
            title, desc = SB.meta(D, home, home)
            lds = [ld_article(D, home, canon, desc), ld_crumbs([('This Season', SITE + '/this-season/')])]
            ogtype = 'article'
        page(out, src, title, desc, canon, lds, ogtype=ogtype)

    # This Season: a permanent page for every finished month (/this-season/2026/11/), kept as the archive
    for d in os.listdir(os.path.join(ROOT, 'this-season')):
        if re.match(r'^\d{4}$', d): shutil.rmtree(os.path.join(ROOT, 'this-season', d), ignore_errors=True)
    for k in archive:
        out = 'this-season/%s/%s/index.html' % (k[:4], k[5:7])
        canon = SITE + '/' + out[:-len('index.html')]
        title, desc = SB.meta(D, k, home)
        lab = D[k].get('label')
        page(out, 'this-season.html', title, desc, canon,
             [ld_article(D, k, canon, desc), ld_crumbs([('This Season', SITE + '/this-season/'), (lab, canon)])], season_key=k, ogtype='article')
        sitemap.append(out)

    # sitemap.xml and robots.txt
    locs = []
    for out in sitemap:
        if out.split('/')[0] in SHELVED: continue
        locs.append('  <url><loc>%s/%s</loc></url>' % (SITE, out[:-len('index.html')]))
    wr('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n%s\n</urlset>\n' % '\n'.join(locs))
    wr('robots.txt', 'User-agent: *\nAllow: /\n\nSitemap: %s/sitemap.xml\n' % SITE)
    # chart page: add the shared menu once
    ch = rd('chart/index.html')
    ch = re.sub(r'<script src="/assets/menu\.js[^"]*" defer></script>\n?', '', ch)
    ch = re.sub(r'<script src="/assets/trail\.js[^"]*" defer></script>\n?', '', ch)
    ch = re.sub(r'<script src="/assets/chart-music\.js[^"]*" defer></script>\n?', '', ch)
    ch = re.sub(r'<script src="/assets/chart-stars\.js[^"]*" defer></script>\n?', '', ch)
    ch = ch.replace('</head>', '<script src="/assets/chart-stars.js?v=%s" defer></script>\n</head>' % hashlib.sha1(rd('assets/chart-stars.js').encode()).hexdigest()[:8], 1)   # Bri, 31 Oct: chrome stars
    ch = ch.replace('</head>', '<script src="/assets/chart-music.js?v=%s" defer></script>\n</head>' % hashlib.sha1(rd('assets/chart-music.js').encode()).hexdigest()[:8], 1)
    ch = ch.replace('</head>', '<script src="/assets/trail.js?v=%s" defer></script>\n</head>' % v, 1)
    ch = re.sub(r'<link rel="stylesheet" href="/assets/chart-fixes\.css[^"]*">\n?', '', ch)
    ch = ch.replace('</head>', '<link rel="stylesheet" href="/assets/chart-fixes.css?v=%s">\n</head>' % hashlib.sha1(rd('assets/chart-fixes.css').encode()).hexdigest()[:8], 1)   # its own hash, so a change to it is never cached
    ch = ch.replace('</head>', '<link rel="icon" type="image/png" href="/assets/favicon.png">\n<script src="/assets/menu.js?v=%s" defer></script>\n</head>' % v, 1) \
        if '/assets/favicon.png' not in ch else ch.replace('</head>', '<script src="/assets/menu.js?v=%s" defer></script>\n</head>' % v, 1)
    # Bri, 2 Nov: the chart page's title, description and link preview (the chart itself is edited directly)
    ct, cd = 'Free Birth Chart Calculator, Whole Sign Houses | Ophi by Bri', \
        'Cast your natal chart free: planets, houses and aspects in whole sign houses, with Ophiuchus. Tap any planet to see how the parts of you get along.'
    ch = re.sub(r'<!--seo-->.*?<!--/seo-->\n?', '', ch, flags=re.S)
    ch = re.sub(r'<title>[^<]*</title>', '<title>%s</title>' % ct, ch, count=1)
    ch = ch.replace('</head>', ('<!--seo--><meta name="description" content="%s">\n<link rel="canonical" href="%s/chart/">\n'
        '<meta property="og:site_name" content="Ophi by Bri"><meta property="og:type" content="website"><meta property="og:title" content="Free Birth Chart Calculator">'
        '<meta property="og:description" content="%s"><meta property="og:url" content="%s/chart/"><meta property="og:image" content="%s%s">'
        '<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image">'
        '<!--/seo-->\n</head>') % (cd, SITE, cd, SITE, SITE, OG_IMAGE), 1)
    wr('chart/index.html', ch)
    print('built', ', '.join(o for o in PAGES if o.split('/')[0] not in SHELVED), '+ chart menu; shelved:', ', '.join(sorted(SHELVED)) or 'none', '; version', v)

if __name__ == '__main__':
    main()
