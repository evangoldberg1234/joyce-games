/* Question bank and generator for Bernie's build-a-vehicle games.
   No DOM. A picture to find, or rocks to count. Never an isolated letter. */
(function (root) {
  var WORDS = [
    { word: "moose", emoji: "🫎" },
    { word: "cat", emoji: "🐱" },
    { word: "ball", emoji: "⚽" },
    { word: "truck", emoji: "🚚" },
    { word: "dog", emoji: "🐶" },
    { word: "sun", emoji: "☀️" },
    { word: "fish", emoji: "🐟" },
    { word: "bus", emoji: "🚌" },
    { word: "pig", emoji: "🐷" },
    { word: "duck", emoji: "🦆" },
    { word: "rabbit", emoji: "🐰" },
    { word: "lion", emoji: "🦁" },
    { word: "monkey", emoji: "🐵" },
    { word: "apple", emoji: "🍎" },
    { word: "egg", emoji: "🥚" },
    { word: "hat", emoji: "🎩" },
    { word: "car", emoji: "🚗" },
    { word: "van", emoji: "🚐" },
    { word: "zebra", emoji: "🦓" },
    { word: "cow", emoji: "🐮" },
    { word: "bear", emoji: "🐻" },
    { word: "frog", emoji: "🐸" },
    { word: "tiger", emoji: "🐯" },
    { word: "owl", emoji: "🦉" },
    { word: "kite", emoji: "🪁" },
    { word: "leaf", emoji: "🍃" },
    { word: "moon", emoji: "🌙" },
    { word: "sock", emoji: "🧦" },
    { word: "tree", emoji: "🌳" },
    { word: "nest", emoji: "🪺" }
  ];

  var BANNED = ["knife", "giraffe", "gnome", "phone", "cereal", "ship", "chair"];

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

  function pickSome(rng, pool, answer, count) {
    var chosen = [answer];
    var start = Math.floor(rng() * pool.length);
    var i = 0;
    while (chosen.length < count && i < pool.length) {
      var item = pool[(start + i) % pool.length];
      if (chosen.indexOf(item) === -1) chosen.push(item);
      i += 1;
    }
    return shuffle(rng, chosen);
  }

  function numberButtons(list) {
    return list.map(function (item) {
      return { id: String(item), label: String(item) };
    });
  }

  function pictureButtons(list) {
    return list.map(function (item) {
      return { id: item.word, label: item.emoji };
    });
  }

  var lastKey = "";

  function questionKey(item) {
    return item.kind + ":" + (item.kind === "picture" ? item.word : item.rocks);
  }

  function makeQuestion(rng, kind) {
    var random = rng || Math.random;
    var item;
    var tries = 0;
    do {
      item = buildQuestion(random, kind);
      tries += 1;
    } while (questionKey(item) === lastKey && tries < 12);
    lastKey = questionKey(item);
    return item;
  }

  function buildQuestion(random, kind) {
    var which = kind || (random() < 0.5 ? "word" : "count");

    if (which === "count") {
      var rocks = 1 + Math.floor(random() * 10);
      var nums = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
      return {
        kind: "count",
        say: "How many rocks?",
        word: "",
        emoji: "",
        rocks: rocks,
        choices: numberButtons(pickSome(random, nums, String(rocks), 3)),
        answer: String(rocks)
      };
    }

    var item = WORDS[Math.floor(random() * WORDS.length)];
    var others = WORDS.filter(function (word) { return word.word !== item.word; });
    return {
      kind: "picture",
      say: "Find the " + item.word + "!",
      word: item.word,
      emoji: item.emoji,
      rocks: 0,
      choices: pictureButtons(pickSome(random, others, item, 3)),
      answer: item.word
    };
  }

  var api = {
    makeQuestion: makeQuestion,
    words: WORDS,
    banned: BANNED
  };

  if (typeof module === "object" && module.exports) module.exports = api;
  root.BernieQuestions = api;
})(typeof window !== "undefined" ? window : global);
