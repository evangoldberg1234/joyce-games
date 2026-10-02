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

  function start(opts) {
    var vehicle = opts.vehicle;
    var speak = opts.speak;
    var spots = vehicle.drive || {};
    var origin = spots.start || { x: 0.4, y: 0.62 };
    var pileAt = spots.pile || { x: 0.8, y: 0.58 };
    var dumpAt = spots.dump || { x: 0.18, y: 0.62 };
    function reach() {
      var rigBox = rig.getBoundingClientRect();
      return Math.max(96, rigBox.width * 0.95);
    }
    var pos = { x: origin.x, y: origin.y };
    var target = null;
    var dragging = false;
    var pointerId = null;
    var grab = null;
    var facing = 1;
    var carrying = false;
    var pose = "rest";
    var loads = 0;
    var raf = 0;
    var shown = "";
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

    var bar = el("div", "drive-bar");
    var scoop = el("button", "scoop");
    scoop.type = "button";
    scoop.textContent = "Scoop";
    var tally = el("p", "tally");
    tally.textContent = "0";
    tally.setAttribute("aria-label", "0 loads");
    var dump = el("button", "dump");
    dump.type = "button";
    dump.textContent = "Dump";
    bar.appendChild(scoop);
    bar.appendChild(tally);
    bar.appendChild(dump);

    opts.mount.innerHTML = "";
    opts.mount.appendChild(scene);
    opts.mount.appendChild(bar);

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

    function paint() {
      var key = pose + (carrying ? "-full" : "-empty");
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
      rig.style.transform = "translate(-50%, -70%) scaleX(" + facing + ")";
      var piled = Math.min(loads, 6);
      dirt.setAttribute("height", String(piled * 8));
      dirt.setAttribute("y", String(100 - piled * 8));
    }

    function point(event) {
      var box = scene.getBoundingClientRect();
      return {
        x: (event.clientX - box.left) / box.width,
        y: (event.clientY - box.top) / box.height
      };
    }

    function face(dx) {
      if (dx > 0.004) facing = 1;
      else if (dx < -0.004) facing = -1;
    }

    function step() {
      raf = 0;
      if (!target) return;
      var dx = target.x - pos.x;
      var dy = target.y - pos.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 0.012) {
        pos.x = target.x;
        pos.y = target.y;
        target = null;
        paint();
        return;
      }
      var hop = Math.min(0.025, dist);
      pos.x += (dx / dist) * hop;
      pos.y += (dy / dist) * hop;
      face(dx);
      paint();
      raf = window.requestAnimationFrame(step);
    }

    function go(next) {
      target = {
        x: clamp(next.x, 0.1, 0.9),
        y: clamp(next.y, 0.34, 0.78)
      };
      if (!raf) raf = window.requestAnimationFrame(step);
    }

    scene.addEventListener("pointerdown", function (event) {
      if (event.target.closest && event.target.closest("button")) return;
      try {
        if (scene.setPointerCapture) scene.setPointerCapture(event.pointerId);
      } catch (err) {
        /* A lost pointer should still move the loader. */
      }
      pointerId = event.pointerId;
      var here = point(event);
      if (event.target.closest && event.target.closest(".rig")) {
        dragging = true;
        target = null;
        grab = { x: here.x, y: here.y, ox: pos.x, oy: pos.y };
      } else {
        dragging = false;
        grab = null;
        go(here);
      }
    });

    scene.addEventListener("pointermove", function (event) {
      if (pointerId !== event.pointerId) return;
      var here = point(event);
      if (dragging && grab) {
        face(here.x - grab.x);
        pos.x = clamp(grab.ox + (here.x - grab.x), 0.1, 0.9);
        pos.y = clamp(grab.oy + (here.y - grab.y), 0.34, 0.78);
        paint();
        return;
      }
      go(here);
    });

    function endPointer(event) {
      if (pointerId !== event.pointerId) return;
      dragging = false;
      grab = null;
      pointerId = null;
    }

    scene.addEventListener("pointerup", endPointer);
    scene.addEventListener("pointercancel", endPointer);
    scene.addEventListener("contextmenu", function (event) {
      event.preventDefault();
    });
    scene.addEventListener("wheel", function (event) {
      event.preventDefault();
    }, { passive: false });
    scene.addEventListener("touchmove", preventScroll, { passive: false });
    document.addEventListener("touchmove", preventScroll, { passive: false });

    function say(text) {
      speak.arm();
      speak.speak(text);
    }

    function pop(text) {
      cheer.textContent = text;
      cheer.classList.remove("show");
      void cheer.offsetWidth;
      cheer.classList.add("show");
    }

    scoop.addEventListener("click", function () {
      if (!near(center(rig), center(pile), reach())) {
        say("Drive to the dirt.");
        pile.classList.remove("wiggle");
        void pile.offsetWidth;
        pile.classList.add("wiggle");
        return;
      }
      if (carrying) {
        say("Dump it.");
        return;
      }
      carrying = true;
      pose = "carry";
      paint();
      say("Scoop!");
    });

    dump.addEventListener("click", function () {
      if (!carrying) {
        say("Scoop some dirt.");
        return;
      }
      if (!near(center(rig), center(truck), reach())) {
        say("Drive to the truck.");
        truck.classList.remove("wiggle");
        void truck.offsetWidth;
        truck.classList.add("wiggle");
        return;
      }
      carrying = false;
      pose = "dump";
      loads += 1;
      tally.textContent = String(loads);
      tally.setAttribute("aria-label", loads + " loads");
      paint();
      pop("Yay " + loads);
      say("Yay! " + loads);
      window.setTimeout(function () {
        if (pose === "dump") {
          pose = "rest";
          paint();
        }
      }, 700);
    });

    lockPage();
    paint();
  }

  root.BernieDrive = { start: start };
})(typeof window !== "undefined" ? window : global);
