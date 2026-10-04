/* A wrong tap greys that one choice. The part is earned only on the first try.
   Taps are never blocked, and a part he already earned stays earned. */
(function (root) {
  function createState() {
    return { round: openRound() };
  }

  function openRound() {
    return { missed: false };
  }

  function nextQuestion(state) {
    state.round = openRound();
  }

  /* correct is whether this tap is the right answer. */
  function answer(state, correct) {
    var round = state.round;
    if (!correct) {
      round.missed = true;
      return {
        ignore: false,
        earned: false,
        cooldown: false,
        greyChoice: true,
        wrong: true,
        say: "Try again",
        revoke: false
      };
    }
    var earned = !round.missed;
    return {
      ignore: false,
      earned: earned,
      cooldown: false,
      greyChoice: false,
      wrong: false,
      say: earned ? "Yes!" : "",
      revoke: false
    };
  }

  var api = {
    createState: createState,
    nextQuestion: nextQuestion,
    answer: answer
  };

  if (typeof module === "object" && module.exports) module.exports = api;
  root.BernieGuess = api;
})(typeof window !== "undefined" ? window : global);
