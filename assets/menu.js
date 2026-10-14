/* Ophi site menu.
   One file, loaded by every page (the chart page too). It adds a "Menu" button to the end of the page's nav and a
   drawer that slides in from the right, styled like a newspaper contents panel.
   To add or rename a page, edit PAGES below; every page picks the change up. */
(function () {
  var PAGES = [
    { href: '/', title: 'Home', note: 'Start here' },
    { href: '/readings/', title: 'Readings', note: 'Meet Yourself, Quickie, Here To Help' },
    { href: '/chart/', title: 'Your Chart', note: 'Cast your natal chart, free' },
    { href: '/this-season/', title: 'This Season', note: 'The sky right now, rising sign by rising sign' }
  ];
  var BOOK = '/readings/';
  var IG = 'https://www.instagram.com/brigodard/';
  var NUM = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

  var path = location.pathname.replace(/index\.html$/, '');
  if (path.slice(-1) !== '/') path += '/';
  var current = function (href) { return href === '/' ? path === '/' : path.indexOf(href) === 0; };

  var css = [
    ':root{--om-paper:#ece7dc;--om-paper-hi:#f5f1e8;--om-ink:#161310;--om-ink-2:#413b32;--om-coral:#ef5334;--om-lilac:#9a7fd0;',
    "--om-title:'Modern Romance','Playfair Display',Georgia,serif;--om-body:'KIN668','Inter',system-ui,sans-serif;",
    "--om-type:'Moms Typewriter','Special Elite','Courier New',monospace}",
    /* the button: an outline chip that matches the Music chip */
    '.om-btn{display:inline-flex;align-items:center;gap:9px;height:34px;padding:0 12px;margin:0;font:inherit;font-family:var(--om-type);',
    'font-size:11.5px;text-transform:uppercase;letter-spacing:.08em;line-height:1;color:var(--om-ink);background:var(--om-paper);',
    'border:1.5px solid var(--om-ink);border-radius:0;cursor:pointer;transition:color .15s,border-color .15s}',
    '.om-btn:hover{color:var(--om-coral);border-color:var(--om-coral)}',
    '.om-btn:focus-visible,.om-panel a:focus-visible,.om-close:focus-visible{outline:2px solid var(--om-lilac);outline-offset:3px}',
    '.om-lines{display:inline-flex;flex-direction:column;gap:3px;width:16px}',
    '.om-lines i{display:block;height:1.5px;background:currentColor}',
    '.om-lines i:nth-child(2){width:72%}',
    '.om-lines i:nth-child(3){width:86%}',
    '@media(max-width:479px){.om-btn{width:34px;padding:0;justify-content:center}.om-btn .om-txt{display:none}}',
    /* the shade and the drawer */
    '.om-shade{position:fixed;inset:0;z-index:9000;background:rgba(22,19,16,.42);opacity:0;visibility:hidden;transition:opacity .3s,visibility 0s .3s}',
    '.om-panel{position:fixed;top:0;right:0;bottom:0;z-index:9001;width:min(460px,100vw);display:flex;flex-direction:column;',
    'background:var(--om-paper);color:var(--om-ink);border-left:1.5px solid var(--om-ink);box-shadow:-7px 0 0 var(--om-ink);',
    'transform:translateX(calc(100% + 12px));visibility:hidden;transition:transform .38s cubic-bezier(.2,.8,.2,1),visibility 0s .38s;overflow-y:auto;overscroll-behavior:contain}',
    '.om-open .om-shade{opacity:1;visibility:visible;transition:opacity .3s}',
    '.om-open .om-panel{transform:none;visibility:visible;transition:transform .38s cubic-bezier(.2,.8,.2,1)}',
    '@media(max-width:520px){.om-panel{box-shadow:none;border-left:0}}',
    '@media(prefers-reduced-motion:reduce){.om-shade,.om-panel,.om-open .om-shade,.om-open .om-panel{transition:none}}',
    '.om-top{display:flex;align-items:center;justify-content:space-between;padding:18px 24px;border-bottom:1.5px solid var(--om-ink);border-top:7px solid var(--om-ink)}',
    '.om-brand{font-family:var(--om-title);font-size:24px;line-height:1;color:var(--om-ink);text-decoration:none}',
    '.om-brand small{font-family:var(--om-title);font-style:italic;font-size:.5em;margin-left:.3em}',
    '.om-close{width:38px;height:38px;display:grid;place-items:center;background:var(--om-ink);color:var(--om-paper);border:0;border-radius:0;cursor:pointer;box-shadow:3px 3px 0 var(--om-coral)}',
    '.om-close:hover{background:var(--om-ink-2)}',
    '.om-kicker{margin:26px 24px 0;padding:9px 0 8px;border-top:3px double var(--om-ink);border-bottom:1px solid var(--om-ink);',
    'font-family:var(--om-type);font-size:11px;letter-spacing:.16em;text-transform:uppercase;text-align:center}',
    '.om-kicker b{color:var(--om-coral);font-weight:400;margin:0 .6em}',
    '.om-list{list-style:none;margin:6px 24px 0;padding:0}',
    '.om-list li{border-bottom:1px solid rgba(22,19,16,.28)}',
    '.om-list a{display:grid;grid-template-columns:2.6em 1fr;align-items:baseline;gap:0 6px;padding:17px 0 15px;color:var(--om-ink);text-decoration:none}',
    '.om-num{font-family:var(--om-type);font-size:12px;letter-spacing:.06em;color:var(--om-coral)}',
    '.om-title{font-family:var(--om-title);font-size:clamp(34px,9vw,44px);line-height:1;letter-spacing:-.01em;transition:transform .2s;display:inline-block;justify-self:start}',
    '.om-note{grid-column:2;margin-top:7px;font-family:var(--om-body);font-size:13px;line-height:1.4;color:var(--om-ink-2)}',
    '.om-list a:hover .om-title{transform:translateX(6px);color:var(--om-coral)}',
    /* the page you are on: italic, with Bri\'s lilac marker */
    '.om-list a[aria-current] .om-title{font-style:italic;padding:0 .08em;background:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 200 40\' preserveAspectRatio=\'none\'%3E%3Cpath fill=\'%239a7fd0\' fill-opacity=\'.34\' d=\'M4 12C22 8 48 10 70 8S120 6 146 9 184 7 197 11L196 18 199 26 195 33C170 36 140 33 112 35S58 37 30 34 8 36 3 32L5 24 2 17Z\'/%3E%3C/svg%3E") 0 62%/100% 62% no-repeat}',
    '.om-list a[aria-current] .om-num::after{content:" \\2726"}',
    '.om-foot{margin-top:auto;padding:28px 24px 30px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px}',
    '.om-book{display:inline-flex;align-items:center;gap:10px;padding:13px 20px;background:var(--om-ink);color:var(--om-paper);text-decoration:none;',
    'font-family:var(--om-type);font-size:12px;letter-spacing:.1em;text-transform:uppercase;box-shadow:5px 5px 0 var(--om-coral);transition:background .15s}',
    '.om-book:hover{background:var(--om-coral)}',
    '.om-ig{font-family:var(--om-type);font-size:11.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--om-ink);text-decoration:none;border-bottom:1px solid currentColor;padding-bottom:2px}',
    '.om-ig:hover{color:var(--om-coral)}',
    'html.om-lock,html.om-lock body{overflow:hidden}'
  ].join('');

  var build = function () {
    var slot = document.querySelector('nav .nav-links') || document.querySelector('.nav');
    if (!slot || document.querySelector('.om-btn')) return;

    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'om-btn';
    btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', 'om-panel');
    btn.innerHTML = '<span class="om-lines" aria-hidden="true"><i></i><i></i><i></i></span><span class="om-txt">Menu</span>';
    btn.setAttribute('aria-label', 'Open the menu');
    slot.appendChild(btn);

    var items = PAGES.map(function (p, k) {
      return '<li><a href="' + p.href + '"' + (current(p.href) ? ' aria-current="page"' : '') + '>' +
        '<span class="om-num">' + NUM[k] + '.</span><span class="om-title">' + p.title + '</span>' +
        '<span class="om-note">' + p.note + '</span></a></li>';
    }).join('');

    var shade = document.createElement('div'); shade.className = 'om-shade';
    var panel = document.createElement('div');
    panel.className = 'om-panel'; panel.id = 'om-panel'; panel.setAttribute('aria-label', 'Site menu');
    panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'true');
    panel.innerHTML =
      '<div class="om-top"><a class="om-brand" href="/">Ophi<small>by Bri</small></a>' +
      '<button class="om-close" type="button" aria-label="Close the menu"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg></button></div>' +
      '<div class="om-kicker">Contents<b>&#x2726;</b>Ophi by Bri</div>' +
      '<ul class="om-list">' + items + '</ul>' +
      '<div class="om-foot"><a class="om-book" href="' + BOOK + '">Book a reading <span aria-hidden="true">&#x2192;</span></a>' +
      '<a class="om-ig" href="' + IG + '" target="_blank" rel="noopener noreferrer">@brigodard</a></div>';
    document.body.appendChild(shade); document.body.appendChild(panel);

    var closeBtn = panel.querySelector('.om-close');
    var open = false;
    var focusables = function () { return Array.prototype.slice.call(panel.querySelectorAll('a,button')); };
    var setOpen = function (v) {
      open = v;
      document.documentElement.classList.toggle('om-open', v);
      document.documentElement.classList.toggle('om-lock', v);
      btn.setAttribute('aria-expanded', v ? 'true' : 'false');
      if (v) setTimeout(function () { closeBtn.focus(); }, 30); else btn.focus();
    };
    btn.addEventListener('click', function () { setOpen(true); });
    closeBtn.addEventListener('click', function () { setOpen(false); });
    shade.addEventListener('click', function () { setOpen(false); });
    /* a link to a spot on this same page just closes the drawer and goes there */
    panel.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a');
      if (a && a.getAttribute('aria-current')) { e.preventDefault(); setOpen(false); }
    });
    document.addEventListener('keydown', function (e) {
      if (!open) return;
      if (e.key === 'Escape') { e.preventDefault(); setOpen(false); return; }
      if (e.key === 'Tab') {
        var f = focusables(), first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    /* the site's custom cursor shrinks over things you can click; give the menu the same behaviour */
    Array.prototype.forEach.call(document.querySelectorAll('.om-btn,.om-panel a,.om-panel button'), function (el) {
      el.addEventListener('mouseenter', function () { document.body.classList.add('cur-hover'); });
      el.addEventListener('mouseleave', function () { document.body.classList.remove('cur-hover'); });
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
