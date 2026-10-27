#!/usr/bin/env python3
"""Writes src/pages/candles.html, the Moon Candles shop (Bri, 27 Oct 2026).

Everything that changes lives at the top of this file:
  STOCK   tins left of each element (the set of four is limited by the lowest)
  LINKS   Stripe Payment Links, one per candle plus the set. Empty = the button reads "Opening soon".
  PRICE   per tin and for the set of four (before tax)

After editing:  python3 tools/shop.py && python3 build.py
Copy comes from the tin labels (claude/ophi-candle-labels.md). Titles are deliberately a little "off"; never correct them.
The burn rituals stay secret: the page says one is inside the lid, and never links to /rituals/.
"""
import os, html

STOCK = {'fire': 7, 'earth': 9, 'air': 10, 'water': 12}
LINKS = {'fire': '', 'earth': '', 'air': '', 'water': '', 'set': ''}
PRICE = {'one': 13, 'set': 45}

CANDLES = [
    dict(id='fire', el='Fire', name="Set This B*tch On Fire", signs=('Aries', 'Leo', 'Sagittarius'),
         saying="I'm the reason it's hot in here.", notes=('Clove', 'Juniper', 'Vanilla'),
         light='reignite your creative flame.', poured='with Jupiter in Leo, and the fireplace on.', pin='pin-pink'),
    dict(id='earth', el='Earth', name="Calm The F*ck Down", signs=('Taurus', 'Virgo', 'Capricorn'),
         saying='Conceptually touching grass.', notes=('Cardamom', 'Iris', 'Leather'),
         light='root yourself in your own body.', poured='during a Capricorn Moon, in silence.', pin='pin-green'),
    dict(id='air', el='Air', name="Ghost 'Em", signs=('Gemini', 'Libra', 'Aquarius'),
         saying='My peace is the distance between us.', notes=('Sage', 'Sea Salt', 'Ambrette Seed'),
         light='create head space.', poured='with the Sun in Libra, reciting positive affirmations.', pin='pin-butter'),
    dict(id='water', el='Water', name='Cry Bby xo', signs=('Cancer', 'Scorpio', 'Pisces'),
         saying='My feelings are the whole point.', notes=('Rose', 'Geranium', 'Amber'),
         light='release emotional blockages.', poured='during a Uranus X Moon Trine.', pin='pin-lilac'),
]

E = html.escape
STAR = '<b>&#x2726;</b>'
ARROW = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>'


def buy(key, label, left):
    if left <= 0:
        return '<span class="buy out" aria-disabled="true">Sold out</span>'
    if not LINKS.get(key):
        return '<span class="buy soon" aria-disabled="true">Opening soon</span>'
    return '<a class="buy" href="%s" target="_blank" rel="noopener">%s %s</a>' % (E(LINKS[key], quote=True), label, ARROW)


def left_line(n):
    return 'Sold out' if n <= 0 else ('Last one' if n == 1 else '%d left' % n)


def card(c):
    n = STOCK[c['id']]
    return '''    <article class="candle %(id)s%(out)s" id="%(id)s">
      <img class="eph pin" src="/assets/eph/%(pin)s.webp" alt="" aria-hidden="true" loading="lazy" decoding="async">
      <div class="tin-shot"><img src="/assets/shop/label-%(id)s.webp" width="510" height="893" alt="The %(name_a)s lid label: %(el)s Moon, %(saying_a)s" loading="lazy" decoding="async"></div>
      <div class="el"><span>%(el)s Moons</span><span>%(left)s</span></div>
      <h3>%(name)s</h3>
      <span class="moons">for %(signs)s Moons</span>
      <p class="notes">%(notes)s</p>
      <div class="price-line">$%(price)d <small>+ tax</small></div>
      <details>
        <summary>Details</summary>
        <dl>
          <dt>Light it to</dt><dd>%(light)s</dd>
          <dt>Poured</dt><dd>%(poured)s</dd>
          <dt>Tin</dt><dd>Black hinged pocket tin, double wick. Travel-ready.</dd>
          <dt>Inside</dt><dd>Soy wax, fragrance oil, wick, magic.</dd>
        </dl>
      </details>
      <div class="stub"><span>%(stub)s</span>%(buy)s</div>
    </article>''' % dict(
        id=c['id'], out=' sold-out' if n <= 0 else '', pin=c['pin'], el=c['el'], name=E(c['name']), name_a=E(c['name'], quote=True),
        saying_a=E(c['saying'], quote=True), left=left_line(n), signs=E(', '.join(c['signs'][:2]) + ' and ' + c['signs'][2]),
        notes=STAR.join(E(x) for x in c['notes']), price=PRICE['one'], light=E(c['light'][0].upper() + c['light'][1:]),
        poured=E(c['poured'][0].upper() + c['poured'][1:]), stub='Small batch' if n > 3 else 'Almost gone',
        buy=buy(c['id'], 'Buy', n))


def page():
    sets = min(STOCK.values())
    full = PRICE['one'] * 4
    return '''{{top}}
<section class="hero mini">
  <canvas class="stars" aria-hidden="true"></canvas>
{{nav}}
  <div class="mast">
    <div class="headline" style="--r:7.6">
      <h1>Moon <em>Candles</em></h1>
      <p class="byline">Pocket candles%(star)sBy Moon element%(star)sPoured by Bri</p>
    </div>
    <p class="hand-line">light the one your Moon asks for</p>
  </div>
</section>
<div class="lace-edge" aria-hidden="true"></div>

<section class="candles shop" id="candles">
  <div class="headline sec-head has-lede has-dd" style="--r:6.6">
    <h2>Find your <em>candle.</em></h2>
    <p class="byline">Fire%(star)sEarth%(star)sAir%(star)sWater<img class="dd-in on-rule" src="/assets/doodle/sparkles.webp" alt="" aria-hidden="true" loading="lazy" decoding="async"></p>
  </div>
  <p class="sub shop-lede">Your Moon sign is how you feel and what settles you. Each candle is poured for one Moon element, with its own scent and a saying on the lid. Hand-poured in small batches.</p>
  <div class="candle-grid">
%(cards)s
  </div>

  <article class="set-card" id="set">
    <div class="set-tins" aria-hidden="true">%(minis)s</div>
    <div class="set-copy">
      <div class="el"><span>All four Moons</span><span>%(set_left)s</span></div>
      <h3>The full <em>sky.</em></h3>
      <p>One tin of each element: Set This B*tch On Fire, Calm The F*ck Down, Ghost 'Em and Cry Bby xo. For every mood your Moon moves through, or for the people you'd give them to.</p>
    </div>
    <div class="set-buy">
      <div class="price-line">$%(set_price)d <small>+ tax</small></div>
      <p class="was">$%(full)d bought one by one</p>
      %(set_buy)s
    </div>
  </article>

  <div class="ship">
    <div><span class="k">Ships within Canada</span>Shipping is added at checkout.</div>
    <div><span class="k">Free pickup in Vancouver</span>Choose pickup at checkout and I'll message you to set a time.</div>
    <div><span class="k">Prices are before tax</span>Tax is added at checkout. Card and Apple Pay through Stripe.</div>
  </div>

  <p class="secret-note"><span class="hand">every tin hides a burn ritual</span><span class="sn-sub">Scan the code inside the lid.</span></p>

  <div class="find-moon">
    <img class="dd-in fm-cloud" src="/assets/doodle/cloud.webp" alt="" aria-hidden="true" loading="lazy" decoding="async"><span class="hand">don't know your Moon sign</span>
    <a href="/chart/">Cast your chart to find it <span aria-hidden="true">&#x2192;</span></a>
  </div>

  <div class="care"><img class="eph tape" src="/assets/eph/tape-pink.webp" alt="" aria-hidden="true" loading="lazy" decoding="async"><span class="k">Candle care<img class="dd-in in-k" src="/assets/doodle/heart-sm.webp" alt="" aria-hidden="true" loading="lazy" decoding="async"></span>Never leave it burning unattended. Set on a heat-safe surface. The tin gets hot. Do not burn more than 3 hours at a time. Let the tin cool before closing the lid.</div>
</section>

{{doors}}

{{footer-lite}}''' % dict(
        star=STAR, cards='\n'.join(card(c) for c in CANDLES),
        minis=''.join('<img src="/assets/shop/label-%s.webp" alt="" loading="lazy" decoding="async">' % c['id'] for c in CANDLES),
        set_left=left_line(sets), set_price=PRICE['set'], full=full, set_buy=buy('set', 'Buy the set', sets))


if __name__ == '__main__':
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    open(os.path.join(root, 'src/pages/candles.html'), 'w', encoding='utf-8').write(page() + '\n')
    print('wrote src/pages/candles.html; stock', STOCK, '; links set:', [k for k, v in LINKS.items() if v] or 'none')
