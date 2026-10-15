/* Music on the chart page.
   The chart page is its own app and doesn't load the site's main script, so the music used to stop here.
   This adds the same Music chip to the chart's nav and shares the site's memory of the track
   (sessionStorage 'ophi-music' = the play position while it is on), so the music carries on
   arriving here and carries on again when you go back to the other pages. */
(function () {
  var SRC = '/assets/ophi-music.mp3?v=binaural-1', KEY = 'ophi-music', VOL = .75;
  var store = function (v) { try { if (v === null) sessionStorage.removeItem(KEY); else sessionStorage.setItem(KEY, v); } catch (e) {} };
  var stored = function () { try { return sessionStorage.getItem(KEY); } catch (e) { return null; } };

  var css = '.cm-btn{margin-left:auto!important;display:inline-flex;align-items:center;gap:8px;height:34px;padding:0 12px;margin:0;font-family:"Moms Typewriter","KIN668","Courier New",monospace;' +
    'font-size:11.5px;text-transform:uppercase;letter-spacing:.08em;line-height:1;color:#161310;background:#ece7dc;border:1.5px solid #161310;border-radius:0;cursor:pointer}' +
    '.cm-btn:hover{color:#ef5334;border-color:#ef5334}.cm-btn:focus-visible{outline:2px solid #9a7fd0;outline-offset:3px}' +
    '.cm-btn svg{width:10px;height:10px;fill:currentColor}.cm-btn .cm-pause{display:none}' +
    '.cm-btn[aria-pressed="true"] .cm-play{display:none}.cm-btn[aria-pressed="true"] .cm-pause{display:inline}' +
    '@media(max-width:479px){.cm-btn{width:34px;padding:0;justify-content:center}.cm-btn .cm-txt{display:none}}';

  var build = function () {
    var nav = document.querySelector('.nav');
    if (!nav || document.querySelector('.cm-btn')) return;
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'cm-btn'; btn.setAttribute('aria-pressed', 'false'); btn.setAttribute('aria-label', 'Play music');
    btn.innerHTML = '<svg class="cm-play" viewBox="0 0 10 10" aria-hidden="true"><path d="M1 0l9 5-9 5z"/></svg>' +
      '<svg class="cm-pause" viewBox="0 0 10 10" aria-hidden="true"><path d="M1 0h3v10H1zM6 0h3v10H6z"/></svg><span class="cm-txt">Music</span>';
    var chip = nav.querySelector('.chip');
    if (chip) nav.insertBefore(btn, chip); else nav.appendChild(btn);

    var el = new Audio(); el.loop = true; el.preload = 'none';
    var on = false, fadeT = null;
    var paint = function () { btn.setAttribute('aria-pressed', on ? 'true' : 'false'); btn.setAttribute('aria-label', on ? 'Pause music' : 'Play music'); };
    var fade = function (to, ms, done) {
      clearInterval(fadeT); var from = el.volume, s0 = Date.now();
      fadeT = setInterval(function () { var k = Math.min(1, (Date.now() - s0) / ms); try { el.volume = from + (to - from) * k; } catch (e) {} if (k >= 1) { clearInterval(fadeT); if (done) done(); } }, 40);
    };
    var play = function (at, quiet) {
      if (!el.src) { el.preload = 'auto'; el.src = SRC; }
      if (at) {
        var seek = function () { try { if (Math.abs(el.currentTime - at) > 1) el.currentTime = at; } catch (e) {} };
        if (el.readyState >= 1) seek(); else el.addEventListener('loadedmetadata', seek, { once: true });
      }
      el.volume = 0;
      var p = el.play();
      var ok = function () { on = true; store(String(Math.max(el.currentTime || 0, at || 0))); fade(VOL, 900); paint(); };
      var no = function () { on = false; if (quiet) store(null); paint(); };
      if (p && p.then) p.then(ok, no); else ok();
    };
    btn.addEventListener('click', function () {
      if (on) { on = false; store(null); fade(0, 280, function () { try { el.pause(); } catch (e) {} }); paint(); }
      else play(0, false);
    });
    btn.addEventListener('mouseenter', function () { document.body.classList.add('cur-hover'); });
    btn.addEventListener('mouseleave', function () { document.body.classList.remove('cur-hover'); });
    addEventListener('pagehide', function () { if (on) store(String(el.currentTime || 0)); });
    /* arriving with the music on: carry on from where it was */
    var was = stored();
    if (was !== null) play(parseFloat(was) || 0, true);
    paint();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
