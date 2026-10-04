/* ============================================================
   אמגושא · AMGU'SHA — the four loud games.
   Vanilla JS, no dependencies. Each game tells part of the story.
   Every timer is cleared on restart so games can't stack up.
   ============================================================ */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- shared timer bookkeeping ---------- */
  var timers = [];
  function every(ms, fn) { var t = setInterval(fn, ms); timers.push(t); return t; }
  function after(ms, fn) { var t = setTimeout(fn, ms); timers.push(t); return t; }
  function clearAll() {
    timers.forEach(function (t) { clearInterval(t); clearTimeout(t); });
    timers = [];
  }

  var JACKAL = '<svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true">' +
    '<path d="M8 22 L14 6 L26 18 H38 L50 6 L56 22 V40 C56 52 45 60 32 60 C19 60 8 52 8 40 Z" ' +
    'fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>' +
    '<path d="M20 34 L27 40 M44 34 L37 40" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>' +
    '<circle cx="21" cy="28" r="3" fill="currentColor"/><circle cx="43" cy="28" r="3" fill="currentColor"/>' +
    '<path d="M26 48 L38 48" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>';

  /* ============================================================
     1. מלחמת הלינקס — whack the jackals, spare the lynx
     ============================================================ */
  (function whack() {
    var board = $('whack-board'), scoreEl = $('whack-score'), timeEl = $('whack-time');
    var outEl = $('whack-out'), btn = $('whack-start');
    var HOLES = 9, SECONDS = 20;
    var score = 0, left = SECONDS, running = false;

    // build the holes once
    for (var i = 0; i < HOLES; i++) {
      var h = document.createElement('button');
      h.type = 'button';
      h.className = 'whack__hole';
      h.setAttribute('aria-label', 'בור ' + (i + 1));
      h.innerHTML = '<span class="whack__mound"></span><span class="whack__critter"></span>';
      board.appendChild(h);
    }
    var holes = [].slice.call(board.children);

    function reset() {
      clearAll();
      score = 0; left = SECONDS; running = false;
      scoreEl.textContent = '0';
      timeEl.textContent = SECONDS;
      holes.forEach(function (h) { h.classList.remove('is-up', 'is-hit'); h.innerHTML = '<span class="whack__mound"></span><span class="whack__critter"></span>'; });
      outEl.textContent = 'הלינקס ממתינה. יש לך 20 שניות.';
    }

    function pop() {
      if (!running) return;
      var free = holes.filter(function (h) { return !h.classList.contains('is-up'); });
      if (!free.length) return;
      var h = free[Math.floor(Math.random() * free.length)];
      // 1-in-4 the lynx — never hit her
      var isLynx = Math.random() < 0.25;
      h.dataset.lynx = isLynx ? '1' : '';
      h.querySelector('.whack__critter').innerHTML = isLynx
        ? '<img src="assets/lynx-head.png" alt="" />'
        : '<span class="whack__jackal">' + JACKAL + '</span>';
      h.classList.add('is-up');
      after(isLynx ? 1100 : 850, function () {
        h.classList.remove('is-up');
        h.innerHTML = '<span class="whack__mound"></span><span class="whack__critter"></span>';
      });
    }

    board.addEventListener('click', function (e) {
      var h = e.target.closest('.whack__hole');
      if (!h || !running || !h.classList.contains('is-up')) return;
      if (h.dataset.lynx === '1') {
        score -= 3; if (score < 0) score = 0;
        h.classList.add('is-hit');
        outEl.textContent = 'זו הייתה הלינקס. ביי. ענשת אותה בכינור וב״כ יש לך -3.';
        board.classList.add('shake');
        after(400, function () { board.classList.remove('shake'); });
      } else {
        score += 1;
        h.classList.add('is-hit');
        outEl.textContent = 'צבי. אחד ירד מהגבעה. נשארו לך ' + left + ' שניות.';
      }
      scoreEl.textContent = score;
    });

    btn.addEventListener('click', function () {
      reset();
      running = true;
      btn.textContent = 'מלחמה';
      outEl.textContent = 'הצביים עולים. תכו רק בצביים.';
      pop();
      every(900, pop);
      every(1000, function () {
        left -= 1;
        timeEl.textContent = left;
        if (left <= 0) {
          running = false;
          clearAll();
          holes.forEach(function (h) { h.classList.remove('is-up'); });
          btn.textContent = 'עוד סבב';
          var verdict = score >= 25 ? 'הלינקס חייכה. אתה ראוי למדד.'
            : score >= 12 ? 'הצביים נסוגו. הלינקס קיבלה את זה כהערכה.'
            : 'הצביים נשארו. קח לך מזל ונסה שוב.';
          outEl.textContent = 'סיום. ניקוד ' + score + '. ' + verdict;
        }
      });
    });
  })();

  /* ============================================================
     2. מכונת השמשה — stop the needle in the sweet spot
     ============================================================ */
  (function mash() {
    var track = $('mash-track'), needle = $('mash-needle'), fill = $('mash-fill');
    var roundEl = $('mash-round'), gravEl = $('mash-gravity');
    var outEl = $('mash-out'), btn = $('mash-start');
    var ROUNDS = 7;
    var round = 0, gravity = 1.000, pos = 0, dir = 1, running = false;

    function zone() {
      // shrinking target as the batch progresses
      var w = 0.30 - round * 0.03;
      var center = 0.42 + (round % 3) * 0.08;
      return { lo: center - w / 2, hi: center + w / 2, w: w };
    }

    function reset() {
      clearAll();
      round = 0; gravity = 1.000; pos = 0; dir = 1; running = false;
      needle.style.insetInlineStart = '0%';
      fill.style.height = '0%';
      roundEl.textContent = '0';
      gravEl.textContent = '1.000';
      outEl.textContent = 'הכד ריק. השמשה ריקה. בואו נראה מה יצא.';
    }

    function place(z) {
      // the zone shrinks each round — style it live
      var pct = function (v) { return (v * 100).toFixed(1) + '%'; };
      track.querySelector('.mash__zone').style.insetInlineStart = pct(z.lo);
      track.querySelector('.mash__zone').style.width = pct(z.w);
    }

    function step() {
      if (!running) return;
      var speed = 0.012 + round * 0.0028;
      pos += dir * speed;
      if (pos > 1) { pos = 1; dir = -1; }
      if (pos < 0) { pos = 0; dir = 1; }
      needle.style.insetInlineStart = (pos * 100).toFixed(1) + '%';
    }

    btn.addEventListener('click', function (e) {
      if (running) {
        // lock in the current mash
        var z = zone();
        var center = (z.lo + z.hi) / 2;
        var off = Math.abs(pos - center);
        var hit = off <= z.w / 2;
        round += 1;
        var gained = hit ? (0.055 - off * 0.12) : 0.004;
        gravity = Math.min(1.200, gravity + Math.max(gained, 0));
        gravEl.textContent = gravity.toFixed(3);
        roundEl.textContent = round;
        fill.style.height = Math.round(((gravity - 1) / 0.2) * 100) + '%';
        outEl.textContent = hit
          ? (off < z.w / 6 ? 'מושלם. השמשה נשברה כמו שצריך.' : 'סביר. הכד קיבל את זה.')
          : 'פספסת. הכד קיבל מים אפורים ושנאה.';
        if (round >= ROUNDS) {
          running = false;
          clearAll();
          btn.textContent = 'משמעת חדשה';
          var g = gravity.toFixed(3);
          var v = gravity >= 1.13 ? 'צפיפות ' + g + '. זה כבר לא בירה, זה אירוע.'
            : gravity >= 1.07 ? 'צפיפות ' + g + '. בירה רצויה. הלינקס מנעורת.'
            : 'צפיפות ' + g + '. שבלים עם קירור. ביש. בכל מקרה — שתו את זה.';
          outEl.textContent = 'סיום. ' + v;
        }
        return;
      }
      reset();
      running = true;
      btn.textContent = 'עצור!';
      place(zone());
      after(reduceMotion ? 0 : 40, function () { every(reduceMotion ? 0 : 40, step); });
      outEl.textContent = 'סבב 1. עצור באזור הירוק — אפשר לחוץ על "עצור!" כל פעם.';
    });
  })();

  /* ============================================================
     3. כמה בירה אתה? — a quiz with no right answers
     ============================================================ */
  (function quiz() {
    var board = $('quiz-board'), outEl = $('quiz-out'), btn = $('quiz-start');
    // answer key -> the Hebrew letter shown to the player
    var KEYS = [
      { key: 'a', label: 'א' },
      { key: 'b', label: 'ב' },
      { key: 'c', label: 'ג' },
      { key: 'd', label: 'ד' }
    ];

    // Six questions, four answers each. `a`/`b`/`c`/`d` is the letter the
    // answer votes for. Options are shuffled per question so the letter
    // never sits in the same place twice.
    var Q = [
      {
        q: 'איך נראה סוף השבוע האידיאלי שלך?',
        a: {
          a: 'טיול ארוך בטבע, שקט, לברוח מהעיר ומהרעש.',
          b: 'מסיבה טובה עם חברים — הרבה אנשים, מוזיקה ואנרגיה גבוהה.',
          c: 'רביצה בבית מול סדרה טובה או משחק מחשב, עם פיצה חמה.',
          d: 'לשבת בפאב שכונתי עם חבר טוב ולחשוב על החיים.'
        }
      },
      {
        q: 'מה הגישה שלך כשאתה צריך החלטה גדולה בחיים?',
        a: {
          a: 'זורם עם מה שקורה, סומך על הלב ורואה לאן הרוח תיקח אותי.',
          b: 'מתכנן הכל מראש קלה כחמורה, עושה טבלאות אקסל ובודק סיכונים.',
          c: 'שואל את כל החברים והמשפחה, ואז עושה מה שבא לי.',
          d: 'הולך על האופציה הכי מקורית, נועזת ולא שגרתית שיש.'
        }
      },
      {
        q: 'איזו מוזיקה תשים ברקע כשאתה נוסע באוטו?',
        a: {
          a: 'רוק כבד או מטאל שיעשה פה בלאגן וירים את האנרגיה.',
          b: 'מוזיקה קלאסית, ג׳אז רגוע או פודקאסט מעניין שמעביר את הזמן בשקט.',
          c: 'פופ קצבי ומשמח שכולם מכירים ויכולים לזמזם איתך.',
          d: 'מוזיקה שחורה, היפ-הופ או אלקטרוני עם באסים עמוקים.'
        }
      },
      {
        q: 'איך החברים שלך היו מתארים אותך במשפט אחד?',
        a: {
          a: '"החבר הנאמן שתמיד אפשר לסמוך עליו שיהיה שם כשצריך."',
          b: '"הנשמה של החבורה — זה שתמיד מצחיק ודואג שכולם יחייכו."',
          c: '"הראש השקט והחכם שיודע לפתור כל בעיה בהיגיון."',
          d: '"ההרפתקן הספונטני שתמיד ממציא רעיונות משוגעים."'
        }
      },
      {
        q: 'מה הדרך המועדפת עליך להתמודד עם יום ארוך ומעייף במיוחד?',
        a: {
          a: 'מקלחת טובה, פיג׳מה ולישון מוקדם בלי לחשוב יותר מדי.',
          b: 'להדליק על האש ולהכין ארוחה רצינית שתפנק את כולם.',
          c: 'אימון כוח קורע או ריצה, כדי לשחרר את כל האגרסיות.',
          d: 'לשבת במרפסת עם כוס משקה מול השקיעה ולא לדבר עם אף אחד שעה שלמה.'
        }
      },
      {
        q: 'נקלעת לאי בודד ויש לך רק פריט אחד לקחת. מה אתה בוחר?',
        a: {
          a: 'סכין שוויצרית רב-תכליתית. כי אי אפשר לדעת מה יקרה.',
          b: 'מערכת שמע חזקה עם אלף שירים אהובים.',
          c: 'ספר עבה במיוחד שלא נגמר לעולם.',
          d: 'חכה טובה, כדי לתפוס ארוחת ערב כמו שצריך.'
        }
      }
    ];

    var RESULTS = {
      a: {
        t: 'אתה בירת חיטה מרעננת',
        beer: 'WHEAT',
        d: 'אתה אדם של שקט, מרחבים וטבע. אתה יודע לקחת את הזמן ולא נותן ללחץ היומי לשבור אותך. אתה מחפש פשטות איכותית ויודע להעריך את הרגעים הקטנים בחיים.',
        f: 'החברים אומרים עליך: אתה האיש היציב שאפשר תמיד לברוח איתו מהבלגן של העיר.'
      },
      b: {
        t: 'אתה לאגר קליל וזורם',
        beer: 'LAGER',
        d: 'אתה הנשמה של כל חבורה. חברותי, ספונטני, זורם עם מה שבא — ומכניס אנרגיה טובה לכל מקום שאתה מגיע אליו. אתה לא עושה עניין גדול מדברים ומעדיף ליהנות מהחיים.',
        f: 'החברים אומרים עליך: שבלעדיך המסיבה או המפגש פשוט משעממים.'
      },
      c: {
        t: 'אתה לילה שחור',
        beer: 'STOUT',
        d: 'יש לך עומק פנימי רציני. אתה אדם חושב, מעדיף את השקט והפינה שלך על פני המולה מיותרת, ויש לך עולם פנימי עשיר. אתה אוהב דברים אמיתיים בלי זיופים, ומעריך עומק ואיכות.',
        f: 'החברים אומרים עליך: אתה האדם הכי אמין וחכם ששווה להתייעץ איתו כשצריך עצה אמיתית.'
      },
      d: {
        t: 'אתה אמגושה קשוחה',
        beer: 'IPA',
        d: 'אתה טיפוס נועז, שאוהב בועט, לא שגרתי ולא מפחד ללכת נגד הזרם. יש לך טעם ייחודי משלך, ואתה אוהב את החיים שלך עם קצב, עניין ואופי חזק.',
        f: 'החברים אומרים עליך: אתה אף פעם לא משעמם, ותמיד מפתיע ברעיונות מקוריים.'
      }
    };

    // On a tie the deepest wins — it fits the brand and keeps the result
    // deterministic instead of depending on answer order.
    var TIEBREAK = ['c', 'd', 'a', 'b'];

    var i = 0, tally = { a: 0, b: 0, c: 0, d: 0 };

    function render(html) { board.innerHTML = html; }

    // Fisher-Yates, so the letter position changes every run.
    function shuffled(obj) {
      var keys = KEYS.slice();
      for (var j = keys.length - 1; j > 0; j--) {
        var k = Math.floor(Math.random() * (j + 1));
        var tmp = keys[j]; keys[j] = keys[k]; keys[k] = tmp;
      }
      return keys.map(function (o) {
        return { letter: o.key, label: o.label, text: obj[o.key] };
      });
    }

    function ask() {
      if (i >= Q.length) return finish();
      var item = Q[i];
      var html = '<p class="quiz__q"><span class="quiz__n">שאלה ' + (i + 1) + '/' + Q.length + '</span>' + item.q + '</p>' +
        '<div class="quiz__opts">';
      shuffled(item.a).forEach(function (opt) {
        html += '<button type="button" class="quiz__opt" data-l="' + opt.letter + '">' +
          '<span class="quiz__mark">' + opt.label + '</span>' + opt.text + '</button>';
      });
      html += '</div>';
      render(html);
      outEl.textContent = 'אין תשובה נכונה. יש רק תוצאה.';
    }

    function finish() {
      var best = TIEBREAK[0], bestN = -1;
      TIEBREAK.forEach(function (L) {
        if (tally[L] > bestN) { bestN = tally[L]; best = L; }
      });
      var r = RESULTS[best];
      var tied = TIEBREAK.filter(function (L) { return tally[L] === bestN; });

      var html = '<p class="quiz__q"><span class="quiz__n">התוצאה שלך</span>' + r.t +
        '</p><p class="quiz__beer">' + r.beer + '</p><p class="quiz__d">' + r.d +
        '</p><p class="quiz__friends">' + r.f + '</p>';

      if (tied.length > 1) html += '<p class="quiz__tie">פער אחד, והוא נגדך. הלינקס פסקה לטובת ' +
        r.beer + '.</p>';

      html += '<p class="quiz__score">' +
        KEYS.map(function (o) { return o.label + '׳ ' + tally[o.key]; }).join(' · ') + '</p>';

      render(html);
      outEl.textContent = 'שש שאלות, אפס תשובות נכונות, בירה אחת. ' +
        (tied.length > 1 ? 'הצבע שלך היה כמעט שווה.' : 'הצבע שלך לא היה כמעט.');
      btn.textContent = 'שאלות אחרות';
    }

    board.addEventListener('click', function (e) {
      var b = e.target.closest('.quiz__opt');
      if (!b || i >= Q.length) return;
      tally[b.dataset.l] += 1;
      i += 1;
      ask();
    });

    btn.addEventListener('click', function () {
      i = 0;
      tally = { a: 0, b: 0, c: 0, d: 0 };
      btn.textContent = 'מחדש';
      ask();
    });
  })();

  /* ============================================================
     4. חוזה הלינקס — hold to stamp the contract
     ============================================================ */
  (function contract() {
    var board = $('contract-board'), linesEl = $('contract-lines'), seal = $('contract-seal');
    var outEl = $('contract-out'), reset = $('contract-reset');
    var LINES = [
      'סעיף 1: הלינקס רואה הכול. אתה לא.',
      'סעיף 2: כל בירה שנמכרה כאן נולדה בספסד.',
      'סעיף 3: מותר לבקש כד. אסור לבקש כוס.',
      'סעיף 4: הפצה בדרך חייבת להיות לצד אדם.',
      'סעיף 5: אין תאריך תפוגה. היא כאן לפני שאתה ואחריך.',
      'סעיף 6: חתימה זו נכרעת. חתימתך — אתה רק צריך לדרוך עליה.'
    ];

    var shown = 0, holding = false, holdT = null, raf = null;

    function paint() {
      var html = '';
      for (var k = 0; k < LINES.length; k++) {
        html += '<p class="contract__line' + (k < shown ? ' is-on' : '') + '">' + LINES[k] + '</p>';
      }
      linesEl.innerHTML = html;
    }

    function stamp() {
      shown = LINES.length;
      paint();
      seal.classList.add('is-stamped');
      outEl.textContent = 'נחתם. התאריך: עכשיו. מאז 2019 הוא היה סוד. החתימה שלך נשארה פחוחה.';
      clearAll();
      holding = false;
    }

    function startHold(e) {
      if (e && e.type === 'click') return; // keyboard click shouldn't require a hold
      if (shown >= LINES.length) return;
      e.preventDefault();
      holding = true;
      seal.classList.add('is-holding');
      var t0 = Date.now();
      var tick = function () {
        if (!holding) return;
        var pct = Math.min(1, (Date.now() - t0) / 1400);
        seal.style.setProperty('--fill', (pct * 100).toFixed(0) + '%');
        if (pct >= 1) { stamp(); return; }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }

    function endHold() {
      if (!holding) return;
      holding = false;
      seal.classList.remove('is-holding');
      if (raf) cancelAnimationFrame(raf);
      seal.style.setProperty('--fill', '0%');
      // partial hold reveals at least one more line — progress is never wasted
      if (shown < LINES.length) {
        shown += 1;
        paint();
        outEl.textContent = 'חלק מהחוזה נחשף. החתיקה השמאלית נדרשת.';
      }
    }

    seal.addEventListener('mousedown', startHold);
    seal.addEventListener('touchstart', startHold, { passive: false });
    window.addEventListener('mouseup', endHold);
    window.addEventListener('touchend', endHold);
    // keyboard / screen-reader path: no hold required
    seal.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); stamp(); }
    });

    reset.addEventListener('click', function () {
      shown = 0; holding = false;
      clearAll();
      if (raf) cancelAnimationFrame(raf);
      seal.classList.remove('is-stamped', 'is-holding');
      seal.style.setProperty('--fill', '0%');
      paint();
      outEl.textContent = 'החתימה כבר שם מאז 2019. אתה רק צריך לעקוף אותה.';
    });

    paint();
  })();
})();
