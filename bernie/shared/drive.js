/* Drive scene. Drag the vehicle, or tap where it should go.
   Scoop lifts dirt near the pile. Dump drops it in the truck.
   The vehicle config supplies draw() and drive spot positions. */
(function (root) {
  var SVGNS = "http://www.w3.org/2000/svg";

  function el(tag, className) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    return node;
  }

  function svg(name, attrs, parent) {
    var node = document.createElementNS(SVGNS, name);
    var key;
    for (key in attrs) {
      if (Object.prototype.hasOwnProperty.call(attrs, key)) node.setAttribute(key, attrs[key]);
    }
    if (parent) parent.appendChild(node);
    return node;
  }

  function lin(defs, id, x2, y2, stops) {
    var g = svg("linearGradient", { id: id, x1: "0", y1: "0", x2: x2, y2: y2 }, defs);
    var i;
    for (i = 0; i < stops.length; i++) {
      svg("stop", { offset: stops[i][0], "stop-color": stops[i][1] }, g);
    }
  }

  function rad(defs, id, stops) {
    var g = svg("radialGradient", { id: id, cx: "35%", cy: "32%", r: "70%" }, defs);
    var i;
    for (i = 0; i < stops.length; i++) {
      svg("stop", { offset: stops[i][0], "stop-color": stops[i][1] }, g);
    }
  }

  function grit(defs, id, dark, light) {
    var p = svg("pattern", {
      id: id, width: "18", height: "14", patternUnits: "userSpaceOnUse"
    }, defs);
    svg("circle", { cx: "4", cy: "4", r: "1.2", fill: dark }, p);
    svg("circle", { cx: "12", cy: "9", r: "0.9", fill: light }, p);
    svg("circle", { cx: "8", cy: "12", r: "0.6", fill: dark }, p);
  }

  function scenery() {
    var board = svg("svg", {
      class: "scenery",
      viewBox: "0 0 800 480",
      preserveAspectRatio: "xMidYMid slice",
      "aria-hidden": "true"
    });
    var defs = svg("defs", {}, board);
    lin(defs, "sc-sky", "0", "1", [["0%", "#7eb6e8"], ["55%", "#d5eeff"], ["100%", "#f4fbff"]]);
    rad(defs, "sc-sun", [["0%", "#fff6c8"], ["70%", "#ffe08a"], ["100%", "rgba(255,224,138,0)"]]);
    lin(defs, "sc-hill", "0", "1", [["0%", "#d5e4ae"], ["100%", "#9bb36a"]]);
    lin(defs, "sc-ground", "0", "1", [["0%", "#e6c48a"], ["38%", "#c4924e"], ["100%", "#8d5a2c"]]);
    grit(defs, "sc-grit", "rgba(90,48,18,0.45)", "rgba(255,220,160,0.35)");
    svg("rect", { width: "800", height: "480", fill: "url(#sc-sky)" }, board);
    svg("circle", { cx: "640", cy: "78", r: "86", fill: "url(#sc-sun)" }, board);
    svg("circle", { cx: "640", cy: "78", r: "28", fill: "#fff3c4" }, board);
    svg("path", {
      d: "M0 250 C 120 190, 220 210, 340 176 C 460 140, 560 188, 800 150 L 800 280 L 0 280 Z",
      fill: "url(#sc-hill)"
    }, board);
    svg("rect", { y: "248", width: "800", height: "232", fill: "url(#sc-ground)" }, board);
    svg("rect", { y: "248", width: "800", height: "232", fill: "url(#sc-grit)" }, board);
    svg("path", {
      d: "M0 268 C 140 250, 280 276, 460 258 C 620 244, 720 270, 800 256",
      fill: "none", stroke: "rgba(255,236,196,0.35)", "stroke-width": "10"
    }, board);
    svg("ellipse", { cx: "180", cy: "360", rx: "46", ry: "8", fill: "rgba(70,40,16,0.18)" }, board);
    svg("ellipse", { cx: "520", cy: "400", rx: "70", ry: "10", fill: "rgba(70,40,16,0.16)" }, board);
    svg("path", {
      d: "M40 210 L70 150 L130 168 L150 214 Z",
      fill: "#b7b2a8", stroke: "#6e6962", "stroke-width": "3"
    }, board);
    svg("path", {
      d: "M78 168 L96 142 L118 156 L108 176 Z",
      fill: "#d9d4ca"
    }, board);
    svg("path", {
      d: "M620 230 L690 160 L760 188 L740 236 Z",
      fill: "#9aa0a6", stroke: "#5c636a", "stroke-width": "3"
    }, board);
    svg("path", {
      d: "M700 176 L734 148 L758 170 L730 190 Z",
      fill: "#d5d8dc"
    }, board);
    return board;
  }

  function stonePath(parent, d, light, mid, dark, group) {
    var g = svg("g", { class: group }, parent);
    svg("path", { d: d, fill: mid, stroke: dark, "stroke-width": "3", "stroke-linejoin": "round" }, g);
    return g;
  }

  function pileArt() {
    var board = svg("svg", {
      viewBox: "0 0 200 150",
      "aria-hidden": "true"
    });
    svg("ellipse", { cx: "100", cy: "136", rx: "78", ry: "10", fill: "rgba(40,32,24,0.28)" }, board);
    var rocks = [
      ["M18 128 C 12 96, 36 78, 58 86 C 70 74, 96 90, 88 128 Z", "#d7d2c8", "#8e8980", "#3e3b36", "rock-3"],
      ["M70 132 C 64 100, 96 70, 124 84 C 148 74, 168 104, 156 132 Z", "#c4a882", "#7a5a34", "#3d2a16", "rock-3"],
      ["M130 130 C 124 102, 150 82, 176 96 C 192 108, 194 124, 182 132 Z", "#cfd3d6", "#6e757c", "#34383c", "rock-2"],
      ["M36 134 C 30 112, 58 96, 78 108 C 96 98, 112 118, 100 136 Z", "#b7b1a6", "#6a6560", "#2e2c29", "rock-2"],
      ["M96 136 C 90 114, 118 98, 140 112 C 158 122, 150 138, 128 140 Z", "#d2b48a", "#8a6240", "#4a3018", "rock-2"],
      ["M48 140 C 44 124, 70 112, 92 122 C 108 116, 118 132, 104 142 Z", "#e4e0d8", "#9a958c", "#4a4742", "rock-1"],
      ["M108 142 C 102 126, 128 114, 150 126 C 166 134, 160 146, 138 146 Z", "#c8c2b8", "#746e66", "#35322e", "rock-1"],
      ["M78 144 C 74 132, 96 122, 114 132 C 126 140, 118 150, 98 150 Z", "#b98a58", "#6e4c2c", "#3a2814", "rock-1"]
    ];
    var i;
    for (i = 0; i < rocks.length; i++) {
      stonePath(board, rocks[i][0], rocks[i][1], rocks[i][2], rocks[i][3], rocks[i][4]);
    }
    return board;
  }

  function wheel(parent, cx, cy) {
    svg("circle", { cx: cx, cy: cy, r: "22", fill: "url(#tr-rubber)" }, parent);
    svg("circle", {
      cx: cx, cy: cy, r: "16", fill: "none", stroke: "#141414",
      "stroke-width": "5", "stroke-dasharray": "5 4"
    }, parent);
    svg("circle", { cx: cx, cy: cy, r: "9", fill: "url(#tr-rim)" }, parent);
    svg("circle", { cx: cx, cy: cy, r: "3", fill: "#2a2e32" }, parent);
  }

  function truckArt(host) {
    var board = svg("svg", { viewBox: "0 0 300 160", "aria-hidden": "true" });
    var defs = svg("defs", {}, board);
    lin(defs, "tr-paint", "0", "1", [["0%", "#f6e7a2"], ["40%", "#e0b034"], ["100%", "#b88616"]]);
    lin(defs, "tr-steel", "0", "1", [["0%", "#f4f5f6"], ["50%", "#aeb4ba"], ["100%", "#5c636a"]]);
    lin(defs, "tr-glass", "0", "1", [["0%", "rgba(236,250,255,0.95)"], ["100%", "rgba(70,130,160,0.8)"]]);
    rad(defs, "tr-rubber", [["0%", "#4a4a4a"], ["100%", "#0c0c0c"]]);
    rad(defs, "tr-rim", [["0%", "#f4f5f6"], ["100%", "#4a5158"]]);
    lin(defs, "tr-soil", "0", "1", [["0%", "#c9a06a"], ["100%", "#6a3c1c"]]);
    svg("ellipse", { cx: "150", cy: "148", rx: "120", ry: "8", fill: "rgba(40,22,8,0.28)" }, board);
    wheel(board, 58, 126);
    wheel(board, 168, 128);
    wheel(board, 214, 128);
    svg("rect", { x: "40", y: "112", width: "210", height: "12", rx: "3", fill: "#2c3136" }, board);
    svg("path", {
      d: "M108 108 L118 40 L262 34 L270 108 Z",
      fill: "url(#tr-paint)", stroke: "#8a6410", "stroke-width": "2"
    }, board);
    svg("path", { d: "M128 96 L140 50 L238 46 L250 96 Z", fill: "#5a4030" }, board);
    svg("path", { d: "M124 48 L248 42 L252 58 L126 62 Z", fill: "rgba(255,255,255,0.28)" }, board);
    var rib;
    for (rib = 0; rib < 4; rib++) {
      svg("line", {
        x1: String(148 + rib * 26), y1: "56",
        x2: String(154 + rib * 26), y2: "98",
        stroke: "rgba(90,58,12,0.45)", "stroke-width": "3", "stroke-linecap": "round"
      }, board);
    }
    svg("path", { d: "M116 100 L262 100 L258 108 L112 108 Z", fill: "url(#tr-steel)" }, board);
    svg("line", {
      x1: "150", y1: "108", x2: "196", y2: "78",
      stroke: "url(#tr-steel)", "stroke-width": "7", "stroke-linecap": "round"
    }, board);
    var dirt = svg("rect", {
      x: "124", y: "100", width: "124", height: "0", rx: "2", fill: "url(#tr-soil)"
    }, board);
    svg("path", {
      d: "M14 64 h78 a8 8 0 0 1 8 8 v36 h-86 z",
      fill: "url(#tr-paint)", stroke: "#8a6410", "stroke-width": "2"
    }, board);
    svg("rect", { x: "26", y: "72", width: "52", height: "24", rx: "3", fill: "url(#tr-glass)" }, board);
    svg("path", { d: "M30 76 h22 v8 h-22 z", fill: "rgba(255,255,255,0.55)" }, board);
    svg("rect", { x: "88", y: "36", width: "8", height: "28", rx: "2", fill: "#2a2e32" }, board);
    svg("circle", { cx: "22", cy: "96", r: "5", fill: "#f4e7b0" }, board);
    host.appendChild(board);
    return dirt;
  }

  function clamp(value, min, max) {
    if (value < min) return min;
    if (value > max) return max;
    return value;
  }

  function center(node) {
    var box = node.getBoundingClientRect();
    return {
      x: box.left + box.width / 2,
      y: box.top + box.height / 2
    };
  }

  function near(a, b, limit) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy) <= limit;
  }

  var SCOOPS = 3;

  function scoopSay(n, total) {
    var line = n + "!";
    if (n >= total) return [line, "You did it!"];
    return [line];
  }

  function start(opts) {
    var vehicle = opts.vehicle;
    var speak = opts.speak;
    var spots = vehicle.drive || {};
    var origin = spots.start || { x: 0.5, y: 0.86 };
    var pileAt = spots.pile || { x: 0.82, y: 0.86 };
    var dumpAt = spots.dump || { x: 0.18, y: 0.86 };
    var pos = { x: origin.x, y: origin.y };
    var facing = 1;
    var parked = origin.x;
    var pose = "rest";
    var loads = 0;
    var filled = 0;
    var raf = 0;
    var shown = "";
    var alive = true;
    var scooping = false;
    var all = vehicle.parts.map(function (part) { return part.id; });

    var scene = el("div", "scene");
    if (vehicle.yard) {
      var yard = el("img", "scenery");
      yard.src = vehicle.yard;
      yard.alt = "";
      scene.appendChild(yard);
    } else {
      scene.appendChild(scenery());
    }
    var pile = el("div", "pile");
    pile.setAttribute("aria-hidden", "true");
    if (vehicle.pile) {
      var mound = el("img");
      mound.src = vehicle.pile;
      mound.alt = "";
      pile.appendChild(mound);
    } else {
      pile.appendChild(pileArt());
    }
    var truck = el("div", "truck");
    truck.setAttribute("aria-hidden", "true");
    var dirt = truckArt(truck);
    var rig = el("div", "rig");
    var art = el("div", "rig-art");
    rig.appendChild(art);
    var cheer = el("p", "cheer");
    cheer.setAttribute("role", "status");
    scene.appendChild(pile);
    scene.appendChild(truck);
    scene.appendChild(rig);
    scene.appendChild(cheer);

    var tally = el("div", "tally-board");
    var numeral = el("p", "numeral");
    numeral.textContent = "";
    var stack = el("div", "count-stack");
    tally.appendChild(numeral);
    tally.appendChild(stack);
    var banner = el("p", "done-line");
    banner.textContent = "You did it!";
    banner.hidden = true;
    var badge = el("p", "end-badge");
    badge.textContent = "🚜⭐";
    badge.hidden = true;
    scene.appendChild(tally);
    scene.appendChild(banner);
    scene.appendChild(badge);

    var play = el("div", "drive-play");
    var bar = el("div", "drive-bar");
    function iconButton(className, icon, label) {
      var btn = el("button", className);
      btn.type = "button";
      var mark = el("span", "btn-icon");
      mark.setAttribute("aria-hidden", "true");
      mark.textContent = icon;
      var text = el("span", "btn-label");
      text.textContent = label;
      btn.appendChild(mark);
      btn.appendChild(text);
      return btn;
    }

    var scoop = iconButton("scoop", "🪣", "Scoop");
    var again = iconButton("again", "↻", "Build again");
    again.hidden = true;
    var speaker = el("button", "speaker");
    speaker.type = "button";
    speaker.textContent = "🔊";
    speaker.setAttribute("aria-label", "Hear it");
    var loadMark = el("div", "truck-load");
    loadMark.setAttribute("aria-hidden", "true");
    var rockI;
    for (rockI = 0; rockI < 9; rockI++) {
      loadMark.appendChild(el("span", "stone stone-" + (rockI % 3)));
    }
    truck.appendChild(loadMark);
    bar.appendChild(speaker);
    bar.appendChild(scoop);
    bar.appendChild(again);
    play.appendChild(scene);
    play.appendChild(bar);

    opts.mount.innerHTML = "";
    opts.mount.appendChild(play);

    pile.style.left = (pileAt.x * 100) + "%";
    pile.style.top = (pileAt.y * 100) + "%";
    truck.style.left = (dumpAt.x * 100) + "%";
    truck.style.top = (dumpAt.y * 100) + "%";

    function lockPage() {
      var node = opts.mount;
      while (node) {
        if (node.classList && node.classList.contains("app")) {
          node.style.overflow = "hidden";
          node.style.touchAction = "none";
        }
        node = node.parentNode;
      }
      document.documentElement.classList.add("no-scroll");
      document.body.classList.add("is-driving");
    }

    function preventScroll(event) {
      if (!document.body.classList.contains("is-driving")) return;
      event.preventDefault();
    }

    function unlockPage() {
      document.documentElement.classList.remove("no-scroll");
      document.body.classList.remove("is-driving");
    }

    function paint() {
      if (!alive) return;
      var key = pose + "-" + loads;
      if (shown !== key) {
        vehicle.draw(art, {
          parts: all,
          bucketUp: pose !== "rest",
          carrying: pose === "carry" || pose === "dump",
          pose: pose,
          just: ""
        });
        shown = key;
      }
      rig.style.left = (pos.x * 100) + "%";
      rig.style.top = (pos.y * 100) + "%";
      rig.style.transform = "translate(-50%, -100%) scaleX(" + facing + ")";
      var piled = Math.min(filled, SCOOPS);
      dirt.setAttribute("height", String(piled * 18));
      dirt.setAttribute("y", String(100 - piled * 18));
    }

    /* Put the bucket (the left edge of the photo) on a point in the scene. */
    function alignBucket(targetX) {
      var sceneBox = scene.getBoundingClientRect ? scene.getBoundingClientRect() : null;
      var rigBox = rig.getBoundingClientRect ? rig.getBoundingClientRect() : null;
      if (!sceneBox || !rigBox || !sceneBox.width || !rigBox.width) {
        return facing < 0 ? 0.62 : 0.34;
      }
      var frac = facing < 0 ? 0.94 : 0.12;
      var wantLeft = targetX - rigBox.width * frac;
      var minLeft = sceneBox.left + 2;
      var maxLeft = sceneBox.right - rigBox.width - 2;
      if (wantLeft < minLeft) wantLeft = minLeft;
      if (wantLeft > maxLeft) wantLeft = maxLeft;
      var mid = wantLeft + rigBox.width / 2;
      return clamp((mid - sceneBox.left) / sceneBox.width, 0.08, 0.94);
    }

    function moveTo(x, ms, done) {
      var from = pos.x;
      var t0 = Date.now();
      var finished = false;
      var lastT = -1;
      function finish() {
        if (finished || !alive) return;
        finished = true;
        pos.x = x;
        paint();
        if (done) done();
      }
      function frame() {
        if (finished || !alive) return;
        var t = Math.min(1, (Date.now() - t0) / ms);
        if (t <= lastT) return;
        lastT = t;
        var eased = 1 - Math.pow(1 - t, 3);
        pos.x = from + (x - from) * eased;
        paint();
        if (t < 1) raf = window.requestAnimationFrame(frame);
        else finish();
      }
      window.setTimeout(finish, ms + 90);
      if (window.requestAnimationFrame) frame();
      else finish();
    }

    function dropRocks() {
      var sceneBox = scene.getBoundingClientRect ? scene.getBoundingClientRect() : { left: 0, width: 0 };
      var truckBox = truck.getBoundingClientRect ? truck.getBoundingClientRect() : { left: 0, width: 0 };
      var bed = truckBox.left + truckBox.width * 0.3;
      var leftPct = sceneBox.width ? ((bed - sceneBox.left) / sceneBox.width) * 100 : 62;
      var tones = ["grey", "brown", "slate"];
      var i;
      for (i = 0; i < 7; i++) {
        var rock = el("span", "falling-rock " + tones[i % 3]);
        rock.style.left = (leftPct - 4 + (i % 4) * 3.4) + "%";
        rock.style.top = "42%";
        rock.style.animationDelay = (i * 0.08) + "s";
        rock.style.transform = "rotate(" + ((i * 37) % 50 - 20) + "deg)";
        scene.appendChild(rock);
        (function (node) {
          window.setTimeout(function () {
            if (node.parentNode) node.remove();
          }, 1400);
        })(rock);
      }
    }

    function showCount(n) {
      numeral.textContent = String(n);
      numeral.classList.remove("stay");
      if (typeof numeral.offsetWidth === "number") void numeral.offsetWidth;
      numeral.classList.add("stay");
      stack.innerHTML = "";
      var i;
      for (i = 0; i < n; i++) stack.appendChild(el("span", "count-stone stone-" + (i % 3)));
    }

    function honk() {
      var Ctx = root.AudioContext || root.webkitAudioContext;
      if (!Ctx) return;
      try {
        var audio = new Ctx();
        var t = audio.currentTime;
        [523, 659].forEach(function (freq, index) {
          var osc = audio.createOscillator();
          var gain = audio.createGain();
          osc.type = "square";
          osc.frequency.value = freq;
          osc.connect(gain);
          gain.connect(audio.destination);
          var startAt = t + index * 0.18;
          gain.gain.setValueAtTime(0.0001, startAt);
          gain.gain.exponentialRampToValueAtTime(0.08, startAt + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.16);
          osc.start(startAt);
          osc.stop(startAt + 0.18);
        });
      } catch (err) { /* a missing speaker should not block the ending */ }
    }

    function hear() {
      if (!alive || !speak) return;
      var line = "Scoop!";
      if (loads >= SCOOPS) line = "You did it!";
      else if (loads) line = loads + "!";
      speak.arm();
      if (speak.lines) speak.lines([line]);
      else speak.speak(line);
      if (loads >= SCOOPS) honk();
    }

    function celebrate() {
      banner.hidden = false;
      badge.hidden = false;
      cheer.textContent = "";
      rig.classList.add("honk");
      var colors = ["#ffe14a", "#ff5a5a", "#3ecf8e", "#4aa3ff", "#fff"];
      var i;
      for (i = 0; i < 22; i++) {
        var bit = el("span", i % 2 ? "confetti star" : "confetti");
        bit.style.left = (6 + ((i * 17) % 88)) + "%";
        bit.style.animationDelay = ((i % 6) * 0.08) + "s";
        bit.style.background = colors[i % colors.length];
        scene.appendChild(bit);
      }
    }

    scoop.addEventListener("click", function () {
      if (!alive || scooping || loads >= SCOOPS) return;
      scooping = true;
      loads += 1;
      var n = loads;
      var last = n >= SCOOPS;
      facing = 1;
      pose = "rest";
      shown = "";
      paint();
      var pileBox = pile.getBoundingClientRect ? pile.getBoundingClientRect() : { left: 0, width: 0 };
      var intoPile = pileBox.left + pileBox.width * 0.55;
      moveTo(alignBucket(intoPile), 700, function () {
        if (!alive) return;
        pose = "carry";
        shown = "";
        paint();
        window.setTimeout(function () {
          if (!alive) return;
          facing = -1;
          shown = "";
          paint();
          var truckBox = truck.getBoundingClientRect ? truck.getBoundingClientRect() : { left: 0, width: 0 };
          var bed = truckBox.left + truckBox.width * 0.16;
          moveTo(alignBucket(bed), 800, function () {
            if (!alive) return;
            pose = "dump";
            shown = "";
            paint();
            dropRocks();
            filled = n;
            pile.className = "pile scoop-" + n;
            truck.className = "truck fill-" + n;
            showCount(n);
            window.setTimeout(function () {
              if (!alive) return;
              if (last) {
                scoop.hidden = true;
                again.hidden = false;
                celebrate();
                scooping = false;
                return;
              }
              facing = 1;
              pose = "rest";
              shown = "";
              moveTo(parked, 700, function () {
                scooping = false;
              });
            }, last ? 2600 : 1100);
          });
        }, 560);
      });
    });

    speaker.addEventListener("click", hear);

    again.addEventListener("click", function () {
      if (again.hidden) return;
      alive = false;
      if (raf && window.cancelAnimationFrame) window.cancelAnimationFrame(raf);
      unlockPage();
      if (opts.onAgain) opts.onAgain();
    });

    document.addEventListener("touchmove", preventScroll, { passive: false });
    lockPage();
    paint();
  }

  root.BernieDrive = { start: start, scoopSay: scoopSay, scoops: SCOOPS };
})(typeof window !== "undefined" ? window : global);
