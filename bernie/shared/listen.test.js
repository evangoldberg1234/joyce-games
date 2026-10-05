/* Start reads the first part once. A wrong photo says Try again and greys
   that button. The right photo still awards the part. Six parts open the drive. */
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
      add: function (name) {
        var parts = self.className.split(/\s+/).filter(Boolean);
        if (parts.indexOf(name) === -1) parts.push(name);
        self.className = parts.join(" ");
      },
      remove: function (name) {
        self.className = self.className.split(/\s+/).filter(function (part) {
          return part && part !== name;
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
    createElement: function (tag) {
      return new Element(tag);
    },
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
  onDone: function () { drove = true; }
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
button(build().dataset.answer).click();
assert.strictEqual(spoken.length, 0, "a part tap does nothing before Start");
assert.strictEqual(bits(), 0);

start.click();
assert.strictEqual(start.hidden, true);
assert.strictEqual(spoken[0], "Find the rear wheel!");
assert.strictEqual(times("Find the rear wheel!"), 1);
assert.strictEqual(document.querySelector(".speaker").hidden, false);
assert.strictEqual(document.querySelector(".speaker").textContent, "🔊");
assert.strictEqual(document.querySelector(".speaker")["aria-label"], "Hear it");
assert.strictEqual(document.querySelector(".prompt-word").textContent, "Rear wheel");
var promptPiece = document.querySelector(".prompt-piece");
assert.ok(promptPiece && promptPiece.src.indexOf("rear-wheel.webp") !== -1, "the prompt shows that part");
assert.strictEqual(choices().length, 3);
assert.ok(choices().every(function (item) {
  var src = item.querySelector(".choice-photo").src;
  return src.indexOf("/tile-") !== -1 && src.indexOf("inset-") === -1;
}));
assert.strictEqual(document.querySelectorAll(".pip").length, 6);

document.querySelector(".speaker").click();
assert.strictEqual(times("Find the rear wheel!"), 2);

var wrong = choices().filter(function (item) { return item.dataset.id !== build().dataset.answer; })[0];
wrong.click();
assert.strictEqual(spoken[spoken.length - 1], "Try again");
assert.strictEqual(times("Try again"), 1);
assert.strictEqual(times("Listen first"), 0);
assert.strictEqual(wrong.disabled, true);
assert.ok(wrong.classList.contains("spent"));
assert.ok(wrong.classList.contains("wiggle"));
assert.strictEqual(bits(), 0, "a wrong tap awards nothing yet");
assert.ok(button(build().dataset.answer) && !button(build().dataset.answer).disabled);

var right = button("rear-wheel");
right.poke();
right.poke();
assert.strictEqual(bits(), 1, "wrong then right awards once");
assert.strictEqual(times("Yes! The rear wheel!"), 1);
assert.strictEqual(build().dataset.answer, "front-wheel");
assert.strictEqual(times("Find the front wheel!"), 1, "the same tap reads the next part");
assert.strictEqual(times("Listen first"), 0);
assert.strictEqual(times("How many rocks?"), 0);

var front = button("front-wheel");
front.poke();
front.poke();
assert.strictEqual(bits(), 2, "a fast second tap does not award another part");
assert.strictEqual(build().dataset.answer, "engine");
assert.strictEqual(times("Yes! The front wheel!"), 1);

["engine", "cab", "arms"].forEach(function (id) {
  var before = spoken.length;
  button(id).click();
  assert.strictEqual(spoken.length, before + 2, id + " says yes and the next find");
});
assert.strictEqual(bits(), 5);
assert.strictEqual(build().dataset.answer, "bucket");
assert.strictEqual(drove, false);

var miss = choices().filter(function (item) { return item.dataset.id !== "bucket"; })[0];
miss.click();
assert.strictEqual(bits(), 5);
button("bucket").click();
assert.strictEqual(bits(), 6);
assert.strictEqual(times("Yes! The bucket!"), 1);
assert.strictEqual(drove, false, "the drive waits for the celebration");
flush(now + 2500);
assert.strictEqual(drove, true, "all 6 parts lead to the drive scene");
assert.strictEqual(times("You built it!"), 0, "the celebration is not spoken by itself");
assert.strictEqual(times("Listen first"), 0);
assert.strictEqual(times("How many rocks?"), 0);
spoken.forEach(function (line) {
  assert.ok(line.indexOf("sock") === -1 && line.indexOf("pig") === -1 && line.indexOf("moon") === -1, line);
});

console.log("Bernie listen-loop checks passed.");
