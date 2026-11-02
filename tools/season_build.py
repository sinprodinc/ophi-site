"""This Season, rendered into the page HTML at build time (2 Nov 2026).

Search engines and link previews read the page before any script runs, so the month's reading has to be in the
HTML itself. build.py calls render() for /this-season/ (the current month, Pacific time) and for every finished
month's permanent page (/this-season/yyyy/mm/). The page script still runs afterwards (month arrows, ?m=,
notepad fitting, the graphics); it fills the same places with the same text, so nothing changes for visitors.

The words come from assets/season-data.js, read with Node (it is a JavaScript file). If Node isn't available
the build still works and the page falls back to filling itself in the browser, as before.
"""
import html, json, os, re, subprocess
from datetime import datetime
try:
    from zoneinfo import ZoneInfo
except ImportError:  # very old Python
    ZoneInfo = None

# The twelve rising signs: element, glyph, archetype, standing tagline (shown when a month has no teaser).
SIGNS = [
    ('aries', 'fire', '&#x2648;&#xFE0E;', 'The Initiator', 'First in, asks questions later'),
    ('taurus', 'earth', '&#x2649;&#xFE0E;', 'The Stabilizer', 'Slow to start, impossible to move'),
    ('gemini', 'air', '&#x264A;&#xFE0E;', 'The Communicator', 'Two tabs open, always'),
    ('cancer', 'water', '&#x264B;&#xFE0E;', 'The Homemaker', 'Soft shell, long memory'),
    ('leo', 'fire', '&#x264C;&#xFE0E;', 'The Performer', 'Walks in like the lights came on'),
    ('virgo', 'earth', '&#x264D;&#xFE0E;', 'The Refiner', 'Notices the typo, fixes it quietly'),
    ('libra', 'air', '&#x264E;&#xFE0E;', 'The Harmonizer', 'Charming on arrival'),
    ('scorpio', 'water', '&#x264F;&#xFE0E;', 'The Deep Diver', 'Reads the room before you speak'),
    ('sagittarius', 'fire', '&#x2650;&#xFE0E;', 'The Explorer', 'Passport in the back pocket'),
    ('capricorn', 'earth', '&#x2651;&#xFE0E;', 'The Accomplisher', 'Old soul, five-year plan'),
    ('aquarius', 'air', '&#x2652;&#xFE0E;', 'The Change Maker', 'Friendly, slightly from the future'),
    ('pisces', 'water', '&#x2653;&#xFE0E;', 'The Dreamer', 'Half here, half dreaming'),
]

# Bri's notepads: image w, h, writing area x, y, w, h (%), note number, first ruled line y %, spacing %, tilt.
# Same table as NB in src/ophi.base.js; keep the two in step.
NB = [[689, 717, 16, 33, 66, 36, 1, 0, 0, 0], [685, 642, 28, 32, 52, 44, 2, 34.0, 6.91, 0], [666, 637, 18, 35, 68, 33, 3, 33.4, 3.914, 0],
      [760, 708, 15, 27, 53, 52, 4, 0, 0, 0], [865, 795, 28, 26, 50, 50, 5, 28.95, 5.2, -1.93], [670, 900, 22, 37, 57, 49, 6, 0, 0, 0],
      [731, 724, 29, 31, 56, 54, 7, 35.67, 4.66, 0.95], [656, 753, 24, 24, 66, 40, 8, 28.6, 5.67, 0], [843, 900, 14, 34, 64, 44, 9, 0, 0, 0],
      [900, 890, 15, 34, 60, 44, 10, 0, 0, 0], [900, 791, 23, 12, 70, 64, 15, 13.6, 6.47, 0], [900, 684, 27, 36, 54, 46, 12, 31.41, 5.25, -1.1]]

MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']


def load(root):
    """season-data.js as a Python dict, or None when Node isn't available."""
    js = ("global.window={};require(%s);process.stdout.write(JSON.stringify(window.OPHI_SEASON))"
          % json.dumps(os.path.join(root, 'assets', 'season-data.js')))
    try:
        out = subprocess.run(['node', '-e', js], capture_output=True, text=True, check=True, timeout=60).stdout
        return json.loads(out)
    except Exception as e:  # noqa: BLE001
        print('season: could not read season-data.js with Node (%s); This Season fills itself in the browser' % e)
        return None


def this_month():
    now = datetime.now(ZoneInfo('America/Vancouver')) if ZoneInfo else datetime.utcnow()
    return '%04d-%02d' % (now.year, now.month)


def ready(D, k):
    return bool((D[k].get('post') or {}).get('ready'))


def home_key(D, ym=None):
    """The newest finished month that has started (same rule as the page script)."""
    ym = ym or this_month()
    keys = sorted(D)
    k = None
    for x in keys:
        if x <= ym and ready(D, x):
            k = x
    return k or keys[0]


def archive_keys(D, ym=None):
    """Every finished month up to now: each gets a permanent page."""
    ym = ym or this_month()
    return [k for k in sorted(D) if k <= ym and ready(D, k)]


def url(k, home=None):
    return '/this-season/' if k == home else '/this-season/%s/%s/' % (k[:4], k[5:7])


# ---- text helpers (the same rules as the page script) ----
def esc(t):
    return html.escape(str(t if t is not None else ''), quote=True)


def rich(t):
    return re.sub(r'\*([^*]+)\*', r'<em>\1</em>', esc(t))


def plain(t):
    return re.sub(r'\s+', ' ', str(t or '').replace('*', '')).strip()


def paras(t, key, art, side):
    out = []
    for x in re.split(r'\n\s*\n', str(t or '')):
        x = x.strip()
        if not x:
            continue
        g = re.match(r'^\[\[([\w-]+)\]\]$', x)
        if g:
            side[0] += 1
            a = art.get(g.group(1)) or {}
            out.append('<figure class="ts-art ts-art-%s%s ts-inart">%s</figure>' % (
                'r' if side[0] % 2 else 'l', ' ts-art-wide' if a.get('wide') else '', img(key, g.group(1), '', art)))
        elif x.startswith('## '):
            out.append('<h4 class="sub-h">%s</h4>' % rich(x[3:]))
        elif x.startswith('~ '):
            out.append('<p class="ts-pen">%s</p>' % rich(x[2:]))
        else:
            out.append('<p>%s</p>' % rich(x))
    return ''.join(out)


def img(key, name, cls, art):
    a = art.get(name) or {}
    alt = a.get('alt') or ''
    return '<img class="%s" src="/assets/season/%s/%s.webp" alt="%s"%s loading="lazy" decoding="async">' % (
        cls, key, name, esc(alt), '' if alt else ' aria-hidden="true"')


def note_html(note, nb):
    nn = '%02d' % nb[6]
    return ('<div class="ts-note" style="aspect-ratio:%s/%s;background-image:url(/assets/notes/note-%s.webp)">'
            '<div class="ts-note-in%s" data-box="%s" data-rule="%s" style="left:%s%%;top:%s%%;width:%s%%;height:%s%%">'
            '<span class="k">Remember</span><p class="note">%s</p></div></div>') % (
        nb[0], nb[1], nn, ' ruled' if nb[7] else '', ' '.join(str(v) for v in nb[2:6]),
        ' '.join(str(v) for v in nb[7:10]), nb[2], nb[3], nb[4], nb[5], rich(note))


def note_for(signs):
    """Each month the longest notes get the roomiest notepads (same rule as the page script)."""
    def cap(n):
        W = 420; H = W * n[1] / n[0]; bw = W * n[4] / 100; bh = H * n[5] / 100; sp = n[8] / 100 * H; fs = 16
        if n[7]:
            if sp < 18 and sp * 2 * .92 >= fs:
                sp *= 2
            lines = max(1, int(bh // sp) - 1)
        else:
            lines = int((bh - 20) // (fs * 1.18))
        return lines * bw / (fs * .42)
    want = sorted([s for s in signs if (signs[s] or {}).get('note')], key=lambda s: -len(str(signs[s]['note'])))
    notes = sorted(NB, key=lambda n: -cap(n))
    return {s: notes[i % len(notes)] for i, s in enumerate(want)}


# ---- the twelve rising readings, editorial layout (Bri, 2 Nov 2026) ----
def rising(D, key):
    M = D[key] if D else {}
    signs = M.get('signs') or {}
    label = M.get('label') or ''
    nf = note_for(signs)
    cards = []
    for s, el, gl, arch, tag in SIGNS:
        c = signs.get(s) or {}
        name = s.capitalize()
        teaser = c.get('teaser') or tag
        if c.get('ready'):
            meta = '%s &#x2726; %s' % (esc(label), esc(c.get('house') or name + ' Rising'))
            head = rich(c.get('title') or '')
            body = paras(c.get('body'), key, {}, [0])
            note = note_html(c['note'], nf[s]) if c.get('note') else ''
            tries = '' if note else ''.join('<li>%s</li>' % esc(t) for t in (c.get('tries') or []))
            aside_cls = ' class="has-note"' if note else ''
            aside_in = note or ('<span class="k">Try this month</span><ul>%s</ul>' % tries if tries else '')
        else:
            meta = '%s &#x2726; %s Rising' % (esc(label), name)
            head = 'Your chapter is <em>being written.</em>'
            body = '<p>The %s Rising chapter for this month is being written.</p>' % name
            aside_cls, aside_in = '', ''
        cards.append(
            '<article class="ed-sign %(el)s" id="%(s)s" data-sign="%(s)s">\n'
            '  <span class="ed-old" id="%(s)s-rising" aria-hidden="true"></span>\n'
            '  <p class="ed-k"><span class="ed-gl" aria-hidden="true">%(gl)s</span>%(El)s<b aria-hidden="true">&#x2726;</b>%(arch)s</p>\n'
            '  <h3 class="ed-h"><button type="button" class="ed-btn" aria-expanded="false" aria-controls="%(s)s-chapter">%(Name)s Rising</button></h3>\n'
            '  <p class="ed-deck tagline">%(teaser)s</p>\n'
            '  <p class="ed-more" aria-hidden="true"><span class="ed-more-o">Read your chapter</span><span class="ed-more-c">Close</span><i>+</i></p>\n'
            '</article>\n'
            '<section class="ed-ch chapter" id="%(s)s-chapter" data-for="%(s)s" aria-label="%(Name)s Rising this month">\n'
            '  <div class="ed-ch-main"><span class="meta" data-month>%(meta)s</span><h4>%(head)s</h4><div class="ed-cols">%(body)s</div></div>\n'
            '  <aside%(aside_cls)s>%(aside_in)s<button type="button" class="close">Close</button></aside>\n'
            '</section>' % dict(el=el, s=s, gl=gl, El=el.capitalize(), arch=arch, Name=name, teaser=rich(teaser),
                                meta=meta, head=head, body=body, aside_cls=aside_cls, aside_in=aside_in))
    index = ''.join('<a href="#%s">%s</a>' % (s, s.capitalize()) for s, *_ in SIGNS)
    return ('<nav class="ed-index" aria-label="Find your sign"><span class="ed-index-k">Find your sign</span>%s</nav>\n'
            '<div class="ed-grid">\n%s\n</div>') % (index, '\n'.join(cards))


# ---- the front and the paper ----
def fill(page, D, key, home, open_keys):
    """Put month `key` into the This Season page template."""
    if not D:
        return re.sub(r'\{\{ts-[\w-]+\}\}', '', page.replace('{{ts-rising}}', rising({'x': {}}, 'x')))
    M = D[key]
    P = M.get('post') or {}
    art = P.get('art') or {}
    lab = M.get('label') or ''
    mo = re.sub(r'\s*\d{4}\s*$', '', lab)
    yr = (re.findall(r'\d{4}', lab) or [''])[0]
    rep = {'ts-month': esc(mo), 'ts-year': esc(yr), 'ts-key': key,
           'ts-tag': 'In the sky right now' if key == home else ('Looking back' if key < home else 'Coming up'),
           'ts-theme-k': "This month's theme" if key == home else ("That month's theme" if key < home else 'The month ahead'),
           'ts-rising': rising(D, key)}
    # month arrows: real links to the permanent pages
    i = open_keys.index(key) if key in open_keys else -1
    for sel, j, word in (('prev', i - 1, 'Previous month'), ('next', i + 1, 'Next month')):
        if i >= 0 and 0 <= j < len(open_keys):
            k = open_keys[j]
            rep['ts-%s-attr' % sel] = 'href="%s#now" aria-label="%s: %s"' % (url(k, home), word, esc(D[k].get('label')))
            rep['ts-%s-l' % sel] = esc(re.sub(r'\s*\d{4}\s*$', '', D[k].get('label') or ''))
        else:
            rep['ts-%s-attr' % sel] = 'hidden href="#"'
            rep['ts-%s-l' % sel] = ''
    if P.get('ready'):
        rep['ts-theme'] = rich(P.get('title'))
        rep['ts-sum'] = rich(P.get('summary') or P.get('takeaway') or '')
        rep['ts-jump-attr'] = ''
        secs, cur = [], None
        for x in re.split(r'\n\s*\n', str(P.get('body') or '')):
            h = re.match(r'^## (.+)$', x.strip())
            if h:
                cur = {'h': h.group(1), 't': []}; secs.append(cur)
            else:
                if cur is None:
                    cur = {'h': '', 't': []}; secs.append(cur)
                cur['t'].append(x)
        side = [0]
        if secs:
            lead = secs[0]
            rep['ts-paper-attr'] = ''
            rep['ts-lead-k'] = esc(lead['h'].replace('*', '')) if lead['h'] else 'The full story'
            rep['ts-lead-h'] = rich(P.get('title'))
            rep['ts-lead-body'] = paras('\n\n'.join(lead['t']), key, art, side)
            more = []
            for sc in secs[1:]:
                first = re.match(r'^\[\[([\w-]+)\]\]$', str(sc['t'][0] if sc['t'] else '').strip())
                rest = sc['t'][1:] if first else sc['t']
                more.append('<article class="np-story ts-sec%s">%s<div class="ts-sec-in"><h3 class="np-h">%s</h3><div class="np-cols ts-body">%s</div></div></article>' % (
                    ' has-fig' if first else '', ('<figure class="ts-fig ts-inart">%s</figure>' % img(key, first.group(1), '', art)) if first else '',
                    rich(sc['h']), paras('\n\n'.join(rest), key, art, side)))
            rep['ts-more'] = ''.join(more)
            dates = P.get('dates') or []
            if dates:
                li = []
                for d in dates:
                    m2 = re.match(r'^(\D*?)\s*(\d+(?:\s*[–-]\s*\d+)?)$', str(d.get('date')))
                    a, b = (m2.group(1), m2.group(2)) if m2 else ('', d.get('date'))
                    li.append('<li><span class="ts-d"><b>%s</b><i>%s</i></span><span class="ts-dt">%s</span></li>' % (esc(b), esc(a), rich(d.get('text'))))
                rep['ts-dates'] = '<ol class="ts-datelist" data-ts-dates>%s</ol>' % ''.join(li)
            else:
                rep['ts-dates'] = '<p>%s</p>' % rich(P.get('when') or '')
            rep['ts-what'] = rich(P.get('what') or '')
            rep['ts-side-art'] = img(key, P['side'], 'ts-inart', art) if P.get('side') else ''
            C = M.get('closing') or {}
            if C.get('body'):
                rep['ts-close-attr'] = ''
                rep['ts-close-k'] = rich(C.get('title') or '')
                rep['ts-close-b'] = paras(C['body'], key, art, side)
            # Bri, 2 Nov: byline at the foot of the main article, in Modern Romance
            rep['ts-byline'] = '<p class="ts-byline">By Bri Godard<b aria-hidden="true">&#x2726;</b><time datetime="%s-01">%s 1, %s</time></p>' % (key, esc(mo), esc(yr))
    defaults = {'ts-theme': "This month's reading is <em>on its way.</em>", 'ts-sum': 'Find your rising sign below for your own chapter.',
                'ts-jump-attr': 'hidden', 'ts-paper-attr': 'hidden', 'ts-lead-k': 'The full story', 'ts-dates': '<ol class="ts-datelist" data-ts-dates></ol>',
                'ts-close-attr': 'hidden'}
    for k, v in defaults.items():
        rep.setdefault(k, v)
    page = re.sub(r'\{\{(ts-[\w-]+)\}\}', lambda m: rep.get(m.group(1), ''), page)
    return page


def meta(D, key, home):
    """Title, description and Article data for a month's page."""
    M = D[key]; P = M.get('post') or {}
    lab = M.get('label') or ''
    title = '%s Forecast by Rising Sign | Ophi by Bri' % lab
    desc = plain(P.get('summary') or P.get('takeaway') or '')
    if len(desc) > 158:
        desc = desc[:155].rsplit(' ', 1)[0] + '...'
    if not desc:
        desc = 'The sky for %s, read for each rising sign by astrologer Bri Godard.' % lab
    return title, desc
