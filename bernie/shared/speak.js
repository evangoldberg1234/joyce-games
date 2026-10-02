/* Read a line aloud. Speech stays off until the first tap,
   because iOS only allows speechSynthesis after a user gesture. */
(function (root) {
  var armed = false;

  function arm() {
    armed = true;
  }

  function isArmed() {
    return armed;
  }

  function lines(list) {
    if (!armed || !list || !list.length) return;
    var synth = root.speechSynthesis;
    if (!synth || typeof root.SpeechSynthesisUtterance !== "function") return;
    try {
      synth.cancel();
      if (synth.paused && synth.resume) synth.resume();
      list.forEach(function (text) {
        if (!text) return;
        var utter = new root.SpeechSynthesisUtterance(text);
        utter.lang = "en-US";
        utter.rate = 0.92;
        synth.speak(utter);
      });
    } catch (err) {
      /* A missing voice still leaves the buttons on screen. */
    }
  }

  function speak(text) {
    lines([text]);
  }

  root.BernieSpeak = {
    arm: arm,
    isArmed: isArmed,
    speak: speak,
    lines: lines
  };
})(typeof window !== "undefined" ? window : global);
