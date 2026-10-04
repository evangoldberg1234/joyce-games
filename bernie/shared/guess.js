/* First-try parts, and a short pause when a guess is too fast or twice wrong.
   A future car build uses the same rules. */
(function (root) {
  var LISTEN_MS = 1000;
  var COOLDOWN_MS = 3000;
  var WRONG_STREAK = 2;

  function createState(now) {
    return {
      wrongStreak: 0,
      round: openRound(now)
    };
  }

  function openRound(now) {
    return {
      appearedAt: now,
      spokenAt: null,
      speaking: false,
      speechKnown: false,
      missed: false,
      cooling: false,
      released: false
    };
  }

  /* A new question keeps the wrong streak, and does not forget earned parts. */
  function nextQuestion(state, now) {
    state.round = openRound(now);
  }

  function noteSpeechStarted(state) {
    state.round.speaking = true;
    state.round.speechKnown = true;
    if (!state.round.released) state.round.spokenAt = null;
  }

  function noteSpoken(state, now) {
    state.round.speaking = false;
    state.round.speechKnown = true;
    if (!state.round.released) state.round.spokenAt = now;
  }

  function noteSpeechUnavailable(state) {
    state.round.speaking = false;
    if (state.round.released) return;
    state.round.speechKnown = false;
    state.round.spokenAt = null;
  }

  function tooSoon(round, now) {
    if (round.released) return false;
    if (round.speaking) return true;
    if (round.speechKnown && round.spokenAt != null) return now < round.spokenAt + LISTEN_MS;
    return now < round.appearedAt + LISTEN_MS;
  }

  /* The pause already cost him the rush. The re-read must not start another one,
     and the wrong streak starts over so the next guess is a normal guess. */
  function endCooldown(state, now) {
    state.wrongStreak = 0;
    state.round.cooling = false;
    state.round.released = true;
    state.round.appearedAt = now;
    state.round.speaking = false;
    state.round.speechKnown = true;
    state.round.spokenAt = now - LISTEN_MS;
  }

  /* correct is whether this tap is the right answer. */
  function answer(state, correct, now) {
    var round = state.round;
    if (round.cooling) {
      return { ignore: true, earned: false, cooldown: false, greyChoice: false, wrong: false, say: "", revoke: false };
    }
    if (tooSoon(round, now)) {
      round.cooling = true;
      return { ignore: false, earned: false, cooldown: true, greyChoice: false, wrong: false, say: "Listen first", revoke: false };
    }
    if (!correct) {
      state.wrongStreak += 1;
      round.missed = true;
      var streak = state.wrongStreak >= WRONG_STREAK;
      if (streak) round.cooling = true;
      return {
        ignore: false,
        earned: false,
        cooldown: streak,
        greyChoice: true,
        wrong: true,
        say: streak ? "Listen first" : "Try again",
        revoke: false
      };
    }
    var earned = !round.missed;
    state.wrongStreak = 0;
    return { ignore: false, earned: earned, cooldown: false, greyChoice: false, wrong: false, say: earned ? "Yes!" : "", revoke: false };
  }

  var api = {
    LISTEN_MS: LISTEN_MS,
    COOLDOWN_MS: COOLDOWN_MS,
    WRONG_STREAK: WRONG_STREAK,
    createState: createState,
    nextQuestion: nextQuestion,
    noteSpeechStarted: noteSpeechStarted,
    noteSpoken: noteSpoken,
    noteSpeechUnavailable: noteSpeechUnavailable,
    endCooldown: endCooldown,
    answer: answer
  };

  if (typeof module === "object" && module.exports) module.exports = api;
  root.BernieGuess = api;
})(typeof window !== "undefined" ? window : global);
