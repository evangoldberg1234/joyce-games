/* Kid switcher. One file, no dependencies. Mirlil can copy it as-is.
   Edit KIDS to add a child. path is matched before host, so Bernie
   on Joyce's site (/bernie/) wins over the joyce host. The first kid
   is the fallback. Optional override: set window.KID_SWITCH_KIDS first. */
(function () {
  var KIDS = window.KID_SWITCH_KIDS || [
    {
      id: "joyce",
      name: "Joyce",
      face: "👧",
      href: "https://joyce.goldberghq.com/",
      host: "joyce."
    },
    {
      id: "mimi",
      name: "Mimi",
      face: "🧒",
      href: "https://mimi.goldberghq.com/",
      host: "mimi."
    },
    {
      id: "bernie",
      name: "Bernie",
      face: "👦",
      href: "https://joyce.goldberghq.com/bernie/",
      path: "/bernie"
    }
  ];

  function hasSegment(path, token) {
    var want = String(token || "").toLowerCase().replace(/^\/+|\/+$/g, "");
    if (!want) return false;
    var parts = String(path || "").toLowerCase().split("/");
    var i;
    for (i = 0; i < parts.length; i++) {
      if (parts[i] === want) return true;
    }
    return false;
  }

  function currentKid(loc) {
    var host = String((loc && loc.hostname) || "").toLowerCase();
    var path = String((loc && loc.pathname) || "").toLowerCase();
    var i;
    for (i = 0; i < KIDS.length; i++) {
      if (KIDS[i].path && hasSegment(path, KIDS[i].path)) return KIDS[i];
    }
    for (i = 0; i < KIDS.length; i++) {
      if (KIDS[i].host && host.indexOf(String(KIDS[i].host).toLowerCase()) !== -1) return KIDS[i];
    }
    return KIDS[0];
  }

  function mount() {
    if (!document.body || document.getElementById("kid-switch")) return;
    var kid = currentKid(window.location);

    var style = document.createElement("style");
    style.textContent = [
      "#kid-switch{position:relative;z-index:12;flex:0 0 auto;align-self:flex-start;",
      "margin:2px 4px 0;max-width:calc(100% - 8px);",
      "font-family:\"Chalkboard SE\",\"Comic Sans MS\",\"Trebuchet MS\",sans-serif;line-height:1.2}",
      "#kid-switch .ks-btn{display:inline-flex;align-items:center;gap:6px;min-height:44px;",
      "max-width:100%;padding:4px 12px 4px 6px;border:3px solid #1d4e96;border-radius:999px;",
      "background:#fff;color:#16356b;font:inherit;font-size:16px;font-weight:800;",
      "box-shadow:0 3px 0 #1d4e96;touch-action:manipulation}",
      "#kid-switch .ks-face{display:grid;place-items:center;width:28px;height:28px;",
      "border-radius:50%;background:#ffe14a;font-size:18px;line-height:1}",
      "#kid-switch .ks-caret{font-size:14px}",
      "#kid-switch .ks-menu{position:absolute;top:calc(100% + 6px);left:0;z-index:1;",
      "display:flex;flex-direction:column;min-width:190px;max-width:calc(100vw - 24px);",
      "padding:6px;border:3px solid #1d4e96;border-radius:16px;background:#fff;",
      "box-shadow:0 8px 0 #1d4e96}",
      "#kid-switch .ks-menu[hidden]{display:none}",
      "#kid-switch .ks-link{display:flex;align-items:center;gap:8px;min-height:48px;",
      "padding:6px 10px;border-radius:12px;color:#16356b;background:transparent;",
      "text-decoration:none;font-size:18px;font-weight:800}",
      "#kid-switch .ks-link[aria-current=page]{background:#ffe14a}"
    ].join("");
    document.head.appendChild(style);

    var nav = document.createElement("nav");
    nav.id = "kid-switch";
    nav.setAttribute("aria-label", "Switch kid");

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "ks-btn";
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-haspopup", "true");
    btn.setAttribute("aria-controls", "kid-switch-menu");
    btn.setAttribute("aria-label", "Switch kid, " + kid.name);

    var face = document.createElement("span");
    face.className = "ks-face";
    face.setAttribute("aria-hidden", "true");
    face.textContent = kid.face;

    var name = document.createElement("span");
    name.className = "ks-name";
    name.textContent = kid.name;

    var caret = document.createElement("span");
    caret.className = "ks-caret";
    caret.setAttribute("aria-hidden", "true");
    caret.textContent = "▾";

    btn.appendChild(face);
    btn.appendChild(name);
    btn.appendChild(caret);

    var menu = document.createElement("div");
    menu.id = "kid-switch-menu";
    menu.className = "ks-menu";
    menu.hidden = true;

    KIDS.forEach(function (item) {
      var link = document.createElement("a");
      link.className = "ks-link";
      link.href = item.href;
      link.textContent = item.face + "  " + item.name;
      if (item.id === kid.id) link.setAttribute("aria-current", "page");
      menu.appendChild(link);
    });

    nav.appendChild(btn);
    nav.appendChild(menu);
    document.body.insertBefore(nav, document.body.firstChild);

    function setOpen(open) {
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      menu.hidden = !open;
    }

    btn.addEventListener("click", function () {
      setOpen(menu.hidden);
    });

    document.addEventListener("pointerdown", function (event) {
      if (!nav.contains(event.target)) setOpen(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setOpen(false);
    });
  }

  if (typeof document === "undefined") return;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
