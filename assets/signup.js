/* Ophi monthly letter sign-up (Bri, 4 Nov 2026).
   EmailOctopus builds its form after the page loads, and draws the rising-sign dropdown a moment later. Once it's in:
   - the "Don't know it? Find your rising sign" link moves in right under the dropdown;
   - on the chart page, the dropdown is set to the rising sign of the chart just cast (through EmailOctopus's own
     options, so its form registers the choice). */
(function () {
  'use strict';
  var SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  var rising = null;

  function row(box) { return box.querySelector('[eo-label="Rising sign"]'); }
  function combo(box) { var r = row(box); return r && r.querySelector('[role=combobox]'); }

  // The pick runs through EmailOctopus's own dropdown, which takes focus; so it waits until the card is on screen,
  // where taking focus can't move the page, and hands focus back afterwards.
  function pick(box) {
    var cb = combo(box);
    if (!cb || rising === null) return;
    var name = SIGNS[rising];
    if (cb.textContent.trim() === name) return;
    var r = box.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) { later(box); return; }
    var y = window.scrollY, back = document.activeElement;
    cb.click();
    setTimeout(function () {
      var opts = row(box).querySelectorAll('[role=option]'), hit = null;
      for (var i = 0; i < opts.length; i++) if (opts[i].textContent.trim() === name) { hit = opts[i]; break; }
      if (hit) hit.click(); else if (cb.getAttribute('aria-expanded') === 'true') cb.click();
      if (document.activeElement && box.contains(document.activeElement)) document.activeElement.blur();
      if (back && back.focus && back !== document.body) try { back.focus({ preventScroll: true }); } catch (e) { }
      if (Math.abs(window.scrollY - y) > 2) window.scrollTo(0, y);
    }, 60);
  }

  function later(box) {
    if (box._suWait || !('IntersectionObserver' in window)) return;
    box._suWait = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      box._suWait.disconnect(); box._suWait = null; pick(box);
    });
    box._suWait.observe(box);
  }

  function settle(box) {
    var card = box.closest('.ophi-signup');
    if (box.querySelector('.emailoctopus-form')) card.classList.add('su-ready');
    var cb = combo(box);
    if (!cb) return false;
    var find = card.querySelector('.su-find');
    if (find && !find.classList.contains('su-in')) { row(box).appendChild(find); find.classList.add('su-in'); }
    pick(box);
    return true;
  }

  function watch(box) {
    if (settle(box)) return;
    var mo = new MutationObserver(function () { if (settle(box)) mo.disconnect(); });
    mo.observe(box, { childList: true, subtree: true });
    setTimeout(function () { mo.disconnect(); }, 30000);
  }

  // the chart page announces each chart it draws
  document.addEventListener('ophi:cast', function (e) {
    var d = e.detail || {};
    rising = (d.example || d.ascSign === null || d.ascSign === undefined) ? null : d.ascSign;
    var boxes = document.querySelectorAll('.ophi-signup .su-form');
    for (var i = 0; i < boxes.length; i++) pick(boxes[i]);
  });

  function init() {
    var boxes = document.querySelectorAll('.ophi-signup .su-form');
    for (var i = 0; i < boxes.length; i++) watch(boxes[i]);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
