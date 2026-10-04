/* אמגושא · AMGU'SHA — gate + footer year. */
(function () {
  'use strict';

  var KEY = 'amgusha.age.ok';
  var gate = document.getElementById('agegate');
  var body = document.body;

  function unlock() {
    gate.hidden = true;
    body.classList.remove('age-lock');
    try { localStorage.setItem(KEY, '1'); } catch (e) {}
  }

  function locked() {
    try { return localStorage.getItem(KEY) !== '1'; } catch (e) { return true; }
  }

  if (!locked()) {
    gate.hidden = true;
    body.classList.remove('age-lock');
  }

  var yes = document.getElementById('age-yes');
  var no = document.getElementById('age-no');

  if (yes) yes.addEventListener('click', unlock);

  // גם השקרן נכנס — אבל הלינקס זוכרת.
  if (no) {
    no.addEventListener('click', function () {
      unlock();
      no.textContent = 'נכנסת. הלינקס זוכרת אותך.';
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !gate.hidden) unlock();
  });

  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
