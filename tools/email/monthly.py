#!/usr/bin/env python3
"""The monthly rising sign email for Kit (2 Nov 2026).

    python3 tools/email/monthly.py 2026-11            # Kit template + preview for every sign
    python3 tools/email/monthly.py 2026-11 leo        # same, preview opens on Leo

Reads the month from assets/season-data.js (the same words as /this-season/) and writes:
  tools/email/out/monthly-<yyyy-mm>-kit.html      paste into Kit as the broadcast's HTML. One email for the whole
                                                  list: Kit shows each subscriber only their own sign, using the
                                                  rising_sign custom field. "Not sure" (or blank) gets a short
                                                  overview with links to all twelve and the chart.
  tools/email/out/monthly-<yyyy-mm>-<sign>.html   a preview of what one sign's subscriber receives.
  assets/email/season-<yyyy-mm>.png               the month's masthead (rendered from the site fonts, needs a
                                                  local server on :8811 and Playwright; skipped if unavailable).
Kit tags used: {{ subscriber.first_name }}, {{ subscriber.rising_sign }}, {{ unsubscribe_url }}, {{ address }}.
No em dashes in client copy.
"""
import html, os, re, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import season_build as SB

SITE = 'https://ophibybri.com'
MONO = "'Courier New',Courier,monospace"
SERIF = "Georgia,'Times New Roman',serif"
INK, MUTED, PAPER, CARD, CORAL = '#161310', '#413b32', '#eeeae3', '#fffdf8', '#ef5334'


def esc(t):
    return html.escape(str(t or ''), quote=False)


def rich(t):
    return re.sub(r'\*([^*]+)\*', r'<i>\1</i>', esc(t))


def paras(t, size=15):
    out = []
    for i, p in enumerate(x.strip() for x in re.split(r'\n\s*\n', str(t or '')) if x.strip()):
        if p.startswith('[[') or p.startswith('## '):
            continue
        p = rich(p[2:] if p.startswith('~ ') else p)
        if i == 0:   # drop cap, the same as the site
            p = ('<span style="float:left;font-family:%s;font-size:52px;line-height:44px;padding:4px 8px 0 0;color:%s;">%s</span>%s'
                 % (SERIF, INK, p[0], p[1:]))
        out.append('<p style="margin:0 0 14px;font-family:%s;font-size:%dpx;line-height:1.65;color:%s;">%s</p>' % (MONO, size, INK, p))
    return ''.join(out)


def sign_block(D, key, s, el, arch):
    c = (D[key].get('signs') or {}).get(s) or {}
    name = s.capitalize()
    lab = D[key].get('label')
    url = '%s/this-season/%s/%s/#%s' % (SITE, key[:4], key[5:7], s)
    note = ('<table role="presentation" width="100%%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 4px;"><tr>'
            '<td style="background:#f6efdc;border:1px solid %s;padding:16px 18px;">'
            '<div style="font-family:%s;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:%s;margin-bottom:6px;">Remember</div>'
            '<div style="font-family:%s;font-style:italic;font-size:18px;line-height:1.45;color:#2b2927;">%s</div></td></tr></table>'
            % (INK, MONO, INK, SERIF, rich(c.get('note')))) if c.get('note') else ''
    return ('<tr><td class="pad" style="padding:26px 44px 4px;">'
            '<div style="font-family:%(mono)s;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:%(ink)s;">%(el)s <span style="color:%(coral)s;">&#x2726;</span> %(arch)s</div>'
            '<div style="font-family:%(serif)s;font-size:40px;line-height:1;letter-spacing:1px;text-transform:uppercase;color:%(ink)s;margin:10px 0 10px;">%(name)s Rising</div>'
            '<div style="font-family:%(serif)s;font-size:21px;line-height:1.3;color:%(ink)s;margin:0 0 16px;">%(teaser)s</div>'
            '<div style="border-top:3px double %(ink)s;height:4px;font-size:0;line-height:0;">&nbsp;</div>'
            '<div style="font-family:%(mono)s;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:%(muted)s;margin:14px 0 6px;">%(lab)s &#x2726; %(house)s</div>'
            '<div style="font-family:%(serif)s;font-size:26px;line-height:1.15;color:%(ink)s;margin:0 0 14px;">%(title)s</div>'
            '%(body)s%(note)s'
            '<div style="margin:16px 0 0;font-family:%(mono)s;font-size:13px;"><a href="%(url)s" style="color:%(ink)s;">Read it on the site, with the whole month&#x2019;s story &rarr;</a></div>'
            '</td></tr>') % dict(mono=MONO, serif=SERIF, ink=INK, muted=MUTED, coral=CORAL, el=el.capitalize(), arch=arch, name=name,
                                 teaser=rich(c.get('teaser')), lab=esc(lab), house=esc(c.get('house') or name + ' Rising'),
                                 title=rich(c.get('title')), body=paras(c.get('body')), note=note, url=url)


def unsure_block(D, key):
    links = ' &nbsp;&#x2726;&nbsp; '.join('<a href="%s/this-season/%s/%s/#%s" style="color:%s;">%s</a>' % (SITE, key[:4], key[5:7], s, INK, s.capitalize())
                                          for s, *_ in SB.SIGNS)
    return ('<tr><td class="pad" style="padding:26px 44px 4px;font-family:%s;font-size:15px;line-height:1.65;color:%s;">'
            '<p style="margin:0 0 14px;">Your rising sign decides which chapter is yours, and your birth time tells us your rising. '
            'Cast your free chart to find it, then tap your sign below.</p>'
            '<p style="margin:0 0 18px;"><a href="%s/chart/" style="color:%s;font-weight:bold;">Cast my chart &rarr;</a></p>'
            '<p style="margin:0;font-size:13px;line-height:2;">%s</p></td></tr>') % (MONO, INK, SITE, INK, links)


def build(key, preview_sign=None):
    D = SB.load(ROOT)
    M = D[key]; P = M.get('post') or {}
    lab = M.get('label'); mo = lab.split()[0]
    head_img = '%s/assets/email/season-%s.png' % (SITE, key)
    rows_signs = []
    for s, el, gl, arch, tag in SB.SIGNS:
        rows_signs.append((s, sign_block(D, key, s, el, arch)))
    def liquid():
        parts = ['{%% if subscriber.rising_sign == "%s" %%}%s' % (s.capitalize(), b) if i == 0 else
                 '{%% elsif subscriber.rising_sign == "%s" %%}%s' % (s.capitalize(), b) for i, (s, b) in enumerate(rows_signs)]
        return '\n'.join(parts) + '\n{% else %}' + unsure_block(D, key) + '{% endif %}'
    def page(signs_html, first, unsub, address):
        return TEMPLATE % dict(mo=esc(mo), lab=esc(lab), head=head_img, first=first, signs=signs_html, unsub=unsub, address=address,
                               theme=rich(P.get('title')), summary=rich(P.get('summary') or P.get('takeaway')), site=SITE,
                               key_url='%s/this-season/%s/%s/' % (SITE, key[:4], key[5:7]), mono=MONO, serif=SERIF,
                               ink=INK, muted=MUTED, paper=PAPER, card=CARD, coral=CORAL)
    out = os.path.join(ROOT, 'tools', 'email', 'out'); os.makedirs(out, exist_ok=True)
    kit = page(liquid(), '{{ subscriber.first_name | default: "there" }}', '{{ unsubscribe_url }}', '{{ address }}')
    open(os.path.join(out, 'monthly-%s-kit.html' % key), 'w').write(kit)
    sign = preview_sign or 'leo'
    block = dict(rows_signs).get(sign) or unsure_block(D, key)
    prev = page(block, 'Maya', '#', 'SIN PROD ENTERTAINMENT INC. &middot; [your mailing address]')
    open(os.path.join(out, 'monthly-%s-%s.html' % (key, sign)), 'w').write(prev)
    render_header(key, mo, lab)
    print('wrote', 'tools/email/out/monthly-%s-kit.html' % key, 'and the %s preview' % sign)


def render_header(key, mo, lab):
    """The month's masthead image, drawn with the site's own fonts."""
    yr = lab.split()[-1]
    page_html = HEAD_HTML.replace('{mo}', mo).replace('{yr}', yr)
    tmp = os.path.join(ROOT, '_mock', 'email-season.html'); os.makedirs(os.path.dirname(tmp), exist_ok=True)
    open(tmp, 'w').write(page_html)
    js = ("const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:600,height:400},deviceScaleFactor:2});"
          "await p.goto('http://localhost:8811/_mock/email-season.html',{waitUntil:'networkidle'});await p.waitForTimeout(400);"
          "const e=await p.$('.h');await e.screenshot({path:%r});await b.close();})();" % os.path.join(ROOT, 'assets', 'email', 'season-%s.png' % key))
    try:
        subprocess.run(['node', '-e', js], check=True, timeout=90, capture_output=True)
    except Exception as e:  # noqa: BLE001
        print('masthead image skipped (needs Playwright and a local server on :8811):', e)


HEAD_HTML = '''<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="/assets/ophi.css">
<style>html,body{margin:0;width:600px;background:#161310;cursor:auto}.cursor-orb,.cursor-dot{display:none}
.h{width:600px;box-sizing:border-box;padding:26px 36px 28px;background:#161310;color:#ece7dc;text-align:center}
.top{display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px solid rgba(236,231,220,.35);padding-bottom:12px}
.brand{font-family:var(--font-title);font-size:28px;color:#ece7dc!important}.brand small{font-style:italic;font-size:.44em;margin-left:.2em}
.k{font-family:var(--font-button);font-size:11px;letter-spacing:.2em;text-transform:uppercase}
h1{font-family:var(--font-title);font-weight:400;font-size:104px;line-height:.9;margin:26px 0 10px;letter-spacing:-.02em}
.yr{font-family:var(--font-button);font-size:13px;letter-spacing:.5em;margin:0 0 14px}
.rule{border-top:3px double #ece7dc;border-bottom:1px solid #ece7dc;height:3px;margin:0 0 10px}
.by{font-family:var(--font-button);font-size:11px;letter-spacing:.24em;text-transform:uppercase}.by b{color:#ef5334;font-weight:400;margin:0 .8em}
.hand{font-family:var(--font-hand);font-size:26px;margin-top:12px;color:#ece3cf}</style></head><body><div class="h">
<div class="top"><span class="brand"><span class="logo">O</span>phi<small>by Bri</small></span><span class="k">This Season</span></div>
<h1>{mo}</h1><div class="yr">{yr}</div><div class="rule"></div>
<div class="by">Your monthly reading<b>&#x2726;</b>By rising sign</div><div class="hand">your chapter is inside</div>
</div></body></html>'''

TEMPLATE = '''<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="x-apple-disable-message-reformatting"><meta name="color-scheme" content="light only">
<title>This Season: %(lab)s</title>
<!-- Subject line: Your %(mo)s reading is here
     Generated by tools/email/monthly.py from assets/season-data.js. -->
<style>body{margin:0;padding:0}a{color:%(ink)s}
@media (max-width:620px){.wrap{width:100%%!important}.pad{padding-left:20px!important;padding-right:20px!important}}</style>
</head>
<body style="margin:0;padding:0;background:%(paper)s;">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">Your %(mo)s chapter by rising sign, from Bri.&#8199;&#847;&#8199;&#847;&#8199;&#847;</div>
<table role="presentation" width="100%%" cellpadding="0" cellspacing="0" border="0" style="background:%(paper)s;"><tr><td align="center" style="padding:24px 0 40px;">
<table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;">

<tr><td style="background:%(ink)s;"><a href="%(key_url)s" style="text-decoration:none;"><img src="%(head)s" width="600" alt="Ophi by Bri. This Season: %(lab)s. Your monthly reading by rising sign." style="display:block;width:100%%;max-width:600px;height:auto;border:0;color:#ece7dc;font-family:Georgia,serif;font-size:28px;background:%(ink)s;"></a></td></tr>
<tr><td style="line-height:0;font-size:0;"><img src="%(site)s/assets/email/lace.png" width="600" alt="" style="display:block;width:100%%;max-width:600px;height:auto;border:0;"></td></tr>

<tr><td class="pad" style="padding:26px 44px 4px;text-align:center;">
  <div style="font-family:%(mono)s;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:%(ink)s;">This month&#x2019;s theme</div>
  <div style="font-family:%(serif)s;font-size:30px;line-height:1.15;color:%(ink)s;margin:10px 0 12px;">%(theme)s</div>
  <div style="font-family:%(mono)s;font-size:15px;line-height:1.65;color:%(muted)s;">%(summary)s</div>
</td></tr>

<tr><td class="pad" style="padding:22px 44px 0;font-family:%(mono)s;font-size:15px;line-height:1.65;color:%(ink)s;">Hi %(first)s, here&#x2019;s your chapter for %(mo)s.</td></tr>

%(signs)s

<tr><td align="center" style="padding:30px 44px 6px;">
  <div style="font-family:%(mono)s;font-size:14px;line-height:1.6;color:%(ink)s;margin-bottom:16px;">Want to go deeper than your rising sign?</div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-right:4px solid %(coral)s;border-bottom:4px solid %(coral)s;"><tr>
    <td style="background:%(ink)s;border:2px solid %(ink)s;"><a href="%(site)s/book/" style="display:inline-block;padding:14px 28px;font-family:%(mono)s;font-weight:bold;font-size:14px;letter-spacing:3px;text-transform:uppercase;color:#ece7dc;text-decoration:none;">Book a reading &rarr;</a></td>
  </tr></table>
</td></tr>

<tr><td class="pad" style="padding:26px 44px 10px;font-family:%(mono)s;font-size:15px;line-height:1.6;color:%(ink)s;">
  Until next month,<div style="font-family:%(serif)s;font-style:italic;font-size:22px;margin-top:10px;">Bri</div>
</td></tr>

<tr><td class="pad" style="padding:22px 44px 0;">
  <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-top:3px double %(ink)s;padding-top:14px;font-family:%(mono)s;font-size:12px;line-height:1.7;color:%(muted)s;text-align:center;">
    <span style="font-family:%(serif)s;font-size:18px;color:%(ink)s;">Ophi <i style="font-size:12px;">by Bri</i></span><br>
    <span style="letter-spacing:2px;text-transform:uppercase;">Awakening Astrology</span><br>
    <a href="%(site)s/" style="color:%(ink)s;">ophibybri.com</a> &nbsp;&#x2726;&nbsp; <a href="https://www.instagram.com/brigodard/" style="color:%(ink)s;">@brigodard</a> &nbsp;&#x2726;&nbsp; <a href="mailto:ophibybri@gmail.com" style="color:%(ink)s;">ophibybri@gmail.com</a><br><br>
    You&#x2019;re receiving this because you signed up for the monthly reading at ophibybri.com.<br>
    %(address)s<br>
    <a href="%(unsub)s" style="color:%(ink)s;">Unsubscribe</a> &nbsp;&#x2726;&nbsp; <a href="%(site)s/privacy/" style="color:%(ink)s;">Privacy</a><br>
    Reflective, spiritual guidance. Not a substitute for therapy or medical advice.
  </td></tr></table>
</td></tr>

</table></td></tr></table>
</body></html>
'''

if __name__ == '__main__':
    build(sys.argv[1] if len(sys.argv) > 1 else SB.this_month(), sys.argv[2] if len(sys.argv) > 2 else None)
