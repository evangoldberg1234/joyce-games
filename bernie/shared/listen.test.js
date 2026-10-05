/* Nothing speaks or beeps unless the speaker button is tapped.
   A wrong photo shakes and shows a red X. The right photo still awards the part. */
var assert = require("assert");

var now = 10000;
var timers = [];
var nextTimer = 1;
var spoken = [];

function flush(until) {
  now = until;
  var guard = 0;
  while (guard++ < 40) {
    var due = timers.filter(function (timer) { return timer.at <= now; });
    if (!due.length) return;
    due.sort(function (a, b) { return a.at - b.at; });
    var next = due[0];
    timers = timers.filter(function (timer) { return timer !== next; });
    next.fn();
  }
  throw new Error("timers did not settle");
}

function installBrowser() {
  function Element(tag) {
    this.tagName = tag;
    this.children = [];
    this.className = "";
    this.hidden = false;
    this.disabled = false;
    this.textContent = "";
    this.style = {};
    this.dataset = {};
    this.parentNode = null;
    this.listeners = {};
    var self = this;
    this.classList = {
      add: function () {
        var parts = self.className.split(/\s+/).filter(Boolean);
        var i;
        for (i = 0; i < arguments.length; i++) {
          if (parts.indexOf(arguments[i]) === -1) parts.push(arguments[i]);
        }
        self.className = parts.join(" ");
      },
      remove: function () {
        var drop = Array.prototype.slice.call(arguments);
        self.className = self.className.split(/\s+/).filter(function (part) {
          return part && drop.indexOf(part) === -1;
        }).join(" ");
      },
      contains: function (name) {
        return self.className.split(/\s+/).indexOf(name) !== -1;
      }
    };
  }

  Element.prototype.setAttribute = function (name, value) {
    this[name] = value;
  };

  Element.prototype.addEventListener = function (type, fn) {
    (this.listeners[type] = this.listeners[type] || []).push(fn);
  };

  Element.prototype.appendChild = function (child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  };

  Element.prototype.insertBefore = function (child) {
    return this.appendChild(child);
  };

  Element.prototype.remove = function () {
    if (!this.parentNode) return;
    var kids = this.parentNode.children;
    var index = kids.indexOf(this);
    if (index !== -1) kids.splice(index, 1);
    this.parentNode = null;
  };

  Object.defineProperty(Element.prototype, "innerHTML", {
    set: function () {
      this.children = [];
    }
  });

  function walk(node, sel, out) {
    node.children.forEach(function (child) {
      if (child.classList && child.classList.contains(sel.slice(1))) out.push(child);
      walk(child, sel, out);
    });
  }

  Element.prototype.querySelector = function (sel) {
    var found = [];
    walk(this, sel, found);
    return found[0] || null;
  };

  Element.prototype.querySelectorAll = function (sel) {
    var found = [];
    walk(this, sel, found);
    return found;
  };

  Element.prototype.click = function () {
    if (this.disabled) return;
    this.poke();
  };

  Element.prototype.poke = function () {
    var fns = (this.listeners.click || []).slice();
    var i;
    for (i = 0; i < fns.length; i++) fns[i]({});
  };

  var body = new Element("body");
  global.document = {
    body: body,
    documentElement: body,
    createElement: function (tag) {
      return new Element(tag);
    },
    createElementNS: function () {
      return new Element("svg");
    },
    addEventListener: function () {},
    removeEventListener: function () {},
    querySelector: function (sel) {
      return body.querySelector(sel);
    },
    querySelectorAll: function (sel) {
      return body.querySelectorAll(sel);
    }
  };

  global.window = global;
  global.Date.now = function () { return now; };
  global.setTimeout = function (fn, ms) {
    var timer = { id: nextTimer++, at: now + (ms || 0), fn: fn };
    timers.push(timer);
    return timer.id;
  };
  global.clearTimeout = function (id) {
    timers = timers.filter(function (timer) { return timer.id !== id; });
  };
  global.matchMedia = function () {
    return { matches: false };
  };
  global.requestAnimationFrame = function (fn) {
    return global.setTimeout(fn, 0);
  };

  global.audioMade = 0;
  function AudioCtx() {
    global.audioMade += 1;
    this.currentTime = 0;
    this.destination = {};
    this.createOscillator = function () {
      return {
        type: "",
        frequency: { value: 0 },
        connect: function () {},
        start: function () {},
        stop: function () {}
      };
    };
    this.createGain = function () {
      return {
        connect: function () {},
        gain: {
          setValueAtTime: function () {},
          exponentialRampToValueAtTime: function () {}
        }
      };
    };
  }
  global.AudioContext = AudioCtx;
  global.webkitAudioContext = AudioCtx;

  function Utterance(text) {
    this.text = text;
    this.lang = "en-US";
    this.rate = 1;
    this.voice = null;
    this.onend = null;
    this.onerror = null;
    this.silenced = false;
  }
  global.SpeechSynthesisUtterance = Utterance;
  var stuck = null;
  global.speechSynthesis = {
    paused: false,
    getVoices: function () {
      return [{ name: "Samantha", lang: "en-US" }];
    },
    addEventListener: function () {},
    removeEventListener: function () {},
    speak: function (utterance) {
      spoken.push(utterance.text);
      stuck = utterance;
      this.paused = true;
      if (utterance.onend) utterance.onend();
    },
    cancel: function () {
      if (this.paused) return;
      var old = stuck;
      stuck = null;
      if (old && old.onerror) old.onerror();
    },
    resume: function () {
      this.paused = false;
      if (stuck && !stuck.silenced) spoken.push(stuck.text);
    }
  };
}

installBrowser();

var questions = require("./questions.js");
require("./guess.js");
require("./speak.js");
require("./build.js");
require("./drive.js");

assert.deepStrictEqual(global.BernieDrive.scoopSay(1, 3), ["1!"]);
assert.deepStrictEqual(global.BernieDrive.scoopSay(2, 3), ["2!"]);
assert.deepStrictEqual(global.BernieDrive.scoopSay(3, 3), ["3!", "You did it!"]);
assert.strictEqual(global.BernieDrive.scoops, 3);

var drove = false;
var mount = document.createElement("div");
document.body.appendChild(mount);
global.BernieBuild.start({
  mount: mount,
  vehicle: {
    parts: questions.order.map(function (step) {
      return { id: step.id, name: step.name };
    }),
    draw: function () {}
  },
  questions: questions,
  speak: global.BernieSpeak,
  onDone: function () {
    drove = true;
    global.BernieDrive.start({
      mount: mount,
      vehicle: {
        parts: questions.order.map(function (step) {
          return { id: step.id, name: step.name };
        }),
        draw: function () {}
      },
      speak: global.BernieSpeak
    });
  }
});

function times(text) {
  return spoken.filter(function (line) { return line === text; }).length;
}

function bits() {
  return document.querySelectorAll(".bit").length;
}

function build() {
  return document.querySelector(".build");
}

function choices() {
  return document.querySelectorAll(".choice");
}

function button(id) {
  return choices().filter(function (item) { return item.dataset.id === id; })[0];
}

function hasImg(node) {
  if (!node) return false;
  if (node.tagName === "img") return true;
  var i;
  for (i = 0; i < node.children.length; i++) {
    if (hasImg(node.children[i])) return true;
  }
  return false;
}

var start = document.querySelector(".start-go");
assert.strictEqual(start.querySelector(".btn-label").textContent, "Start");
assert.strictEqual(start.querySelector(".btn-icon").textContent, "▶");
assert.strictEqual(start.hidden, false);
assert.strictEqual(spoken.length, 0, "nothing is read before Start");
assert.strictEqual(bits(), 0);
assert.strictEqual(document.querySelector(".wheel-cue"), null, "the start screen does not show a wheel outline");
button(build().dataset.answer).click();
assert.strictEqual(spoken.length, 0, "a part tap does nothing before Start");
assert.strictEqual(bits(), 0);

start.click();
assert.strictEqual(start.hidden, true);
assert.strictEqual(spoken.length, 0, "Start does not speak");
assert.strictEqual(global.audioMade, 0, "Start does not play a sound");
assert.strictEqual(document.querySelector(".speaker").hidden, false);
assert.strictEqual(document.querySelector(".speaker").textContent, "🔊");
assert.strictEqual(document.querySelector(".speaker")["aria-label"], "Hear it");
assert.strictEqual(document.querySelector(".prompt-word").textContent, "Rear wheel");
assert.ok(document.querySelector(".wheel-cue"), "a wheel question shows the loader outline");
assert.ok(document.querySelector(".wheel-cue-dot"), "the outline marks that wheel");
assert.strictEqual(document.querySelector(".prompt-piece"), null, "the word is not paired with a picture");
assert.strictEqual(document.querySelector(".prompt-map"), null);
assert.strictEqual(document.querySelector(".slot"), null, "the slot is not filled in ahead of the tap");
assert.strictEqual(choices().length, 3);
assert.ok(choices().every(function (item) {
  var src = item.querySelector(".choice-photo").src;
  return src.indexOf("/tile-") !== -1 && src.indexOf("inset-") === -1;
}));
assert.strictEqual(document.querySelectorAll(".pip").length, 6);
assert.strictEqual(document.querySelectorAll(".pip-photo").length, 6);

document.querySelector(".speaker").click();
assert.strictEqual(spoken[0], "Find the rear wheel!");
assert.strictEqual(times("Find the rear wheel!"), 1);

var wrong = choices().filter(function (item) { return item.dataset.id !== build().dataset.answer; })[0];
var beforeWrong = spoken.length;
wrong.click();
assert.strictEqual(spoken.length, beforeWrong, "a wrong tap does not speak");
assert.strictEqual(times("Try again"), 0);
assert.strictEqual(times("Listen first"), 0);
assert.strictEqual(wrong.disabled, true);
assert.ok(wrong.classList.contains("spent"));
assert.ok(wrong.classList.contains("wiggle"));
assert.ok(wrong.classList.contains("miss"));
assert.strictEqual(wrong.querySelector(".mark-x").textContent, "✕");
assert.strictEqual(bits(), 0, "a wrong tap awards nothing yet");
assert.ok(button(build().dataset.answer) && !button(build().dataset.answer).disabled);

var right = button("rear-wheel");
right.poke();
right.poke();
assert.strictEqual(bits(), 1, "wrong then right awards once");
assert.strictEqual(times("Yes! The rear wheel!"), 0, "a correct tap does not speak");
assert.strictEqual(build().dataset.answer, "rear-wheel", "the next question waits while the piece is showing");
flush(now + 1600);
assert.strictEqual(build().dataset.answer, "front-wheel");
assert.ok(document.querySelector(".wheel-cue"), "the next wheel question still shows the outline");
assert.strictEqual(times("Find the front wheel!"), 0, "the next part waits for the speaker");
assert.strictEqual(global.audioMade, 0);
assert.strictEqual(times("Listen first"), 0);
assert.strictEqual(times("How many rocks?"), 0);

var front = button("front-wheel");
front.poke();
front.poke();
assert.strictEqual(bits(), 2, "a fast second tap does not award another part");
flush(now + 1600);
assert.strictEqual(build().dataset.answer, "engine");
assert.strictEqual(document.querySelector(".wheel-cue"), null, "other questions hide the wheel outline");
assert.strictEqual(spoken.length, 1, "only the speaker tap has spoken");

["engine", "cab", "arms"].forEach(function (id) {
  var before = spoken.length;
  button(id).click();
  assert.strictEqual(spoken.length, before, id + " does not speak");
  assert.strictEqual(global.audioMade, 0, id + " does not beep");
  flush(now + 1600);
});
assert.strictEqual(bits(), 5);
assert.strictEqual(build().dataset.answer, "bucket");
assert.strictEqual(drove, false);

var miss = choices().filter(function (item) { return item.dataset.id !== "bucket"; })[0];
miss.click();
assert.strictEqual(bits(), 5);
button("bucket").click();
assert.strictEqual(bits(), 6);
assert.strictEqual(times("Yes! The bucket!"), 0);
assert.ok(document.querySelector(".art").classList.contains("shine"), "the finished loader shines");
assert.strictEqual(drove, false, "the drive waits for the landing");
flush(now + 2500);
assert.strictEqual(drove, true, "all 6 parts lead to the drive scene");
assert.strictEqual(spoken.length, 1, "building never speaks on its own");
assert.strictEqual(global.audioMade, 0, "building never plays audio on its own");

function until(label, pred, steps) {
  var i;
  for (i = 0; i < steps; i++) {
    if (pred()) return;
    flush(now + 200);
  }
  assert.ok(pred(), label);
}

var scoop = document.querySelector(".scoop");
assert.ok(scoop, "scoop button");
assert.strictEqual(scoop.disabled, false);
var heard = spoken.length;
scoop.click();
assert.strictEqual(scoop.disabled, true, "scoop dims as soon as the loader moves");
assert.ok(scoop.classList.contains("busy"));
var mash;
for (mash = 0; mash < 10; mash++) {
  scoop.click();
  scoop.poke();
}
assert.strictEqual(document.querySelector(".numeral").textContent, "", "mashed scoop taps do not count");
until("stones leave the bucket", function () {
  return document.querySelectorAll(".falling-rock").length > 0;
}, 40);
var rocks = document.querySelectorAll(".falling-rock");
var rockI;
for (rockI = 0; rockI < rocks.length; rockI++) {
  assert.ok(parseFloat(rocks[rockI].style["--dy"]) >= 0, "a falling stone does not rise above the bucket");
}
assert.strictEqual(document.querySelector(".numeral").textContent, "", "the count waits for the rocks to land");
assert.strictEqual(scoop.disabled, true, "scoop stays dim while the rocks fall");
until("the first scoop settles", function () {
  return document.querySelector(".numeral").textContent === "1" && scoop.disabled === false;
}, 40);
assert.strictEqual(spoken.length, heard, "a scoop does not speak");
assert.strictEqual(global.audioMade, 0, "a scoop does not honk");
assert.strictEqual(document.querySelector(".numeral").textContent, "1", "ten extra taps still make one scoop");
assert.strictEqual(document.querySelectorAll(".count-stone").length, 1);
assert.ok(!scoop.classList.contains("busy"));

document.querySelector(".speaker").click();
assert.strictEqual(spoken[spoken.length - 1], "1!");
assert.strictEqual(global.audioMade, 0, "the count speaker does not honk early");

scoop.click();
until("the second scoop settles", function () {
  return document.querySelector(".numeral").textContent === "2" && scoop.disabled === false;
}, 40);
scoop.click();
until("the ending appears", function () {
  var badge = document.querySelector(".end-badge");
  return badge && badge.hidden === false;
}, 60);
assert.strictEqual(document.querySelector(".numeral").textContent, "3");
assert.strictEqual(document.querySelectorAll(".count-stone").length, 3);
assert.strictEqual(document.querySelector(".pile").className, "pile scoop-3");
assert.strictEqual(document.querySelector(".done-line").textContent, "You did it!");
assert.strictEqual(global.audioMade, 0, "the ending does not honk by itself");
var again = document.querySelector(".again");
assert.strictEqual(again.hidden, false);
assert.strictEqual(again.disabled, true, "build again ignores taps at first");
assert.ok(again.classList.contains("cooling"));
again.click();
again.poke();
assert.strictEqual(document.querySelector(".end-badge").hidden, false, "a mashed build again does not skip the ending");
flush(now + 2000);
assert.strictEqual(again.disabled, true, "build again stays quiet for about 2.5 seconds");
again.poke();
assert.strictEqual(document.querySelector(".end-badge").hidden, false);
flush(now + 800);
assert.strictEqual(again.disabled, false, "build again fades in after the pause");
assert.ok(!again.classList.contains("cooling"));
var beforeEnd = spoken.length;
document.querySelector(".speaker").click();
assert.strictEqual(spoken[spoken.length - 1], "You did it!");
assert.ok(global.audioMade > 0, "a speaker tap at the end may honk");
assert.ok(spoken.length > beforeEnd);

assert.strictEqual(times("Listen first"), 0);
assert.strictEqual(times("How many rocks?"), 0);
assert.strictEqual(times("Try again"), 0);
spoken.forEach(function (line) {
  assert.ok(line.indexOf("sock") === -1 && line.indexOf("pig") === -1 && line.indexOf("moon") === -1, line);
});

var fs = require("fs");
var path = require("path");
function nearestFunction(src, index) {
  var at = index;
  while (at > 0) {
    at = src.lastIndexOf("function ", at - 1);
    if (at < 0) return "";
    var end = src.indexOf("(", at);
    var name = src.slice(at + "function ".length, end).trim();
    if (name) return name;
  }
  return "";
}
function eachHit(src, needle, ok) {
  var at = 0;
  var found = 0;
  while ((at = src.indexOf(needle, at)) !== -1) {
    found += 1;
    assert.ok(ok.indexOf(nearestFunction(src, at)) !== -1, needle + " is inside " + nearestFunction(src, at));
    at += needle.length;
  }
  return found;
}
var buildSrc = fs.readFileSync(path.join(__dirname, "build.js"), "utf8");
var driveSrc = fs.readFileSync(path.join(__dirname, "drive.js"), "utf8");
assert.strictEqual(buildSrc.indexOf("AudioContext"), -1, "the build has no sound effect");
assert.strictEqual(buildSrc.indexOf(".play("), -1);
assert.ok(eachHit(buildSrc, "speak.", ["hear"]) > 0);
assert.ok(eachHit(driveSrc, "speak.", ["hear"]) > 0);
assert.ok(eachHit(driveSrc, "AudioContext", ["honk"]) > 0);
assert.ok(eachHit(driveSrc, "createOscillator", ["honk"]) > 0);
assert.strictEqual(nearestFunction(driveSrc, driveSrc.indexOf("honk();")), "hear");

console.log("Bernie listen-loop checks passed.");
