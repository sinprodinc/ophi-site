/* Ophi monthly letter sign-up (Bri, 4 Nov 2026).
   EmailOctopus builds its form after the page loads, and draws the rising-sign dropdown a moment later. Once it's in:
   - the "Don't know it? Find your rising sign" link moves in right under the dropdown;
   - on the chart page, the dropdown is set to the rising sign of the chart just cast (through EmailOctopus's own
     options, so its form registers the choice).
   Bri, 6 Nov 2026: after a successful sign-up the form starts over, empty, so the next person (a friend on the same
   phone) can sign up too. EmailOctopus's form can't be cleared from outside (its dropdown keeps the sign), so the card
   draws a fresh copy of the form and keeps EmailOctopus's success message above it until someone starts typing. */
(function () {
  'use strict';
  var SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  var rising = null;
  var FORM_ID = '246a440a-d889-11f1-b4fe-036fb995253d';   // the EmailOctopus form "Basic" (same as src/partials/signup.html)

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
    watchDone(box);
    if (settle(box)) return;
    var mo = new MutationObserver(function () { if (settle(box)) mo.disconnect(); });
    mo.observe(box, { childList: true, subtree: true });
    setTimeout(function () { mo.disconnect(); }, 30000);
  }

  // EmailOctopus writes its success message into this paragraph once a sign-up goes through
  function doneText(box) {
    var p = box.querySelector('.emailoctopus-success-message:not(.su-done)');
    return p ? p.textContent.trim() : '';
  }

  function watchDone(box) {
    if (box._suDone) return;
    box._suDone = new MutationObserver(function () {
      var msg = doneText(box);
      if (!msg) return;
      box._suDone.disconnect(); box._suDone = null;
      fresh(box, msg);
    });
    box._suDone.observe(box, { childList: true, subtree: true, characterData: true });
  }

  // a clean copy of the form, with the success message kept on top
  function fresh(box, msg) {
    var card = box.closest('.ophi-signup');
    var id = FORM_ID;
    var find = card.querySelector('.su-find');
    if (find) { find.classList.remove('su-in'); box.parentNode.insertBefore(find, box.nextSibling); }   // back to its spot in the card
    rising = null;                                    // the next person picks their own sign
    box.style.minHeight = box.offsetHeight + 'px';    // no jump while the new copy loads
    while (box.firstChild) box.removeChild(box.firstChild);
    var note = document.createElement('p');
    note.className = 'emailoctopus-success-message su-done';
    note.setAttribute('role', 'status');
    note.textContent = msg;
    box.appendChild(note);
    var s = document.createElement('script');
    s.async = true; s.src = 'https://eomail5.com/form/' + id + '.js'; s.setAttribute('data-form', id);
    box.appendChild(s);
    var gone = function () { if (note.parentNode) note.parentNode.removeChild(note); box.removeEventListener('input', gone); };
    box.addEventListener('input', gone);
    var ready = new MutationObserver(function () {
      if (!box.querySelector('.emailoctopus-form')) return;
      ready.disconnect(); box.style.minHeight = '';
    });
    ready.observe(box, { childList: true, subtree: true });
    setTimeout(function () { ready.disconnect(); box.style.minHeight = ''; }, 15000);
    watch(box);
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
