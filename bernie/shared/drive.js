/* Drive scene. Drag the vehicle, or tap where it should go.
   Scoop lifts dirt near the pile. Dump drops it in the truck.
   The vehicle config supplies draw() and drive spot positions. */
(function (root) {
  function el(tag, className) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    return node;
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
    var loads = 0;
    var raf = 0;
    var all = vehicle.parts.map(function (part) { return part.id; });

    var scene = el("div", "scene");
    var pile = el("div", "pile");
    pile.setAttribute("aria-hidden", "true");
    pile.appendChild(el("span", "mound mound-a"));
    pile.appendChild(el("span", "mound mound-b"));
    pile.appendChild(el("span", "mound mound-c"));
    var truck = el("div", "truck");
    truck.setAttribute("aria-hidden", "true");
    truck.appendChild(el("span", "bed"));
    truck.appendChild(el("span", "cab"));
    truck.appendChild(el("span", "wheel back-wheel"));
    truck.appendChild(el("span", "wheel front-wheel"));
    var dirt = el("span", "dirt");
    truck.appendChild(dirt);
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
      vehicle.draw(art, {
        parts: all,
        bucketUp: carrying,
        carrying: carrying,
        just: ""
      });
      rig.style.left = (pos.x * 100) + "%";
      rig.style.top = (pos.y * 100) + "%";
      rig.style.transform = "translate(-50%, -70%) scaleX(" + facing + ")";
      dirt.style.height = Math.min(loads, 6) * 8 + "px";
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
      loads += 1;
      tally.textContent = String(loads);
      tally.setAttribute("aria-label", loads + " loads");
      paint();
      pop("Yay " + loads);
      say("Yay! " + loads);
    });

    lockPage();
    paint();
  }

  root.BernieDrive = { start: start };
})(typeof window !== "undefined" ? window : global);
