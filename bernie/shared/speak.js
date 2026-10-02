/* Read a line aloud. Speech stays off until the first tap,
   because iOS only allows speechSynthesis after a user gesture.
   Prefer a natural en-US voice. If the list is empty, wait for voiceschanged. */
(function (root) {
  var armed = false;
  var KEYS = ["natural", "enhanced", "premium", "samantha", "google"];

  function arm() {
    armed = true;
  }

  function isArmed() {
    return armed;
  }

  function score(voice) {
    var lang = String(voice.lang || "").replace("_", "-").toLowerCase();
    var name = String(voice.name || "").toLowerCase();
    var us = lang.indexOf("en-us") === 0;
    var en = us || lang === "en" || lang.indexOf("en-") === 0;
    var i;
    if (us) {
      for (i = 0; i < KEYS.length; i++) {
        if (name.indexOf(KEYS[i]) !== -1) return i;
      }
      return 10;
    }
    if (en) return 20;
    return 100;
  }

  function pickVoice(voices) {
    var best = null;
    var bestScore = 100;
    var i;
    for (i = 0; i < voices.length; i++) {
      var rank = score(voices[i]);
      if (rank < bestScore) {
        bestScore = rank;
        best = voices[i];
      }
    }
    return best;
  }

  function utter(synth, text, voice) {
    var said = new root.SpeechSynthesisUtterance(text);
    said.lang = voice && voice.lang ? voice.lang : "en-US";
    said.rate = 0.85;
    if (voice) said.voice = voice;
    synth.speak(said);
  }

  function run(synth, list) {
    var voices = synth.getVoices ? synth.getVoices() : [];
    var voice = pickVoice(voices || []);
    synth.cancel();
    if (synth.paused && synth.resume) synth.resume();
    list.forEach(function (text) {
      if (text) utter(synth, text, voice);
    });
  }

  function lines(list) {
    if (!armed || !list || !list.length) return;
    var synth = root.speechSynthesis;
    if (!synth || typeof root.SpeechSynthesisUtterance !== "function") return;
    var ready = synth.getVoices ? synth.getVoices() : [];
    if (ready && ready.length) {
      try { run(synth, list); } catch (err) { /* Buttons still work. */ }
      return;
    }

    var finished = false;
    function later() {
      if (finished) return;
      var now = synth.getVoices ? synth.getVoices() : [];
      if (!now || !now.length) return;
      finished = true;
      if (synth.removeEventListener) synth.removeEventListener("voiceschanged", later);
      try { run(synth, list); } catch (err) { /* Buttons still work. */ }
    }
    if (synth.addEventListener) synth.addEventListener("voiceschanged", later);
    root.setTimeout(function () {
      if (finished) return;
      finished = true;
      if (synth.removeEventListener) synth.removeEventListener("voiceschanged", later);
      try { run(synth, list); } catch (err) { /* Buttons still work. */ }
    }, 700);
  }

  function speak(text) {
    lines([text]);
  }

  root.BernieSpeak = {
    arm: arm,
    isArmed: isArmed,
    speak: speak,
    lines: lines,
    pickVoice: pickVoice
  };
})(typeof window !== "undefined" ? window : global);
