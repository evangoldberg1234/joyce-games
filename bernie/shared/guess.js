/* A wrong tap greys that choice. The part is still earned when he
   then taps the right one. A second tap on a finished round does nothing. */
(function (root) {
  function createState() {
    return { round: openRound() };
  }

  function openRound() {
    return { done: false };
  }

  function nextQuestion(state) {
    state.round = openRound();
  }

  function answer(state, correct) {
    var round = state.round;
    if (round.done) {
      return {
        ignore: true,
        earned: false,
        cooldown: false,
        greyChoice: false,
        wrong: false,
        say: "",
        revoke: false
      };
    }
    if (!correct) {
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
    round.done = true;
    return {
      ignore: false,
      earned: true,
      cooldown: false,
      greyChoice: false,
      wrong: false,
      say: "Yes!",
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
