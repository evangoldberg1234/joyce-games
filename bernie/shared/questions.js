/* The build is the game. Six loader parts, in the order they go on.
   Each turn offers the next part plus two others. No animals, no counting. */
(function (root) {
  var ORDER = [
    { id: "rear-wheel", name: "rear wheel" },
    { id: "front-wheel", name: "front wheel" },
    { id: "engine", name: "engine" },
    { id: "cab", name: "cab" },
    { id: "arms", name: "arms" },
    { id: "bucket", name: "bucket" }
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

  function pair(rng, pool, salt) {
    var shift = (Math.floor(rng() * pool.length) + salt) % pool.length;
    var first = pool[shift];
    var hop = 1 + Math.floor(rng() * (pool.length - 1));
    var second = pool[(shift + hop) % pool.length];
    if (second === first) second = pool[(shift + 1) % pool.length];
    return [first, second];
  }

  var WHEEL_MATE = { "rear-wheel": "front-wheel", "front-wheel": "rear-wheel" };

  /* Distractors come from the whole loader. Parts already on the machine
     are used only when two fresh ones are not left. A wheel question
     never offers the other wheel, so it is not a coin flip. */
  function poolFor(index) {
    var answer = ORDER[index];
    var mate = WHEEL_MATE[answer.id];
    var fresh = [];
    var older = [];
    var i;
    for (i = 0; i < ORDER.length; i++) {
      if (ORDER[i].id === answer.id) continue;
      if (mate && ORDER[i].id === mate) continue;
      if (i > index) fresh.push(ORDER[i]);
      else older.push(ORDER[i]);
    }
    if (fresh.length >= 2) return fresh;
    return fresh.concat(older);
  }

  function makeRound(rng, index, previousKey) {
    var random = rng || Math.random;
    var answer = ORDER[index];
    var pool = poolFor(index);
    var tries = 0;
    var round;
    do {
      var picked = pair(random, pool, tries);
      var choices = shuffle(random, [answer, picked[0], picked[1]]);
      var ids = [answer.id, picked[0].id, picked[1].id].slice().sort();
      round = {
        index: index,
        id: answer.id,
        name: answer.name,
        say: "Find the " + answer.name + "!",
        answer: answer.id,
        choices: choices.map(function (part) {
          return { id: part.id, name: part.name };
        }),
        key: ids.join("+")
      };
      tries += 1;
    } while (round.key === previousKey && tries < 8);
    return round;
  }

  function play(rng) {
    var random = rng || Math.random;
    var rounds = [];
    var prev = "";
    var i;
    for (i = 0; i < ORDER.length; i++) {
      var round = makeRound(random, i, prev);
      rounds.push(round);
      prev = round.key;
    }
    return rounds;
  }

  var api = {
    order: ORDER,
    makeRound: makeRound,
    play: play
  };

  if (typeof module === "object" && module.exports) module.exports = api;
  root.BernieQuestions = api;
})(typeof window !== "undefined" ? window : global);
