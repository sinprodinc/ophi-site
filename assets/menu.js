/* Ophi site menu.
   One file, loaded by every page (the chart page too). It adds a small "Menu" button to the end of the page's nav.
   The menu opens as a small paper card just under the button, not a full panel. Click outside or press Esc to close it.
   To add or rename a page, edit PAGES below; every page picks the change up. */
(function () {
  var PAGES = [
    { href: '/', title: 'Home' },
    { href: '/readings/', title: 'Make It Make Sense' },
    { href: '/chart/', title: 'Your Chart' },
    { href: '/this-season/', title: 'This Season' },
    { href: '/candles/', title: 'Candles & Rituals' }
  ];
  /* pages that are shelved for now (set in build.py, written here by the build) */
  var SHELVED = ['candles'];
  PAGES = PAGES.filter(function (p) { return SHELVED.indexOf(p.href.replace(/\//g, '')) < 0; });
  var NUM = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

  var path = location.pathname.replace(/index\.html$/, '');
  if (path.slice(-1) !== '/') path += '/';
  var current = function (href) { return href === '/' ? path === '/' : path.indexOf(href) === 0; };

  var css = [
    ':root{--om-paper:#ece7dc;--om-bone:#f8f5ef;--om-ink:#161310;--om-ink-2:#413b32;--om-coral:#ef5334;--om-lilac:#9a7fd0;',
    "--om-title:'Modern Romance','Playfair Display',Georgia,serif;--om-type:'Moms Typewriter','Special Elite','Courier New',monospace}",
    '.om-wrap{position:relative;display:inline-flex}',
    /* the button: an outline chip that matches the Music chip */
    '.om-btn{display:inline-flex;align-items:center;gap:9px;height:34px;padding:0 12px;margin:0;font:inherit;font-family:var(--om-type);',
    'font-size:11.5px;text-transform:uppercase;letter-spacing:.08em;line-height:1;color:var(--om-ink);background:var(--om-paper);',
    'border:1.5px solid var(--om-ink);border-radius:0;cursor:pointer;transition:color .15s,border-color .15s}',
    '.om-btn:hover{color:var(--om-coral);border-color:var(--om-coral)}',
    '.om-btn:focus-visible,.om-card a:focus-visible{outline:2px solid var(--om-lilac);outline-offset:3px}',
    '.om-lines{position:relative;display:inline-flex;flex-direction:column;gap:3px;width:16px}',
    '.om-lines i{display:block;height:1.5px;background:currentColor;transition:transform .25s,opacity .2s}',
    '.om-lines i:nth-child(2){width:72%}',
    '.om-lines i:nth-child(3){width:86%}',
    '.om-btn[aria-expanded="true"] .om-lines i:nth-child(1){transform:translateY(4.5px) rotate(45deg)}',
    '.om-btn[aria-expanded="true"] .om-lines i:nth-child(2){opacity:0}',
    '.om-btn[aria-expanded="true"] .om-lines i:nth-child(3){width:100%;transform:translateY(-4.5px) rotate(-45deg)}',
    '@media(max-width:479px){.om-btn{width:34px;padding:0;justify-content:center}.om-btn .om-txt{display:none}}',
    /* the card */
    '.om-card{position:fixed;top:60px;right:16px;z-index:9001;text-transform:none;letter-spacing:normal;width:min(250px,calc(var(--vw,1vw) * 100 - 32px));padding:10px 18px 12px;',
    'background:var(--om-bone);color:var(--om-ink);border:2px solid var(--om-ink);box-shadow:6px 6px 0 var(--om-ink);text-align:left;',
    'opacity:0;visibility:hidden;transform:translateY(-6px) scale(.98);transform-origin:top right;transition:opacity .2s,transform .2s,visibility 0s .2s}',
    '.om-card::before{content:"";position:absolute;top:-8px;right:16px;width:12px;height:12px;background:var(--om-bone);border-left:2px solid var(--om-ink);border-top:2px solid var(--om-ink);transform:rotate(45deg)}',
    '.om-card.om-show{opacity:1;visibility:visible;transform:none;transition:opacity .2s,transform .2s}',
    '@media(prefers-reduced-motion:reduce){.om-card,.om-card.om-show{transition:none}}',
    '.om-card ul{list-style:none;margin:0;padding:0}',
    '.om-card li + li{border-top:1px solid rgba(22,19,16,.18)}',
    '.om-card a{display:flex;align-items:baseline;gap:10px;padding:9px 0 8px;color:var(--om-ink);text-decoration:none}',
    '.om-num{flex:0 0 2.1em;font-family:var(--om-type);font-size:10px;letter-spacing:.06em;color:var(--om-coral)}',
    '.om-title{font-family:var(--om-title);font-size:22px;line-height:1.05;transition:transform .2s,color .2s}',
    '.om-card a:hover .om-title{transform:translateX(4px);color:var(--om-coral)}',
    '.om-card a[aria-current] .om-title{font-style:italic;padding:0 .08em;background:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 200 40\' preserveAspectRatio=\'none\'%3E%3Cpath fill=\'%239a7fd0\' fill-opacity=\'.34\' d=\'M4 12C22 8 48 10 70 8S120 6 146 9 184 7 197 11L196 18 199 26 195 33C170 36 140 33 112 35S58 37 30 34 8 36 3 32L5 24 2 17Z\'/%3E%3C/svg%3E") 0 62%/100% 62% no-repeat}'
  ].join('');

  var build = function () {
    var slot = document.querySelector('nav .nav-links') || document.querySelector('.nav');
    if (!slot || document.querySelector('.om-btn')) return;

    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

    var wrap = document.createElement('div'); wrap.className = 'om-wrap';
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'om-btn';
    btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', 'om-card');
    btn.setAttribute('aria-label', 'Menu');
    btn.innerHTML = '<span class="om-lines" aria-hidden="true"><i></i><i></i><i></i></span><span class="om-txt">Menu</span>';

    var card = document.createElement('div');
    card.className = 'om-card'; card.id = 'om-card';
    card.setAttribute('role', 'navigation'); card.setAttribute('aria-label', 'Site menu');
    card.innerHTML = '<ul>' + PAGES.map(function (p, k) {
      return '<li><a href="' + p.href + '"' + (current(p.href) ? ' aria-current="page"' : '') + '>' +
        '<span class="om-num">' + NUM[k] + '.</span><span class="om-title">' + p.title.replace('&', '&amp;') + '</span></a></li>';
    }).join('') + '</ul>';
    wrap.appendChild(btn); slot.appendChild(wrap); document.body.appendChild(card);

    var open = false;
    /* the card floats above everything (mastheads clip their contents), lined up under the button */
    var place = function () {
      var r = btn.getBoundingClientRect();
      card.style.top = (r.bottom + 12) + 'px';
      card.style.right = Math.max(8, document.documentElement.clientWidth - r.right) + 'px';
    };
    addEventListener('resize', function () { if (open) place(); });
    addEventListener('scroll', function () { if (open) place(); }, { passive: true });
    var setOpen = function (v, focusBtn) {
      open = v;
      wrap.classList.toggle('om-open', v); card.classList.toggle('om-show', v);
      btn.setAttribute('aria-expanded', v ? 'true' : 'false');
      if (v) { place(); var first = card.querySelector('a'); setTimeout(function () { first.focus(); }, 30); }
      else if (focusBtn) btn.focus();
    };
    btn.addEventListener('click', function (e) { e.stopPropagation(); setOpen(!open); });
    document.addEventListener('click', function (e) { if (open && !wrap.contains(e.target) && !card.contains(e.target)) setOpen(false); });
    document.addEventListener('keydown', function (e) { if (open && e.key === 'Escape') { e.preventDefault(); setOpen(false, true); } });
    card.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a');
      if (a && a.getAttribute('aria-current')) { e.preventDefault(); setOpen(false, true); }
    });
    /* the site's custom cursor shrinks over things you can click; give the menu the same behaviour */
    Array.prototype.forEach.call([btn].concat(Array.prototype.slice.call(card.querySelectorAll('a'))), function (el) {
      el.addEventListener('mouseenter', function () { document.body.classList.add('cur-hover'); });
      el.addEventListener('mouseleave', function () { document.body.classList.remove('cur-hover'); });
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
