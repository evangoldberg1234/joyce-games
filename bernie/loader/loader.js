/* Build a Loader from six photo pieces that tile the side photo.
   A future car is another folder: its own parts (src, x, y), board, and draw(). */
(function () {
  var BOARD = { w: 1000, h: 618 };
  /* Exclusive crops of ghost.webp. Together they rebuild it with no overlap. */
  var PARTS = [
    { id: "rear-wheel", name: "Rear wheel", src: "img/rear-wheel.webp", x: 671, y: 315, w: 252, h: 237, group: "body" },
    { id: "front-wheel", name: "Front wheel", src: "img/front-wheel.webp", x: 163, y: 354, w: 271, h: 259, group: "body" },
    { id: "engine", name: "Engine", src: "img/engine.webp", x: 154, y: 39, w: 840, h: 442, group: "body" },
    { id: "cab", name: "Cab", src: "img/cab.webp", x: 451, y: 5, w: 310, h: 251, group: "body" },
    { id: "arms", name: "Lift arms", src: "img/arms.webp", x: 72, y: 170, w: 474, h: 279, group: "arms" },
    { id: "bucket", name: "Bucket", src: "img/bucket.webp", x: 5, y: 408, w: 170, h: 112, group: "bucket" }
  ];
  /* Boom pin on the chassis. The bucket sits left and below it, so a positive
     turn lifts the arms and the bucket. */
  var LINK = {
    pivot: { x: 470, y: 210 },
    carry: 24,
    dump: 36
  };
  var LIFT = { arms: true, bucket: true };

  function layer(className, origin) {
    var node = document.createElement("div");
    node.className = className;
    if (origin) {
      node.style.transformOrigin = (origin.x / BOARD.w * 100) + "% " + (origin.y / BOARD.h * 100) + "%";
    }
    return node;
  }

  function piece(part) {
    var img = document.createElement("img");
    img.className = "bit";
    img.alt = "";
    img.src = part.src;
    img.draggable = false;
    img.style.left = (part.x / BOARD.w * 100) + "%";
    img.style.top = (part.y / BOARD.h * 100) + "%";
    img.style.width = (part.w / BOARD.w * 100) + "%";
    img.style.height = (part.h / BOARD.h * 100) + "%";
    return img;
  }

  /* Drive pose: the same six pieces. Only the arms and bucket rotate. */
  function draw(host, state) {
    host.innerHTML = "";
    var pose = state.pose || "rest";
    var rig = document.createElement("div");
    rig.className = "photo-rig";
    var link = layer("linkage", LINK.pivot);
    var angle = pose === "carry" ? LINK.carry : (pose === "dump" ? LINK.dump : 0);
    if (angle) link.style.transform = "rotate(" + angle + "deg)";
    var i;
    for (i = 0; i < PARTS.length; i++) {
      var img = piece(PARTS[i]);
      if (LIFT[PARTS[i].id]) link.appendChild(img);
      else rig.appendChild(img);
    }
    if (state.carrying) {
      var dirt = document.createElement("div");
      dirt.className = "scoop-dirt";
      var r;
      for (r = 0; r < 5; r++) {
        var rock = document.createElement("span");
        rock.className = "stone stone-" + (r % 3);
        dirt.appendChild(rock);
      }
      link.appendChild(dirt);
    }
    rig.appendChild(link);
    host.appendChild(rig);
  }

  var vehicle = {
    id: "loader",
    parts: PARTS,
    board: BOARD,
    ghost: "img/ghost.webp",
    outline: "img/outline.webp",
    finale: "img/finale.webp",
    draw: draw,
    drive: {
      start: { x: 0.5, y: window.innerWidth > window.innerHeight ? 0.92 : 0.78 },
      pile: { x: 0.16, y: window.innerWidth > window.innerHeight ? 0.92 : 0.78 },
      dump: { x: 0.88, y: window.innerWidth > window.innerHeight ? 0.92 : 0.78 },
      near: 120
    }
  };

  var stage = document.getElementById("stage");
  if (!stage || !window.BernieBuild) return;

  function play() {
    BernieBuild.start({
      mount: stage,
      vehicle: vehicle,
      questions: window.BernieQuestions,
      speak: window.BernieSpeak,
      onDone: function () {
        BernieDrive.start({
          mount: stage,
          vehicle: vehicle,
          speak: window.BernieSpeak,
          onAgain: play
        });
      }
    });
  }

  /* A quick tap must not leave the game. Hold Back to go to the hub. */
  var back = document.querySelector(".loader-page .back");
  if (back) {
    var holdTimer = 0;
    back.addEventListener("click", function (event) {
      event.preventDefault();
    });
    back.addEventListener("pointerdown", function () {
      back.classList.add("holding");
      holdTimer = window.setTimeout(function () {
        holdTimer = 0;
        window.location.href = back.getAttribute("href");
      }, 700);
    });
    function cancelHold() {
      back.classList.remove("holding");
      if (!holdTimer) return;
      window.clearTimeout(holdTimer);
      holdTimer = 0;
      back.classList.remove("wiggle");
      void back.offsetWidth;
      back.classList.add("wiggle");
    }
    back.addEventListener("pointerup", cancelHold);
    back.addEventListener("pointerleave", cancelHold);
    back.addEventListener("pointercancel", cancelHold);
  }

  /* A quick tap must not open the kid menu. Hold the switcher to use it. */
  function guardSwitcher() {
    var btn = document.querySelector("#kid-switch .ks-btn");
    var menu = document.getElementById("kid-switch-menu");
    if (!btn || !menu || btn.dataset.guarded) return;
    btn.dataset.guarded = "1";
    var timer = 0;
    btn.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
    }, true);
    btn.addEventListener("pointerdown", function () {
      timer = window.setTimeout(function () {
        timer = 0;
        var open = menu.hidden;
        btn.setAttribute("aria-expanded", open ? "true" : "false");
        menu.hidden = !open;
      }, 700);
    });
    function cancelSwitch() {
      if (!timer) return;
      window.clearTimeout(timer);
      timer = 0;
      btn.classList.remove("wiggle");
      void btn.offsetWidth;
      btn.classList.add("wiggle");
    }
    btn.addEventListener("pointerup", cancelSwitch);
    btn.addEventListener("pointerleave", cancelSwitch);
    btn.addEventListener("pointercancel", cancelSwitch);
  }
  window.setTimeout(guardSwitcher, 0);

  play();
})();
