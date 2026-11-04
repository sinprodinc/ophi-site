/* Ophi monthly letter sign-up (Bri, 4 Nov 2026).
   EmailOctopus builds its form after the page loads. Once it appears:
   - the "Don't know it? Find your rising sign" link moves in right under the rising-sign dropdown;
   - on the chart page, the dropdown is set to the rising sign of the chart just cast. */
(function () {
  'use strict';
  var SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  var rising = null;

  function risingSelect(box) {
    var row = box.querySelector('[eo-label="Rising sign"]');
    var sel = row && row.querySelector('select');
    if (!sel) {
      var all = box.querySelectorAll('.emailoctopus-form select');
      for (var i = 0; i < all.length; i++) if (/aries/i.test(all[i].textContent)) { sel = all[i]; break; }
    }
    return sel;
  }

  function pick(sel) {
    if (!sel || rising === null) return;
    var name = SIGNS[rising].toLowerCase();
    for (var i = 0; i < sel.options.length; i++) {
      var o = sel.options[i];
      if (o.text.trim().toLowerCase() === name || o.value.trim().toLowerCase() === name) {
        if (sel.selectedIndex !== i) { sel.selectedIndex = i; sel.dispatchEvent(new Event('change', { bubbles: true })); }
        return;
      }
    }
  }

  function settle(box) {
    var card = box.closest('.ophi-signup');
    var form = box.querySelector('.emailoctopus-form');
    if (!form) return false;
    card.classList.add('su-ready');
    var sel = risingSelect(box);
    var find = card.querySelector('.su-find');
    if (sel && find && !find.classList.contains('su-in')) {
      var row = sel.closest('.emailoctopus-form-row') || sel.parentNode;
      row.appendChild(find);
      find.classList.add('su-in');
    }
    pick(sel);
    return true;
  }

  function watch(box) {
    if (settle(box)) return;
    var mo = new MutationObserver(function () { if (settle(box)) mo.disconnect(); });
    mo.observe(box, { childList: true, subtree: true });
  }

  // the chart page announces each chart it draws
  document.addEventListener('ophi:cast', function (e) {
    var d = e.detail || {};
    rising = (d.example || d.ascSign === null || d.ascSign === undefined) ? null : d.ascSign;
    var boxes = document.querySelectorAll('.ophi-signup .su-form');
    for (var i = 0; i < boxes.length; i++) pick(risingSelect(boxes[i]));
  });

  function init() {
    var boxes = document.querySelectorAll('.ophi-signup .su-form');
    for (var i = 0; i < boxes.length; i++) watch(boxes[i]);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
