/* Build a Loader from photo pieces.
   A future car is another folder: its own parts (src, x, y), board, and draw(). */
(function () {
  var BOARD = { w: 1000, h: 618 };
  var PARTS = [
    { id: "counterweight", name: "Counterweight", src: "img/counterweight.webp", x: 762, y: 172, w: 232, h: 380, group: "body" },
    { id: "rear-wheel", name: "Rear wheel", src: "img/rear-wheel.webp", x: 693, y: 337, w: 214, h: 215, inset: "img/inset-rear-wheel.webp", group: "body" },
    { id: "engine", name: "Engine", src: "img/engine.webp", x: 658, y: 39, w: 199, h: 413, inset: "img/inset-engine.webp", group: "body", with: ["counterweight", "engine", "frame"] },
    { id: "cab", name: "Cab", src: "img/cab.webp", x: 451, y: 5, w: 269, h: 149, inset: "img/inset-cab.webp", group: "body" },
    { id: "frame", name: "Front frame", src: "img/frame.webp", x: 218, y: 120, w: 582, h: 492, group: "body" },
    { id: "front-wheel", name: "Front wheel", src: "img/front-wheel.webp", x: 178, y: 370, w: 245, h: 243, inset: "img/inset-front-wheel.webp", group: "body" },
    { id: "arms", name: "Lift arms", src: "img/arms.webp", x: 104, y: 59, w: 418, h: 263, inset: "img/inset-arms.webp", group: "arms" },
    { id: "bucket", name: "Bucket", src: "img/bucket.webp", x: 5, y: 214, w: 296, h: 399, inset: "img/inset-bucket.webp", group: "bucket" }
  ];
  /* Front-frame pin. The bucket sits to the left of it, so a positive turn lifts it. */
  var LINK = {
    pivot: { x: 500, y: 239 },
    carry: 20,
    dump: 28
  };

  function layer(className, origin) {
    var node = document.createElement("div");
    node.className = className;
    if (origin) {
      node.style.transformOrigin = (origin.x / BOARD.w * 100) + "% " + (origin.y / BOARD.h * 100) + "%";
    }
    return node;
  }

  function plate(src) {
    var img = document.createElement("img");
    img.className = "plate";
    img.alt = "";
    img.src = src;
    return img;
  }

  /* Drive pose: one still body, and the arms+bucket rotating on the pin. */
  function draw(host, state) {
    host.innerHTML = "";
    var pose = state.pose || "rest";
    var rig = document.createElement("div");
    rig.className = "photo-rig";
    var link = layer("linkage", LINK.pivot);
    var angle = pose === "carry" ? LINK.carry : (pose === "dump" ? LINK.dump : 0);
    if (angle) link.style.transform = "rotate(" + angle + "deg)";
    link.appendChild(plate("img/linkage.webp"));
    if (state.carrying) {
      var dirt = document.createElement("div");
      dirt.className = "scoop-dirt";
      link.appendChild(dirt);
    }
    rig.appendChild(plate("img/body.webp"));
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
      start: { x: 0.5, y: 0.86 },
      pile: { x: 0.3, y: 0.86 },
      dump: { x: 0.5, y: 0.86 },
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

  play();
})();
