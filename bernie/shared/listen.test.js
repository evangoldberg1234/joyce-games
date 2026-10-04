/* A 4-year-old mashes the loader: wrong taps, taps during the pause, and taps
   that land before the question has been heard. "Listen first" may play once
   for the tap that earned the pause, and the speech engine must not say it
   again by itself when the pause ends. */
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
    var el = this;
    this.classList = {
      add: function (name) {
        var parts = el.className.split(/\s+/).filter(Boolean);
        if (parts.indexOf(name) === -1) parts.push(name);
        el.className = parts.join(" ");
      },
      remove: function (name) {
        el.className = el.className.split(/\s+/).filter(function (part) {
          return part && part !== name;
        }).join(" ");
      },
      contains: function (name) {
        return el.className.split(/\s+/).indexOf(name) !== -1;
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
var guess = require("./guess.js");
require("./speak.js");
require("./build.js");

var last = null;
var realMake = questions.makeQuestion;
questions.makeQuestion = function () {
  last = realMake.apply(questions, arguments);
  return last;
};

var draws = 0;
var mount = document.createElement("div");
document.body.appendChild(mount);
global.BernieBuild.start({
  mount: mount,
  vehicle: {
    parts: [1, 2, 3, 4, 5, 6, 7, 8].map(function (n) {
      return { id: "p" + n, name: "Part " + n };
    }),
    draw: function () { draws += 1; }
  },
  questions: questions,
  speak: global.BernieSpeak
});

function listens() {
  return spoken.filter(function (text) { return text === "Listen first"; }).length;
}

function choices() {
  return document.body.querySelectorAll(".choice").filter(function (button) {
    return !button.classList.contains("start-go");
  });
}

function tap(kind) {
  var buttons = choices().filter(function (button) {
    return !button.disabled;
  });
  var button = buttons.filter(function (item) {
    return kind === "right" ? item.dataset.id === last.answer : item.dataset.id !== last.answer;
  })[0];
  assert.ok(button, kind + " choice missing for " + last.answer);
  button.click();
}

function mashDisabled() {
  choices().forEach(function (button) { button.poke(); });
}

document.querySelector(".start-go").click();
assert.strictEqual(listens(), 0);

/* Too fast: one pause, and mashing while it runs must not say it again. */
now += 80;
tap("wrong");
assert.strictEqual(listens(), 1, "a fast tap says Listen first once");
var during = listens();
now += 200;
mashDisabled();
mashDisabled();
assert.strictEqual(listens(), during, "taps during the pause are not new guesses");
var beforeReread = spoken.length;
flush(now + guess.COOLDOWN_MS);
assert.strictEqual(listens(), during, "the pause must not say Listen first again by itself");
assert.ok(spoken.length > beforeReread, "the question is read again after the pause");
var reread = spoken[spoken.length - 1];
assert.strictEqual(reread, last.say, "the re-read is the question, once");
assert.strictEqual(spoken.filter(function (text) { return text === last.say; }).length, 2);

/* He taps the right picture the instant the buttons return. The pause was enough. */
now += 40;
tap("right");
assert.strictEqual(listens(), during, "after the pause an answer is accepted");
assert.ok(spoken.indexOf("Yes!") !== -1);
assert.ok(draws >= 2, "a correct answer after the pause moves the game on");

/* On the next question, two wrong taps may pause once. It still ends. */
now += 1200;
flush(now);
tap("wrong");
assert.strictEqual(spoken[spoken.length - 1], "Try again");
assert.strictEqual(listens(), during);
now += 40;
tap("wrong");
assert.strictEqual(listens(), during + 1);
now += 100;
mashDisabled();
assert.strictEqual(listens(), during + 1);
flush(now + guess.COOLDOWN_MS);
assert.strictEqual(listens(), during + 1, "second pause does not replay Listen first");
now += 40;
tap("right");
assert.strictEqual(listens(), during + 1);

/* Sitting still after a pause never starts another one. */
var parked = listens();
flush(now + 20000);
assert.strictEqual(listens(), parked);

console.log("Bernie listen-loop checks passed.");
