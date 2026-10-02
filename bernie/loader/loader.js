/* Build a Loader from photo pieces.
   A future car is another folder: its own parts (src, x, y), board, and draw(). */
(function () {
  var BOARD = { w: 1000, h: 618 };
  var PARTS = [
    { id: "counterweight", name: "Counterweight", src: "img/counterweight.webp", x: 8, y: 225, w: 313, h: 385, group: "body" },
    { id: "rear-wheel", name: "Rear wheel", src: "img/rear-wheel.webp", x: 87, y: 327, w: 264, h: 237, inset: "img/inset-rear-wheel.webp", group: "body" },
    { id: "engine", name: "Engine", src: "img/engine.webp", x: 116, y: 215, w: 289, h: 280, inset: "img/inset-engine.webp", group: "body" },
    { id: "cab", name: "Cab", src: "img/cab.webp", x: 332, y: 8, w: 292, h: 273, inset: "img/inset-cab.webp", group: "body" },
    { id: "frame", name: "Front frame", src: "img/frame.webp", x: 303, y: 161, w: 489, h: 441, group: "body" },
    { id: "front-wheel", name: "Front wheel", src: "img/front-wheel.webp", x: 557, y: 310, w: 258, h: 226, inset: "img/inset-front-wheel.webp", group: "body" },
    { id: "arms", name: "Lift arms", src: "img/arms.webp", x: 490, y: 10, w: 335, h: 282, inset: "img/inset-arms.webp", group: "arms" },
    { id: "bucket", name: "Bucket", src: "img/bucket.webp", x: 756, y: 173, w: 235, h: 376, inset: "img/inset-bucket.webp", group: "bucket" }
  ];
  /* Arm pivot and bucket pin, in board pixels. */
  var LINK = {
    pivot: { x: 545, y: 200 },
    hinge: { x: 812, y: 228 },
    carry: { arm: -18, bucket: -14 },
    dump: { arm: -6, bucket: 36 }
  };

  function piece(part) {
    var img = document.createElement("img");
    img.className = "bit";
    img.alt = "";
    img.src = part.src;
    img.style.left = (part.x / BOARD.w * 100) + "%";
    img.style.top = (part.y / BOARD.h * 100) + "%";
    img.style.width = (part.w / BOARD.w * 100) + "%";
    return img;
  }

  function layer(className, origin) {
    var node = document.createElement("div");
    node.className = className;
    if (origin) {
      node.style.transformOrigin = (origin.x / BOARD.w * 100) + "% " + (origin.y / BOARD.h * 100) + "%";
    }
    return node;
  }

  /* Drive pose. Assembly is drawn by the shared build engine. */
  function draw(host, state) {
    host.innerHTML = "";
    var pose = state.pose || "rest";
    var rig = document.createElement("div");
    rig.className = "photo-rig";
    var link = layer("linkage", LINK.pivot);
    var bucketPivot = layer("bucket-pivot", LINK.hinge);
    var spin = pose === "carry" ? LINK.carry : (pose === "dump" ? LINK.dump : null);
    if (spin) {
      link.style.transform = "rotate(" + spin.arm + "deg)";
      bucketPivot.style.transform = "rotate(" + spin.bucket + "deg)";
    }
    var i;
    for (i = 0; i < PARTS.length; i++) {
      var part = PARTS[i];
      if (state.parts.indexOf(part.id) === -1) continue;
      if (part.group === "arms") link.appendChild(piece(part));
      else if (part.group === "bucket") bucketPivot.appendChild(piece(part));
      else rig.appendChild(piece(part));
    }
    if (state.carrying) {
      var dirt = document.createElement("div");
      dirt.className = "scoop-dirt";
      bucketPivot.appendChild(dirt);
    }
    link.appendChild(bucketPivot);
    rig.appendChild(link);
    host.appendChild(rig);
  }

  var vehicle = {
    id: "loader",
    parts: PARTS,
    board: BOARD,
    ghost: "img/ghost.webp",
    finale: "img/finale.webp",
    yard: "img/yard.webp",
    pile: "img/pile.webp",
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
