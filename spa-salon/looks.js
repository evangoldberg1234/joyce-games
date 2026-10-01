/* Spa Salon looks.
   Style points are scored here. They are not star-ledger stars. */
(function (root) {
  var HAIR = [
    { id: "bun", name: "Princess bun", emoji: "👑", color: "#e2b043", swatch: "#e2b043" },
    { id: "spikes", name: "Sport spikes", emoji: "⚡", color: "#2b2118", swatch: "#2b2118" },
    { id: "waves", name: "Ocean waves", emoji: "🌊", color: "#1d4e5f", swatch: "#1d4e5f" },
    { id: "curls", name: "Birthday curls", emoji: "🎉", color: "#c45c26", swatch: "#c45c26" },
    { id: "braids", name: "Twin braids", emoji: "🎀", color: "#6b3a1f", swatch: "#6b3a1f" },
    { id: "bob", name: "Sweet bob", emoji: "🌷", color: "#e58aaa", swatch: "#e58aaa" }
  ];

  var MAKEUP = [
    { id: "pink-sparkle", name: "Pink sparkle", emoji: "💖", blush: "#ff8fb8", lip: "#e45b8a", swatch: "#ff8fb8" },
    { id: "fresh", name: "Fresh clean face", emoji: "😊", blush: "transparent", lip: "#e7a090", swatch: "#f6d2c4" },
    { id: "mermaid", name: "Mermaid shimmer", emoji: "🧜", blush: "#7ed9c5", lip: "#1f8f86", swatch: "#3dcfb0" },
    { id: "star", name: "Star face paint", emoji: "⭐", blush: "#ffd36b", lip: "#f08a3c", swatch: "#ffd36b" },
    { id: "berry", name: "Berry lips", emoji: "🍒", blush: "#d45d8c", lip: "#8e1d4a", swatch: "#8e1d4a" },
    { id: "sunshine", name: "Sunshine glow", emoji: "🌞", blush: "#ffd56a", lip: "#f0a050", swatch: "#ffd56a" }
  ];

  var SKIN = [
    { id: "rose-mask", name: "Rose face mask", emoji: "🌹", mask: "rgba(255, 142, 176, 0.55)", swatch: "#ff8eb0" },
    { id: "splash", name: "Cool water splash", emoji: "💧", mask: "rgba(120, 196, 255, 0.4)", swatch: "#7ec4ff" },
    { id: "cucumber", name: "Cucumber cool", emoji: "🥒", mask: "rgba(168, 214, 120, 0.42)", swatch: "#8ed46a" },
    { id: "honey", name: "Honey glow", emoji: "🍯", mask: "rgba(255, 196, 80, 0.48)", swatch: "#ffc450" },
    { id: "cloud", name: "Cloud cream", emoji: "☁️", mask: "rgba(255, 255, 255, 0.72)", swatch: "#fff" }
  ];

  var NAILS = [
    { id: "pink", name: "Pink", emoji: "💅", color: "#ff6fa5", swatch: "#ff6fa5" },
    { id: "blue", name: "Blue", emoji: "💙", color: "#3d8bff", swatch: "#3d8bff" },
    { id: "mint", name: "Mint", emoji: "💚", color: "#3dcfb0", swatch: "#3dcfb0" },
    { id: "gold", name: "Gold", emoji: "✨", color: "#f0c14a", swatch: "#f0c14a" },
    { id: "purple", name: "Purple", emoji: "💜", color: "#b06bff", swatch: "#b06bff" },
    { id: "clear", name: "Clear", emoji: "🫧", color: "#f3d2c8", swatch: "#f7e4dc" }
  ];

  var GUESTS = [
    {
      id: "mia",
      level: 1,
      name: "Mia",
      wish: "Princess party",
      line: "I want a princess party look!",
      skin: "#f6c7a8",
      hairColor: "#c48a3a",
      outfit: "#ff8ec8",
      target: { hair: "bun", makeup: "pink-sparkle", skin: "rose-mask", nails: "pink" }
    },
    {
      id: "leo",
      level: 2,
      name: "Leo",
      wish: "Game day",
      line: "Soccer today! Keep me fresh and sporty.",
      skin: "#c68642",
      hairColor: "#2b2118",
      outfit: "#3d8bff",
      target: { hair: "spikes", makeup: "fresh", skin: "splash", nails: "blue" }
    },
    {
      id: "noa",
      level: 3,
      name: "Noa",
      wish: "Mermaid splash",
      line: "Make me look like a mermaid.",
      skin: "#e0ac7a",
      hairColor: "#1d3d45",
      outfit: "#5ed0c8",
      target: { hair: "waves", makeup: "mermaid", skin: "cucumber", nails: "mint" }
    },
    {
      id: "ava",
      level: 4,
      name: "Ava",
      wish: "Birthday sparkle",
      line: "It's my birthday. I want sparkles!",
      skin: "#f3d2b5",
      hairColor: "#a34520",
      outfit: "#ffb703",
      target: { hair: "curls", makeup: "star", skin: "honey", nails: "gold" }
    }
  ];

  var CATS = [
    { id: "hair", label: "Hair", emoji: "💇" },
    { id: "makeup", label: "Makeup", emoji: "💄" },
    { id: "skin", label: "Skincare", emoji: "🧴" },
    { id: "nails", label: "Nails", emoji: "💅" }
  ];

  var LISTS = { hair: HAIR, makeup: MAKEUP, skin: SKIN, nails: NAILS };

  function find(group, id) {
    var list = LISTS[group] || [];
    var i;
    for (i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  function scoreLook(target, chosen) {
    var keys = ["hair", "makeup", "skin", "nails"];
    var matches = 0;
    var rows = [];
    var i;
    chosen = chosen || {};
    target = target || {};
    for (i = 0; i < keys.length; i++) {
      var key = keys[i];
      var hit = !!(chosen[key] && chosen[key] === target[key]);
      if (hit) matches += 1;
      var wanted = find(key, target[key]);
      var got = find(key, chosen[key]);
      rows.push({
        key: key,
        hit: hit,
        wantedId: target[key] || "",
        gotId: chosen[key] || "",
        wantedName: wanted ? wanted.name : "Something from the list",
        gotName: got ? got.name : "Not picked"
      });
    }
    var band;
    if (matches >= 4) band = { points: 40, label: "Looks amazing", won: true };
    else if (matches === 3) band = { points: 20, label: "Looks okay", won: true };
    else if (matches === 2) band = { points: 5, label: "Looks kinda bad", won: false };
    else band = { points: 0, label: "Looks horrible", won: false };
    return { points: band.points, label: band.label, won: band.won, matches: matches, rows: rows };
  }

  var api = {
    hair: HAIR,
    makeup: MAKEUP,
    skin: SKIN,
    nails: NAILS,
    guests: GUESTS,
    cats: CATS,
    find: find,
    scoreLook: scoreLook
  };

  if (typeof module === "object" && module.exports) module.exports = api;
  root.SPA_LOOKS = api;
})(typeof window !== "undefined" ? window : global);
