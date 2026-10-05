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
    return board;
  }

  function pileArt() {
    var board = svg("svg", {
      viewBox: "0 0 200 150",
      "aria-hidden": "true"
    });
    var defs = svg("defs", {}, board);
    lin(defs, "pile-soil", "0", "1", [["0%", "#e2bf86"], ["42%", "#a56b38"], ["100%", "#6a3e1c"]]);
    lin(defs, "pile-dark", "0", "1", [["0%", "#b88448"], ["100%", "#4e2c12"]]);
    grit(defs, "pile-grit", "#5a3214", "#e8c99a");
    svg("ellipse", { cx: "100", cy: "132", rx: "84", ry: "12", fill: "rgba(40,22,8,0.35)" }, board);
    svg("path", {
      d: "M16 130 C 28 78, 62 34, 104 30 C 146 26, 176 72, 188 130 Z",
      fill: "url(#pile-soil)"
    }, board);
    svg("path", {
      d: "M48 130 C 62 92, 96 68, 124 74 C 150 80, 164 104, 172 130 Z",
      fill: "url(#pile-dark)"
    }, board);
    svg("path", {
      d: "M16 130 C 28 78, 62 34, 104 30 C 146 26, 176 72, 188 130 Z",
      fill: "url(#pile-grit)"
    }, board);
    svg("path", {
      d: "M48 78 C 70 52, 98 48, 120 66",
      fill: "none", stroke: "rgba(255,228,180,0.55)", "stroke-width": "7", "stroke-linecap": "round"
    }, board);
    svg("ellipse", { cx: "64", cy: "108", rx: "10", ry: "7", fill: "#6d4424" }, board);
    svg("ellipse", { cx: "132", cy: "96", rx: "8", ry: "6", fill: "#8a5a30" }, board);
    svg("ellipse", { cx: "108", cy: "118", rx: "6", ry: "4", fill: "#4a2c14" }, board);
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
    var pos = { x: 0.12, y: origin.y };
    var goal = { x: Math.min(0.78, pileAt.x + 0.32), y: origin.y };
    var facing = 1;
    var pose = "rest";
    var loads = 0;
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

    var numeral = el("p", "numeral");
    numeral.textContent = "";
    numeral.setAttribute("aria-hidden", "true");
    var banner = el("p", "done-line");
    banner.textContent = "You did it!";
    banner.hidden = true;
    scene.appendChild(numeral);
    scene.appendChild(banner);

    var play = el("div", "drive-play");
    var bar = el("div", "drive-bar");
    var scoop = el("button", "scoop");
    scoop.type = "button";
    scoop.textContent = "Scoop";
    var again = el("button", "again");
    again.type = "button";
    again.textContent = "Build again";
    again.hidden = true;
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
          carrying: pose === "carry",
          pose: pose,
          just: ""
        });
        shown = key;
      }
      rig.style.left = (pos.x * 100) + "%";
      rig.style.top = (pos.y * 100) + "%";
      rig.style.transform = "translate(-50%, -100%) scaleX(" + facing + ")";
      var piled = Math.min(loads, SCOOPS);
      dirt.setAttribute("height", String(piled * 14));
      dirt.setAttribute("y", String(100 - piled * 14));
    }

    function driveIn() {
      if (!alive) return;
      var dx = goal.x - pos.x;
      if (Math.abs(dx) < 0.01) {
        pos.x = goal.x;
        raf = 0;
        paint();
        return;
      }
      pos.x += dx * 0.08;
      paint();
      raf = window.requestAnimationFrame(driveIn);
    }

    function sayLines(list) {
      if (!speak) return;
      speak.arm();
      if (speak.lines) speak.lines(list);
      else speak.speak(list[0]);
    }

    function dropRocks() {
      var i;
      for (i = 0; i < 3; i++) {
        var rock = el("span", "falling-rock");
        rock.style.left = (dumpAt.x * 100 + 6) + "%";
        rock.style.top = "42%";
        rock.style.animationDelay = (i * 0.12) + "s";
        scene.appendChild(rock);
        (function (node) {
          window.setTimeout(function () {
            if (node.parentNode) node.remove();
          }, 900);
        })(rock);
      }
    }

    function pop(text) {
      numeral.textContent = text;
      numeral.classList.remove("show");
      if (typeof numeral.offsetWidth === "number") void numeral.offsetWidth;
      numeral.classList.add("show");
      cheer.textContent = text;
    }

    scoop.addEventListener("click", function () {
      if (!alive || scooping || loads >= SCOOPS) return;
      scooping = true;
      loads += 1;
      var lines = scoopSay(loads, SCOOPS);
      pose = "carry";
      shown = "";
      paint();
      dropRocks();
      pop(String(loads));
      sayLines(lines);
      var done = loads >= SCOOPS;
      window.setTimeout(function () {
        if (!alive) return;
        pose = "rest";
        shown = "";
        paint();
        if (done) {
          scoop.hidden = true;
          again.hidden = false;
          banner.hidden = false;
          numeral.classList.add("parked");
          cheer.textContent = "You did it!";
        }
        scooping = false;
      }, 700);
    });

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
    window.setTimeout(function () {
      if (alive) pos.x = goal.x;
      paint();
    }, 1400);
    raf = window.requestAnimationFrame(driveIn);
  }

  root.BernieDrive = { start: start, scoopSay: scoopSay, scoops: SCOOPS };
})(typeof window !== "undefined" ? window : global);
