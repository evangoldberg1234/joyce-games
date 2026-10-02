/* Build a Loader. This file is the vehicle config and its art.
   A future Build a Car is another folder: new parts, a draw(), and drive spots.
   The questions, speech, build flow, and drive scene stay in bernie/shared/. */
(function () {
  var SVG = "http://www.w3.org/2000/svg";

  var PARTS = [
    { id: "wheels" },
    { id: "frame" },
    { id: "cab" },
    { id: "arms" },
    { id: "bucket" },
    { id: "light" }
  ];

  function node(name, attrs, parent) {
    var el = document.createElementNS(SVG, name);
    var key;
    for (key in attrs) {
      if (Object.prototype.hasOwnProperty.call(attrs, key)) el.setAttribute(key, attrs[key]);
    }
    if (parent) parent.appendChild(el);
    return el;
  }

  function has(state, id) {
    return state.parts.indexOf(id) !== -1;
  }

  function group(parent, id, state) {
    var g = node("g", {}, parent);
    var cls = "part" + (has(state, id) ? " on" : "") + (state.just === id ? " snap" : "");
    g.setAttribute("class", cls);
    return g;
  }

  function wheel(parent, cx) {
    node("circle", { cx: cx, cy: 158, r: 30, fill: "#2c2c2c" }, parent);
    node("circle", { cx: cx, cy: 158, r: 14, fill: "#ffe14a" }, parent);
    node("circle", { cx: cx, cy: 158, r: 5, fill: "#6a4a12" }, parent);
  }

  function draw(host, state) {
    host.innerHTML = "";
    var svg = node("svg", {
      viewBox: "0 0 320 200",
      class: "loader-svg",
      role: "img",
      "aria-label": "Loader"
    });
    host.appendChild(svg);

    node("ellipse", { cx: 160, cy: 186, rx: 120, ry: 10, fill: "rgba(90, 58, 20, 0.25)" }, svg);
    var sketch = node("g", {
      fill: "none",
      stroke: "#8a5a12",
      "stroke-width": "5",
      "stroke-linejoin": "round",
      opacity: "0.45"
    }, svg);
    node("circle", { cx: 92, cy: 158, r: 30 }, sketch);
    node("circle", { cx: 178, cy: 158, r: 30 }, sketch);
    node("rect", { x: 62, y: 124, width: 150, height: 36, rx: 10 }, sketch);
    node("rect", { x: 64, y: 74, width: 92, height: 64, rx: 12 }, sketch);
    node("path", { d: "M150 100 L240 68 L300 90 L292 118 L220 124 Z" }, sketch);
    node("circle", { cx: 100, cy: 56, r: 14 }, sketch);

    var wheels = group(svg, "wheels", state);
    wheel(wheels, 92);
    wheel(wheels, 178);

    var frame = group(svg, "frame", state);
    node("rect", { x: 62, y: 132, width: 168, height: 28, rx: 8, fill: "#f0b429" }, frame);
    node("rect", { x: 78, y: 124, width: 120, height: 14, rx: 6, fill: "#e09a12" }, frame);

    var cab = group(svg, "cab", state);
    node("rect", { x: 64, y: 74, width: 92, height: 64, rx: 12, fill: "#ffd24a" }, cab);
    node("rect", { x: 76, y: 86, width: 52, height: 30, rx: 6, fill: "#c9ecff" }, cab);
    node("rect", { x: 108, y: 110, width: 28, height: 22, rx: 4, fill: "#c98410" }, cab);

    var arms = group(svg, "arms", state);
    node("line", {
      x1: 156, y1: 96, x2: 236, y2: 70,
      stroke: "#d89216", "stroke-width": 14, "stroke-linecap": "round"
    }, arms);
    node("line", {
      x1: 164, y1: 126, x2: 232, y2: 112,
      stroke: "#c98410", "stroke-width": 10, "stroke-linecap": "round"
    }, arms);

    var bucket = group(svg, "bucket", state);
    var tilt = state.bucketUp ? "rotate(-36 230 104)" : "rotate(8 230 104)";
    var scoop = node("g", { transform: tilt }, bucket);
    node("path", {
      d: "M214 78 L286 64 L300 84 L292 118 L228 124 Z",
      fill: "#f6c445",
      stroke: "#c98410",
      "stroke-width": 4,
      "stroke-linejoin": "round"
    }, scoop);
    node("rect", { x: 286, y: 108, width: 10, height: 8, fill: "#6a6a6a" }, scoop);
    node("rect", { x: 270, y: 114, width: 10, height: 8, fill: "#6a6a6a" }, scoop);
    if (state.carrying) {
      node("ellipse", { cx: 258, cy: 96, rx: 22, ry: 12, fill: "#8a5a2b" }, scoop);
    }

    var light = group(svg, "light", state);
    node("rect", { x: 96, y: 62, width: 8, height: 16, rx: 2, fill: "#6a6a6a" }, light);
    node("circle", { cx: 100, cy: 56, r: 14, fill: "#ff4d4d" }, light);
    node("circle", { cx: 100, cy: 56, r: 6, fill: "#ffe9a0" }, light);
  }

  var vehicle = {
    id: "loader",
    parts: PARTS,
    draw: draw,
    drive: {
      start: { x: 0.42, y: 0.64 },
      pile: { x: 0.8, y: 0.62 },
      dump: { x: 0.18, y: 0.64 },
      near: 120
    }
  };

  var stage = document.getElementById("stage");
  BernieBuild.start({
    mount: stage,
    vehicle: vehicle,
    questions: window.BernieQuestions,
    speak: window.BernieSpeak,
    onDone: function () {
      BernieDrive.start({
        mount: stage,
        vehicle: vehicle,
        speak: window.BernieSpeak
      });
    }
  });
})();
