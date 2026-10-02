/* Question bank and generator for Bernie's build-a-vehicle games.
   No DOM. A future vehicle asks the same questions. */
(function (root) {
  var LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  /* Stable sounds a 4-year-old can hear. Speech says "buh", not the
     letter name, so "which letter makes the buh sound?" is the /b/ question. */
  var SOUNDS = [
    { letter: "B", say: "buh" },
    { letter: "M", say: "mmm" },
    { letter: "S", say: "sss" },
    { letter: "T", say: "tuh" },
    { letter: "P", say: "puh" },
    { letter: "D", say: "duh" },
    { letter: "F", say: "fff" },
    { letter: "N", say: "nnn" },
    { letter: "L", say: "lll" },
    { letter: "R", say: "rrr" },
    { letter: "K", say: "kuh" },
    { letter: "H", say: "huh" },
    { letter: "J", say: "juh" },
    { letter: "V", say: "vvv" },
    { letter: "W", say: "wuh" },
    { letter: "Z", say: "zzz" },
    { letter: "A", say: "ah" },
    { letter: "E", say: "eh" },
    { letter: "O", say: "aw" },
    { letter: "U", say: "uh" }
  ];

  function shuffle(rng, list) {
    var arr = list.slice();
    var i;
    for (i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  function pickThree(rng, pool, answer) {
    var chosen = [answer];
    var start = Math.floor(rng() * pool.length);
    var i = 0;
    while (chosen.length < 3 && i < pool.length) {
      var item = pool[(start + i) % pool.length];
      if (chosen.indexOf(item) === -1) chosen.push(item);
      i += 1;
    }
    return shuffle(rng, chosen);
  }

  function buttons(list) {
    return list.map(function (item) {
      return { id: String(item), label: String(item) };
    });
  }

  function makeQuestion(rng, kind) {
    var random = rng || Math.random;
    var kinds = ["letter", "sound", "match", "count"];
    var which = kind || kinds[Math.floor(random() * kinds.length)];

    if (which === "letter") {
      var letter = LETTERS[Math.floor(random() * LETTERS.length)];
      return {
        kind: "letter",
        say: "Tap the letter " + letter + ".",
        show: "",
        rocks: 0,
        choices: buttons(pickThree(random, LETTERS, letter)),
        answer: letter
      };
    }

    if (which === "sound") {
      var sound = SOUNDS[Math.floor(random() * SOUNDS.length)];
      var pool = SOUNDS.map(function (item) { return item.letter; });
      return {
        kind: "sound",
        say: "Which letter makes the " + sound.say + " sound?",
        show: "",
        rocks: 0,
        choices: buttons(pickThree(random, pool, sound.letter)),
        answer: sound.letter
      };
    }

    if (which === "match") {
      var upper = LETTERS[Math.floor(random() * LETTERS.length)];
      var lower = upper.toLowerCase();
      var lowers = LETTERS.map(function (item) { return item.toLowerCase(); });
      return {
        kind: "match",
        say: "Find the little " + lower + ".",
        show: upper,
        rocks: 0,
        choices: buttons(pickThree(random, lowers, lower)),
        answer: lower
      };
    }

    var rocks = 1 + Math.floor(random() * 10);
    var nums = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
    return {
      kind: "count",
      say: "How many rocks?",
      show: "",
      rocks: rocks,
      choices: buttons(pickThree(random, nums, String(rocks))),
      answer: String(rocks)
    };
  }

  var api = {
    makeQuestion: makeQuestion,
    sounds: SOUNDS
  };

  if (typeof module === "object" && module.exports) module.exports = api;
  root.BernieQuestions = api;
})(typeof window !== "undefined" ? window : global);
