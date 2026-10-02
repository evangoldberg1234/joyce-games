/* Build a Loader. Shaded wheel-loader art plus a parts list.
   A future car is another folder: new parts, a draw(), and drive spots. */
(function () {
  var SVG = "http://www.w3.org/2000/svg";
  var PARTS = [
    { id: "wheels", name: "Wheels" },
    { id: "rear", name: "Engine" },
    { id: "joint", name: "Joint" },
    { id: "front", name: "Front frame" },
    { id: "arms", name: "Arms" },
    { id: "cylinders", name: "Cylinders" },
    { id: "cab", name: "Cab" },
    { id: "bucket", name: "Bucket" }
  ];
  var BURST = {
    wheels: [0, 82],
    rear: [-92, 6],
    joint: [0, -96],
    front: [18, 78],
    arms: [48, -112],
    cylinders: [6, -132],
    cab: [-86, -102],
    bucket: [102, -28]
  };
  var CENTER = {
    wheels: [334, 328],
    rear: [176, 268],
    joint: [360, 300],
    front: [490, 286],
    arms: [590, 220],
    cylinders: [560, 210],
    cab: [280, 182],
    bucket: [710, 186]
  };

  function node(name, attrs, parent) {
    var el = document.createElementNS(SVG, name);
    var key;
    for (key in attrs) {
      if (Object.prototype.hasOwnProperty.call(attrs, key)) el.setAttribute(key, attrs[key]);
    }
    if (parent) parent.appendChild(el);
    return el;
  }

  function grad(defs, id, x1, y1, x2, y2, stops) {
    var g = node("linearGradient", { id: id, x1: x1, y1: y1, x2: x2, y2: y2 }, defs);
    stops.forEach(function (stop) {
      node("stop", { offset: stop[0], "stop-color": stop[1] }, g);
    });
  }

  function radial(defs, id, stops) {
    var g = node("radialGradient", { id: id, cx: "35%", cy: "35%", r: "70%" }, defs);
    stops.forEach(function (stop) {
      node("stop", { offset: stop[0], "stop-color": stop[1] }, g);
    });
  }

  function addDefs(svg) {
    var d = node("defs", {}, svg);
    grad(d, "ld-paint", "0", "0", "0", "1", [["0%", "#fff4b0"], ["42%", "#f0c034"], ["100%", "#c68612"]]);
    grad(d, "ld-paint-side", "0", "0", "1", "0", [["0%", "#ffe98a"], ["55%", "#e2a41c"], ["100%", "#a87410"]]);
    grad(d, "ld-steel", "0", "0", "0", "1", [["0%", "#f7f8f8"], ["45%", "#b7bcc1"], ["100%", "#5e656c"]]);
    grad(d, "ld-steel-dark", "0", "0", "1", "1", [["0%", "#8d949b"], ["100%", "#2c3136"]]);
    grad(d, "ld-glass", "0", "0", "0", "1", [["0%", "rgba(236,250,255,0.95)"], ["55%", "rgba(126,196,220,0.72)"], ["100%", "rgba(62,120,150,0.78)"]]);
    grad(d, "ld-hose", "0", "0", "1", "0", [["0%", "#3a3a3a"], ["50%", "#111"], ["100%", "#2a2a2a"]]);
    radial(d, "ld-rubber", [["0%", "#4a4a4a"], ["62%", "#1c1c1c"], ["100%", "#0a0a0a"]]);
    radial(d, "ld-rim", [["0%", "#f3f4f5"], ["70%", "#8e959c"], ["100%", "#3e444a"]]);
    radial(d, "ld-bolt", [["0%", "#fff"], ["100%", "#8a8172"]]);
    grad(d, "ld-soil", "0", "0", "0", "1", [["0%", "#c49a62"], ["40%", "#8d5a30"], ["100%", "#5a3418"]]);
  }

  function bolt(parent, cx, cy) {
    node("circle", { cx: cx, cy: cy, r: 3.4, fill: "url(#ld-bolt)" }, parent);
    node("rect", { x: cx - 1.6, y: cy - 0.5, width: 3.2, height: 1, fill: "#5c5346" }, parent);
  }

  function has(state, id) {
    return state.parts.indexOf(id) !== -1;
  }

  function nameOf(id) {
    var i;
    for (i = 0; i < PARTS.length; i++) {
      if (PARTS[i].id === id) return PARTS[i].name;
    }
    return "";
  }

  function tire(parent, cx, cy, r, ghost) {
    if (ghost) {
      node("circle", {
        cx: cx, cy: cy, r: r, fill: "none", stroke: "#6a5344",
        "stroke-width": 2.5, "stroke-dasharray": "6 4"
      }, parent);
      return;
    }
    node("circle", { cx: cx, cy: cy, r: r, fill: "url(#ld-rubber)" }, parent);
    node("circle", {
      cx: cx, cy: cy, r: r * 0.78, fill: "none", stroke: "#141414",
      "stroke-width": 7, "stroke-dasharray": "8 6"
    }, parent);
    node("circle", {
      cx: cx, cy: cy, r: r * 0.62, fill: "none", stroke: "#2a2a2a",
      "stroke-width": 3, "stroke-dasharray": "3 4"
    }, parent);
    node("circle", { cx: cx, cy: cy, r: r * 0.4, fill: "url(#ld-rim)" }, parent);
    node("circle", { cx: cx, cy: cy, r: r * 0.14, fill: "#2a2e32" }, parent);
    var i;
    for (i = 0; i < 6; i++) {
      var a = (i / 6) * Math.PI * 2;
      bolt(parent, cx + Math.cos(a) * r * 0.27, cy + Math.sin(a) * r * 0.27);
    }
    node("ellipse", {
      cx: cx - r * 0.32, cy: cy - r * 0.35, rx: r * 0.22, ry: r * 0.1,
      fill: "rgba(255,255,255,0.22)"
    }, parent);
  }

  function drawWheels(parent, ghost) {
    tire(parent, 168, 318, 42, ghost);
    tire(parent, 198, 336, 56, ghost);
    tire(parent, 468, 318, 42, ghost);
    tire(parent, 500, 336, 56, ghost);
    if (ghost) return;
    node("rect", { x: 176, y: 328, width: 44, height: 10, rx: 3, fill: "url(#ld-steel-dark)" }, parent);
    node("rect", { x: 478, y: 328, width: 44, height: 10, rx: 3, fill: "url(#ld-steel-dark)" }, parent);
  }

  function drawRear(parent, ghost) {
    if (ghost) {
      node("path", {
        d: "M70 250 h150 a16 16 0 0 1 16 16 v80 h-90 a18 18 0 0 1 -18 -18 v-50 a16 16 0 0 1 18 -16 z",
        fill: "none", stroke: "#6a5344", "stroke-width": 2.5, "stroke-dasharray": "7 5"
      }, parent);
      return;
    }
    node("path", {
      d: "M78 268 h70 v78 h-58 a16 16 0 0 1 -16 -16 v-46 a16 16 0 0 1 16 -16 z",
      fill: "url(#ld-steel-dark)"
    }, parent);
    node("path", {
      d: "M112 214 h150 a14 14 0 0 1 14 14 v92 h-176 v-94 a12 12 0 0 1 12 -12 z",
      fill: "url(#ld-paint)"
    }, parent);
    node("path", {
      d: "M124 226 h120 v16 h-120 z",
      fill: "rgba(255,255,255,0.28)"
    }, parent);
    node("rect", { x: 250, y: 236, width: 18, height: 70, rx: 3, fill: "url(#ld-paint-side)" }, parent);
    var y;
    for (y = 0; y < 5; y++) {
      node("rect", { x: 86, y: 286 + y * 12, width: 48, height: 4, rx: 1, fill: "#1e2226" }, parent);
    }
    node("rect", { x: 168, y: 168, width: 12, height: 48, rx: 3, fill: "url(#ld-steel-dark)" }, parent);
    node("ellipse", { cx: 174, cy: 164, rx: 8, ry: 5, fill: "#333" }, parent);
    bolt(parent, 140, 250);
    bolt(parent, 230, 250);
    bolt(parent, 200, 300);
    node("path", {
      d: "M150 250 C 120 230, 100 260, 90 300",
      fill: "none", stroke: "url(#ld-hose)", "stroke-width": 6, "stroke-linecap": "round"
    }, parent);
    node("path", {
      d: "M150 246 C 122 228, 104 256, 94 294",
      fill: "none", stroke: "rgba(255,255,255,0.25)", "stroke-width": 1.5
    }, parent);
  }

  function drawJoint(parent, ghost) {
    if (ghost) {
      node("circle", {
        cx: 360, cy: 300, r: 28, fill: "none", stroke: "#6a5344",
        "stroke-width": 2.5, "stroke-dasharray": "6 4"
      }, parent);
      return;
    }
    node("circle", { cx: 360, cy: 300, r: 30, fill: "url(#ld-steel)" }, parent);
    node("circle", { cx: 360, cy: 300, r: 16, fill: "url(#ld-steel-dark)" }, parent);
    node("circle", { cx: 360, cy: 300, r: 6, fill: "#f3e2a0" }, parent);
    bolt(parent, 360, 274);
    bolt(parent, 386, 300);
    bolt(parent, 360, 326);
    bolt(parent, 334, 300);
    node("path", {
      d: "M332 286 h56",
      stroke: "rgba(255,255,255,0.45)", "stroke-width": 3, "stroke-linecap": "round"
    }, parent);
  }

  function drawFront(parent, ghost) {
    if (ghost) {
      node("path", {
        d: "M390 250 h150 v70 h-40 l-20 20 h-90 z",
        fill: "none", stroke: "#6a5344", "stroke-width": 2.5, "stroke-dasharray": "7 5"
      }, parent);
      return;
    }
    node("path", {
      d: "M392 248 h156 a8 8 0 0 1 8 8 v58 h-46 l-24 22 h-94 z",
      fill: "url(#ld-paint)"
    }, parent);
    node("path", { d: "M404 260 h130 v12 h-130 z", fill: "rgba(255,255,255,0.3)" }, parent);
    node("rect", { x: 470, y: 200, width: 36, height: 70, rx: 6, fill: "url(#ld-paint-side)" }, parent);
    bolt(parent, 430, 290);
    bolt(parent, 500, 290);
    bolt(parent, 470, 220);
    node("rect", { x: 520, y: 300, width: 28, height: 14, rx: 3, fill: "url(#ld-steel-dark)" }, parent);
  }

  function drawCab(parent, ghost) {
    if (ghost) {
      node("rect", {
        x: 214, y: 118, width: 132, height: 128, rx: 12,
        fill: "none", stroke: "#6a5344", "stroke-width": 2.5, "stroke-dasharray": "7 5"
      }, parent);
      return;
    }
    node("rect", { x: 214, y: 118, width: 132, height: 128, rx: 14, fill: "url(#ld-paint)" }, parent);
    node("path", { d: "M226 130 h108 v10 h-108 z", fill: "rgba(255,255,255,0.35)" }, parent);
    node("rect", { x: 230, y: 146, width: 96, height: 62, rx: 6, fill: "url(#ld-glass)" }, parent);
    node("path", { d: "M238 154 h40 v18 h-40 z", fill: "rgba(255,255,255,0.55)" }, parent);
    node("path", { d: "M248 168 l28 28", stroke: "rgba(40,70,90,0.35)", "stroke-width": 2 }, parent);
    node("rect", { x: 300, y: 214, width: 36, height: 28, rx: 3, fill: "#1d4e6e" }, parent);
    node("rect", { x: 214, y: 168, width: 8, height: 40, rx: 2, fill: "url(#ld-steel)" }, parent);
    node("circle", { cx: 214, cy: 160, r: 8, fill: "#222" }, parent);
    bolt(parent, 230, 236);
    bolt(parent, 320, 236);
  }

  function drawArms(parent, ghost) {
    var upper = {
      x1: 488, y1: 214, x2: 690, y2: 156,
      stroke: ghost ? "#6a5344" : "url(#ld-steel)",
      "stroke-linecap": "round",
      "stroke-width": ghost ? 10 : 16
    };
    var lower = {
      x1: 500, y1: 292, x2: 676, y2: 230,
      stroke: ghost ? "#6a5344" : "url(#ld-steel-dark)",
      "stroke-linecap": "round",
      "stroke-width": ghost ? 8 : 12
    };
    if (ghost) {
      upper["stroke-dasharray"] = "7 5";
      lower["stroke-dasharray"] = "7 5";
    }
    node("line", upper, parent);
    node("line", lower, parent);
    if (ghost) return;
    node("line", {
      x1: 492, y1: 208, x2: 680, y2: 154,
      stroke: "rgba(255,255,255,0.45)", "stroke-width": 3, "stroke-linecap": "round"
    }, parent);
    bolt(parent, 488, 214);
    bolt(parent, 690, 156);
    bolt(parent, 676, 230);
    node("circle", { cx: 690, cy: 188, r: 10, fill: "url(#ld-steel-dark)" }, parent);
  }

  function drawCylinders(parent, ghost) {
    if (ghost) {
      node("line", {
        x1: 450, y1: 250, x2: 600, y2: 186,
        stroke: "#6a5344", "stroke-width": 8, "stroke-linecap": "round", "stroke-dasharray": "6 4"
      }, parent);
      node("line", {
        x1: 610, y1: 170, x2: 700, y2: 150,
        stroke: "#6a5344", "stroke-width": 7, "stroke-linecap": "round", "stroke-dasharray": "6 4"
      }, parent);
      return;
    }
    node("line", {
      x1: 450, y1: 250, x2: 600, y2: 186,
      stroke: "url(#ld-steel-dark)", "stroke-width": 12, "stroke-linecap": "round"
    }, parent);
    node("line", {
      x1: 500, y1: 228, x2: 590, y2: 196,
      stroke: "url(#ld-steel)", "stroke-width": 18, "stroke-linecap": "round"
    }, parent);
    node("line", {
      x1: 610, y1: 170, x2: 700, y2: 150,
      stroke: "url(#ld-steel)", "stroke-width": 11, "stroke-linecap": "round"
    }, parent);
    node("path", {
      d: "M470 240 C 500 210, 540 230, 590 190",
      fill: "none", stroke: "url(#ld-hose)", "stroke-width": 5, "stroke-linecap": "round"
    }, parent);
    node("path", {
      d: "M474 236 C 502 208, 538 226, 586 188",
      fill: "none", stroke: "rgba(255,255,255,0.28)", "stroke-width": 1.4
    }, parent);
    bolt(parent, 450, 250);
    bolt(parent, 600, 186);
  }

  function drawBucket(parent, ghost, pose, carrying) {
    var g = node("g", {}, parent);
    if (ghost) {
      node("path", {
        d: "M640 150 L760 132 L792 168 L768 230 L652 214 Q 628 186 640 150 Z",
        fill: "none", stroke: "#6a5344", "stroke-width": 2.5, "stroke-dasharray": "7 5"
      }, g);
      return;
    }
    node("path", {
      d: "M640 148 L762 128 L796 166 L770 232 L650 214 Q 624 184 640 148 Z",
      fill: "url(#ld-paint)", stroke: "#8a5a10", "stroke-width": 2
    }, g);
    node("path", { d: "M652 156 L748 140 L756 156 L656 170 Z", fill: "rgba(255,255,255,0.35)" }, g);
    node("path", {
      d: "M650 214 L770 230 L762 242 L646 224 Z",
      fill: "url(#ld-steel-dark)"
    }, g);
    var t;
    for (t = 0; t < 5; t++) {
      node("rect", {
        x: 656 + t * 22, y: 226, width: 8, height: 12, rx: 1, fill: "#2a2a2a"
      }, g);
    }
    bolt(parent, 700, 188);
    if (carrying) {
      node("ellipse", { cx: 710, cy: 176, rx: 36, ry: 16, fill: "url(#ld-soil)" }, g);
      node("circle", { cx: 690, cy: 170, r: 7, fill: "#6b4424" }, g);
      node("circle", { cx: 724, cy: 168, r: 5, fill: "#8a5a32" }, g);
    }
  }

  function drawOne(parent, id, ghost, state) {
    if (id === "wheels") drawWheels(parent, ghost);
    else if (id === "rear") drawRear(parent, ghost);
    else if (id === "joint") drawJoint(parent, ghost);
    else if (id === "front") drawFront(parent, ghost);
    else if (id === "cab") drawCab(parent, ghost);
    else if (id === "arms") drawArms(parent, ghost);
    else if (id === "cylinders") drawCylinders(parent, ghost);
    else if (id === "bucket") drawBucket(parent, ghost, state.pose || "rest", !!state.carrying);
  }

  function ghost(parent, id, state, burst) {
    if (has(state, id)) return;
    var shift = burst ? BURST[id] : [0, 0];
    var g = node("g", {
      class: "part ghost" + (burst ? " burst" : " plan"),
      transform: "translate(" + shift[0] + " " + shift[1] + ")"
    }, parent);
    drawOne(g, id, true, state);
  }

  function solid(parent, id, state) {
    if (!has(state, id)) return null;
    var g = node("g", { class: "part on" }, parent);
    drawOne(g, id, false, state);
    if (state.just === id) g.setAttribute("data-snap", "1");
    return g;
  }

  function armSnap(svg) {
    var g = svg.querySelector("[data-snap]");
    if (!g) return;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    window.requestAnimationFrame(function () {
      var gb = g.getBoundingClientRect();
      var sb = svg.getBoundingClientRect();
      if (!gb.width || !sb.width) return;
      var dx = (sb.left + sb.width / 2) - (gb.left + gb.width / 2);
      var dy = (sb.top + sb.height * 0.42) - (gb.top + gb.height / 2);
      g.style.setProperty("--snap-x", dx + "px");
      g.style.setProperty("--snap-y", dy + "px");
      g.classList.add("snap");
    });
  }

  function draw(host, state) {
    host.innerHTML = "";
    var pose = state.pose || "rest";
    var complete = state.parts.length >= PARTS.length;
    var svg = node("svg", {
      viewBox: complete ? "48 28 800 400" : "-80 -110 1020 660",
      class: "loader-svg",
      role: "img",
      "aria-label": "Wheel loader"
    });
    host.appendChild(svg);
    addDefs(svg);
    node("ellipse", { cx: 400, cy: 400, rx: 280, ry: 16, fill: "rgba(70,42,18,0.28)" }, svg);

    var ghosts = node("g", {}, svg);
    var i;
    if (!complete) {
      for (i = 0; i < PARTS.length; i++) {
        var id = PARTS[i].id;
        if (has(state, id)) continue;
        var home = CENTER[id];
        var shift = BURST[id];
        node("line", {
          x1: home[0], y1: home[1],
          x2: home[0] + shift[0], y2: home[1] + shift[1],
          stroke: "#8d6b45", "stroke-width": 1.5, "stroke-dasharray": "2 5"
        }, ghosts);
      }
      for (i = 0; i < PARTS.length; i++) ghost(ghosts, PARTS[i].id, state, false);
      for (i = 0; i < PARTS.length; i++) ghost(ghosts, PARTS[i].id, state, true);
    }

    ["wheels", "rear", "joint", "front", "cab"].forEach(function (id) {
      solid(svg, id, state);
    });

    var linkage = node("g", {}, svg);
    if (pose === "carry") linkage.setAttribute("transform", "rotate(-16 490 250)");
    else if (pose === "dump") linkage.setAttribute("transform", "rotate(-7 490 250)");
    solid(linkage, "arms", state);
    solid(linkage, "cylinders", state);

    var bucketPivot = node("g", {}, linkage);
    if (pose === "carry") bucketPivot.setAttribute("transform", "rotate(-18 700 190)");
    else if (pose === "dump") bucketPivot.setAttribute("transform", "rotate(30 700 190)");
    solid(bucketPivot, "bucket", state);

    if (state.just) {
      var label = document.createElement("p");
      label.className = "earn-label";
      label.textContent = nameOf(state.just);
      host.appendChild(label);
    }
    armSnap(svg);
  }

  var vehicle = {
    id: "loader",
    parts: PARTS,
    draw: draw,
    drive: {
      start: { x: 0.5, y: 0.68 },
      pile: { x: 0.84, y: 0.66 },
      dump: { x: 0.16, y: 0.68 },
      near: 120
    }
  };

  var stage = document.getElementById("stage");
  if (!stage || !window.BernieBuild) return;
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
