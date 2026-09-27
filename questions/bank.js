/* Puts the question files together. Load math.js and the subject
   files before this one. */
(function () {
  var SUBJECTS = [
    { id: "math", title: "Math", emoji: "🔢", about: "Numbers and operations." },
    { id: "verbal", title: "Verbal", emoji: "📚", about: "Reading, words, and reasoning." },
    { id: "english", title: "English", emoji: "✏️", about: "Spelling and grammar." },
    { id: "hebrew", title: "Hebrew", emoji: "א", about: "Letters, nikud, words, and sentences." },
    { id: "russian", title: "Russian", emoji: "А", about: "Letters, words, and sentences." },
    { id: "parsha", title: "Parsha", emoji: "📜", about: "Torah stories and holidays." }
  ];

  function lists() {
    return {
      verbal: window.Q_VERBAL || [],
      english: window.Q_ENGLISH || [],
      hebrew: window.Q_HEBREW || [],
      russian: window.Q_RUSSIAN || [],
      parsha: window.Q_PARSHA || []
    };
  }

  function closest(items, level, avoid) {
    var unused = items.filter(function (item) { return !avoid[item.id]; });
    if (!unused.length) unused = items.slice();
    var best = null;
    var bestGap = 99;
    unused.forEach(function (item) {
      var gap = Math.abs(item.level - level);
      if (gap < bestGap) bestGap = gap;
    });
    return unused.filter(function (item) { return Math.abs(item.level - level) === bestGap; });
  }

  function pick(subject, level, avoid, rng) {
    avoid = avoid || {};
    rng = rng || Math.random;
    level = Math.round(Number(level) || 1);
    if (subject === "math") return window.QMath.generateMath(level, rng, avoid);
    var pool = closest(lists()[subject] || [], level, avoid);
    if (!pool.length) return null;
    return pool[Math.floor(rng() * pool.length)];
  }

  window.QuestionBank = {
    subjects: SUBJECTS,
    lists: lists,
    pick: pick
  };
})();
