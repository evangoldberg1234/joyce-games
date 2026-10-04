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

  var speakSerial = 0;
  var live = [];

  function hush(utterance) {
    if (!utterance) return;
    utterance.onend = null;
    utterance.onerror = null;
    utterance.silenced = true;
  }

  function utter(synth, text, voice, ondone) {
    var said = new root.SpeechSynthesisUtterance(text);
    said.lang = voice && voice.lang ? voice.lang : "en-US";
    said.rate = 0.85;
    if (voice) said.voice = voice;
    if (ondone) {
      var settled = false;
      function finish(ok) {
        if (settled) return;
        settled = true;
        ondone(ok);
      }
      said.onend = function () { finish(true); };
      said.onerror = function () { finish(false); };
    }
    synth.speak(said);
    return said;
  }

  function run(synth, list, onend) {
    var serial = ++speakSerial;
    var voices = synth.getVoices ? synth.getVoices() : [];
    var voice = pickVoice(voices || []);
    var texts = [];
    var i;
    for (i = 0; i < live.length; i++) hush(live[i]);
    live = [];
    for (i = 0; i < list.length; i++) {
      if (list[i]) texts.push(list[i]);
    }
    /* Unstick a paused engine, then drop the old queue. Resuming after
       cancel makes Chrome and iOS say the cancelled line again. */
    try {
      if (synth.paused && synth.resume) synth.resume();
    } catch (err) { /* a stuck engine should not block the next line */ }
    try { synth.cancel(); } catch (err2) { /* already quiet */ }
    if (serial !== speakSerial) return;
    if (!texts.length) {
      if (onend) onend(false);
      return;
    }
    function done(ok) {
      if (serial !== speakSerial) return;
      if (onend) onend(ok);
    }
    for (i = 0; i < texts.length; i++) {
      live.push(utter(synth, texts[i], voice, i === texts.length - 1 ? done : null));
    }
  }

  function lines(list, onend) {
    if (!armed || !list || !list.length) {
      if (onend) onend(false);
      return;
    }
    var synth = root.speechSynthesis;
    if (!synth || typeof root.SpeechSynthesisUtterance !== "function") {
      if (onend) onend(false);
      return;
    }
    var ready = synth.getVoices ? synth.getVoices() : [];
    if (ready && ready.length) {
      try { run(synth, list, onend); } catch (err) { if (onend) onend(false); }
      return;
    }

    var finished = false;
    function later() {
      if (finished) return;
      var now = synth.getVoices ? synth.getVoices() : [];
      if (!now || !now.length) return;
      finished = true;
      if (synth.removeEventListener) synth.removeEventListener("voiceschanged", later);
      try { run(synth, list, onend); } catch (err) { if (onend) onend(false); }
    }
    if (synth.addEventListener) synth.addEventListener("voiceschanged", later);
    root.setTimeout(function () {
      if (finished) return;
      finished = true;
      if (synth.removeEventListener) synth.removeEventListener("voiceschanged", later);
      try { run(synth, list, onend); } catch (err) { if (onend) onend(false); }
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
