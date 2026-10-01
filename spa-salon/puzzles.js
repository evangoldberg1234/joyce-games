/* Huge Spa customers, looks, and style score.
   Spa sparkles are an in-game score only. They are not site stars. */
(function (root) {
  var STEPS = [
    "hairStyle", "hairColor", "accessory", "makeup",
    "eyes", "cheeks", "lips", "skincare", "nails", "nailArt"
  ];

  var STEP_LABELS = {
    hairStyle: "Hair style",
    hairColor: "Hair color",
    accessory: "Hair clip",
    makeup: "Makeup",
    eyes: "Eye shadow",
    cheeks: "Cheeks",
    lips: "Lips",
    skincare: "Skincare",
    nails: "Nail polish",
    nailArt: "Nail art"
  };

  var STEP_SHORT = {
    hairStyle: "Style",
    hairColor: "Color",
    accessory: "Clip",
    makeup: "Makeup",
    eyes: "Eyes",
    cheeks: "Cheeks",
    lips: "Lips",
    skincare: "Skin",
    nails: "Polish",
    nailArt: "Art"
  };

  var LIKES = {
    gold: { name: "gold", color: "#f6c945" },
    peach: { name: "peach", color: "#ffb07a" },
    pink: { name: "pink", color: "#ff8fb8" },
    sunny: { name: "sunny", color: "#ffe14a" },
    rose: { name: "rose", color: "#e85a8c" },
    berry: { name: "berry", color: "#c13b6b" },
    party: { name: "party", color: "#ff7ad9" },
    lavender: { name: "lavender", color: "#c9b6ff" },
    plum: { name: "plum", color: "#7a4e9a" },
    silver: { name: "silver", color: "#d5d5ea" },
    moon: { name: "moon", color: "#b9b6f0" },
    mint: { name: "mint", color: "#7ddec0" },
    leaf: { name: "leaf", color: "#3aaa78" },
    butter: { name: "butter", color: "#ffe08a" },
    garden: { name: "garden", color: "#8ed67a" },
    coral: { name: "coral", color: "#ff7a6e" },
    aqua: { name: "aqua", color: "#5ed0e0" },
    sand: { name: "sand", color: "#f0d2a8" },
    beach: { name: "beach", color: "#7ec8e3" },
    violet: { name: "violet", color: "#8b6cff" },
    blush: { name: "blush", color: "#ffb3c7" },
    star: { name: "star", color: "#ffe98a" },
    fresh: { name: "fresh", color: "#c8f5e4" },
    soft: { name: "soft", color: "#f7e6ee" },
    blue: { name: "blue", color: "#7eb6ff" },
    fancy: { name: "fancy", color: "#e4c6ff" }
  };

  var HAIR_STYLES = [
    { id: "pigtails", name: "Pigtails", tags: ["sunny"] },
    { id: "ponytail", name: "Ponytail", tags: ["sunny", "fresh"] },
    { id: "bob", name: "Bob", tags: ["soft"] },
    { id: "bun", name: "Top bun", tags: ["party"] },
    { id: "curls", name: "Curls", tags: ["party", "fancy"] },
    { id: "braids", name: "Braids", tags: ["garden"] },
    { id: "waves", name: "Beach waves", tags: ["beach"] },
    { id: "pixie", name: "Pixie", tags: ["fresh"] },
    { id: "spacebuns", name: "Space buns", tags: ["star", "moon", "party"] },
    { id: "crown", name: "Crown braid", tags: ["fancy", "party", "star"] }
  ];

  var HAIR_COLORS = [
    { id: "honey", name: "Honey gold", color: "#f6c945", tags: ["gold", "sunny"] },
    { id: "peach-soda", name: "Peach soda", color: "#ffb07a", tags: ["peach"] },
    { id: "inky", name: "Inky blue", color: "#3a4a88", tags: ["blue"] },
    { id: "bubblegum", name: "Bubblegum", color: "#ff8fb8", tags: ["pink", "party"] },
    { id: "rose-red", name: "Rose red", color: "#e85a8c", tags: ["rose", "pink"] },
    { id: "berry", name: "Berry", color: "#a83266", tags: ["berry"] },
    { id: "cloud", name: "Cloud", color: "#f4f1f6", tags: ["soft"] },
    { id: "lavender", name: "Lavender", color: "#c9b6ff", tags: ["lavender", "moon"] },
    { id: "plum", name: "Plum", color: "#7a4e9a", tags: ["plum"] },
    { id: "silver", name: "Silver", color: "#e4e4f2", tags: ["silver", "moon"] },
    { id: "midnight", name: "Midnight", color: "#2e2a55", tags: ["moon"] },
    { id: "mint", name: "Mint", color: "#7ddec0", tags: ["mint", "garden"] },
    { id: "leaf", name: "Leaf", color: "#3aaa78", tags: ["leaf", "garden"] },
    { id: "butter", name: "Butter", color: "#ffe08a", tags: ["butter", "sunny"] },
    { id: "aqua", name: "Aqua", color: "#5ed0e0", tags: ["aqua", "beach"] },
    { id: "coral", name: "Coral", color: "#ff7a6e", tags: ["coral", "beach"] },
    { id: "sand", name: "Sandy", color: "#e8c99a", tags: ["sand", "beach"] },
    { id: "violet", name: "Violet", color: "#8b6cff", tags: ["violet", "star"] },
    { id: "blush", name: "Blush", color: "#ffb3c7", tags: ["blush", "pink"] },
    { id: "starlight", name: "Starlight", color: "#ffe98a", tags: ["star", "gold"] }
  ];

  var MAKEUP = [
    { id: "sunny-glow", name: "Sunny glow", tags: ["gold", "peach", "sunny"], eyes: "#f6c945", cheeks: "#ffb07a", lips: "#ff8a6a" },
    { id: "rosy", name: "Rosy pink", tags: ["pink", "rose"], eyes: "#ffb7d5", cheeks: "#ff8fb8", lips: "#e85a8c" },
    { id: "cloud-face", name: "Soft cloud", tags: ["soft"], eyes: "#ffffff", cheeks: "#f6d5e2", lips: "#f0c2c8" }
  ];

  var EYES = [
    { id: "gold-eyes", name: "Gold dust", color: "#f6c945", tags: ["gold", "sunny"] },
    { id: "peach-eyes", name: "Peach", color: "#ffb07a", tags: ["peach"] },
    { id: "moon-eyes", name: "Moonlight", color: "#c9b6ff", tags: ["lavender", "moon"] },
    { id: "plum-eyes", name: "Plum", color: "#7a4e9a", tags: ["plum"] },
    { id: "silver-eyes", name: "Silver", color: "#d9d9ea", tags: ["silver", "moon"] },
    { id: "leaf-eyes", name: "Leaf", color: "#7dcea0", tags: ["leaf", "garden"] },
    { id: "mint-eyes", name: "Mint", color: "#b8f3df", tags: ["mint"] },
    { id: "butter-eyes", name: "Butter", color: "#ffe08a", tags: ["butter", "sunny"] },
    { id: "aqua-eyes", name: "Aqua", color: "#8ee4ef", tags: ["aqua", "beach"] },
    { id: "coral-eyes", name: "Coral", color: "#ff9a90", tags: ["coral"] },
    { id: "sand-eyes", name: "Sand", color: "#f0d2a8", tags: ["sand", "beach"] },
    { id: "violet-eyes", name: "Violet", color: "#b39cff", tags: ["violet", "star"] },
    { id: "blush-eyes", name: "Blush", color: "#ffc2d4", tags: ["blush", "pink"] },
    { id: "star-eyes", name: "Star shine", color: "#ffe98a", tags: ["star", "gold"] }
  ];

  var CHEEKS = [
    { id: "rose-cheeks", name: "Rose", color: "#ff8fb8", tags: ["rose", "pink"] },
    { id: "berry-cheeks", name: "Berry", color: "#e06a92", tags: ["berry"] },
    { id: "gold-cheeks", name: "Gold", color: "#f6c945", tags: ["gold", "sunny"] },
    { id: "coral-cheeks", name: "Coral", color: "#ff8d82", tags: ["coral", "beach"] },
    { id: "sand-cheeks", name: "Sand", color: "#f0c48a", tags: ["sand"] },
    { id: "aqua-cheeks", name: "Aqua", color: "#9ae4ea", tags: ["aqua"] },
    { id: "plum-cheeks", name: "Plum", color: "#c48ad4", tags: ["plum"] },
    { id: "blush-cheeks", name: "Blush", color: "#ffb3c7", tags: ["blush", "pink"] },
    { id: "violet-cheeks", name: "Violet", color: "#c7b6ff", tags: ["violet"] }
  ];

  var LIPS = [
    { id: "rose-lips", name: "Rose", color: "#e85a8c", tags: ["rose", "party"] },
    { id: "berry-lips", name: "Berry", color: "#a83266", tags: ["berry"] },
    { id: "nude", name: "Soft nude", color: "#e7b8ae", tags: ["soft"] },
    { id: "plum-lips", name: "Plum", color: "#8a5088", tags: ["plum", "moon"] },
    { id: "lavender-lips", name: "Lavender", color: "#c9b0e0", tags: ["lavender"] },
    { id: "leaf-lips", name: "Leaf tint", color: "#8dcea8", tags: ["leaf", "garden"] },
    { id: "mint-lips", name: "Mint tint", color: "#b6ead8", tags: ["mint"] },
    { id: "butter-lips", name: "Butter", color: "#f3d48a", tags: ["butter"] },
    { id: "coral-lips", name: "Coral", color: "#ff7a6e", tags: ["coral", "beach"] },
    { id: "aqua-lips", name: "Aqua tint", color: "#8fd8e4", tags: ["aqua"] },
    { id: "sand-lips", name: "Sand", color: "#e8c4a0", tags: ["sand"] },
    { id: "blush-lips", name: "Blush", color: "#ff9eb8", tags: ["blush", "pink"] },
    { id: "gold-lips", name: "Gold", color: "#e8c15a", tags: ["gold", "star"] },
    { id: "violet-lips", name: "Violet", color: "#8b6cff", tags: ["violet"] }
  ];

  var SKINCARE = [
    { id: "dew", name: "Dew drops", tags: ["fresh"], finish: "dew" },
    { id: "peach-mask", name: "Peach mask", tags: ["peach", "sunny"], finish: "mask", mask: "rgba(255, 176, 122, 0.5)" },
    { id: "gold-shimmer", name: "Gold shimmer", tags: ["gold", "sunny"], finish: "glitter", mask: "rgba(255, 214, 90, 0.28)" },
    { id: "rose-mist", name: "Rose mist", tags: ["rose", "pink"], finish: "mask", mask: "rgba(255, 143, 184, 0.42)" },
    { id: "berry-glow", name: "Berry glow", tags: ["berry"], finish: "glitter", mask: "rgba(193, 59, 107, 0.22)" },
    { id: "moon-milk", name: "Moon milk", tags: ["lavender", "moon"], finish: "dew", mask: "rgba(201, 182, 255, 0.35)" },
    { id: "silver-dew", name: "Silver dew", tags: ["silver", "moon"], finish: "glitter", mask: "rgba(220, 220, 240, 0.4)" },
    { id: "plum-glow", name: "Plum glow", tags: ["plum"], finish: "mask", mask: "rgba(122, 78, 154, 0.28)" },
    { id: "cucumber", name: "Cucumber cool", tags: ["mint", "garden"], finish: "cool", mask: "rgba(125, 222, 192, 0.4)" },
    { id: "leaf-splash", name: "Leaf splash", tags: ["leaf", "garden"], finish: "cool", mask: "rgba(61, 170, 120, 0.28)" },
    { id: "butter-cream", name: "Butter cream", tags: ["butter", "sunny"], finish: "dew", mask: "rgba(255, 224, 138, 0.4)" },
    { id: "ocean-mist", name: "Ocean mist", tags: ["aqua", "beach"], finish: "dew", mask: "rgba(94, 208, 224, 0.35)" },
    { id: "coral-jelly", name: "Coral jelly", tags: ["coral", "beach"], finish: "mask", mask: "rgba(255, 122, 110, 0.4)" },
    { id: "sand-scrub", name: "Sand sugar", tags: ["sand"], finish: "glitter", mask: "rgba(240, 210, 168, 0.45)" },
    { id: "star-dust", name: "Star dust", tags: ["star", "gold"], finish: "glitter", mask: "rgba(255, 233, 138, 0.35)" },
    { id: "violet-veil", name: "Violet veil", tags: ["violet"], finish: "mask", mask: "rgba(139, 108, 255, 0.32)" }
  ];

  var NAILS = [
    { id: "peach-polish", name: "Peach", color: "#ffb07a", tags: ["peach"] },
    { id: "gold-polish", name: "Gold", color: "#f6c945", tags: ["gold", "sunny"] },
    { id: "blue-polish", name: "Sky", color: "#7eb6ff", tags: ["blue"] },
    { id: "bubble-polish", name: "Bubblegum", color: "#ff8fb8", tags: ["pink", "party"] },
    { id: "rose-polish", name: "Rose", color: "#e85a8c", tags: ["rose"] },
    { id: "berry-polish", name: "Berry", color: "#a83266", tags: ["berry"] },
    { id: "lavender-polish", name: "Lavender", color: "#c9b6ff", tags: ["lavender", "moon"] },
    { id: "plum-polish", name: "Plum", color: "#7a4e9a", tags: ["plum"] },
    { id: "silver-polish", name: "Silver", color: "#e4e4f2", tags: ["silver"] },
    { id: "midnight-polish", name: "Midnight", color: "#2e2a55", tags: ["moon"] },
    { id: "mint-polish", name: "Mint", color: "#7ddec0", tags: ["mint", "garden"] },
    { id: "leaf-polish", name: "Leaf", color: "#3aaa78", tags: ["leaf"] },
    { id: "butter-polish", name: "Butter", color: "#ffe08a", tags: ["butter"] },
    { id: "inky-polish", name: "Inky", color: "#3a4a88", tags: ["blue"] },
    { id: "aqua-polish", name: "Aqua", color: "#5ed0e0", tags: ["aqua", "beach"] },
    { id: "coral-polish", name: "Coral", color: "#ff7a6e", tags: ["coral"] },
    { id: "sand-polish", name: "Sand", color: "#e8c99a", tags: ["sand", "beach"] },
    { id: "star-polish", name: "Starlight", color: "#ffe98a", tags: ["star", "gold"] },
    { id: "violet-polish", name: "Violet", color: "#8b6cff", tags: ["violet"] },
    { id: "blush-polish", name: "Blush", color: "#ffb3c7", tags: ["blush", "pink"] }
  ];

  var NAIL_ART = [
    { id: "dots", name: "Polka dots", art: "dots", tags: ["party", "sunny"] },
    { id: "hearts", name: "Tiny hearts", art: "hearts", tags: ["pink", "party", "blush"] },
    { id: "stars", name: "Star tips", art: "stars", tags: ["star"] },
    { id: "stripes", name: "Candy stripes", art: "stripes", tags: ["party", "beach"] },
    { id: "waves", name: "Wave tips", art: "waves", tags: ["beach", "aqua"] },
    { id: "moons", name: "Moon tips", art: "moons", tags: ["moon"] },
    { id: "plain", name: "Plain shine", art: "plain", tags: ["fresh"] }
  ];

  var ACCESSORIES = [
    { id: "daisy-clip", name: "Daisy clip", mark: "🌼", tags: ["sunny", "garden"] },
    { id: "pink-bow", name: "Pink bow", mark: "🎀", tags: ["pink", "party"] },
    { id: "rose-pin", name: "Rose pin", mark: "🌹", tags: ["rose"] },
    { id: "moon-clip", name: "Moon clip", mark: "🌙", tags: ["moon", "silver"] },
    { id: "mint-bow", name: "Mint bow", mark: "💚", tags: ["mint", "garden"] },
    { id: "shell", name: "Shell clip", mark: "🐚", tags: ["beach", "aqua"] },
    { id: "star-clip", name: "Star clip", mark: "⭐", tags: ["star", "gold"] },
    { id: "pearl", name: "Pearl pin", mark: "⚪", tags: ["silver", "fancy"] },
    { id: "flower", name: "Flower clip", mark: "🌸", tags: ["garden", "leaf"] }
  ];

  var CATALOG = {
    hairStyle: HAIR_STYLES,
    hairColor: HAIR_COLORS,
    accessory: ACCESSORIES,
    makeup: MAKEUP,
    eyes: EYES,
    cheeks: CHEEKS,
    lips: LIPS,
    skincare: SKINCARE,
    nails: NAILS,
    nailArt: NAIL_ART
  };

  var CUSTOMERS = [
    {
      id: "daisy",
      level: 1,
      name: "Daisy",
      emoji: "🌼",
      wish: "Sunny picnic",
      blurb: "Daisy wants a sunny picnic look.",
      skin: "#f6c7a8",
      cape: "#ffe08a",
      likes: ["gold", "peach", "pink", "sunny"],
      steps: ["hairStyle", "hairColor", "makeup", "skincare", "nails"],
      choices: {
        hairStyle: ["pigtails", "ponytail", "bob"],
        hairColor: ["honey", "peach-soda", "inky"],
        makeup: ["sunny-glow", "rosy", "cloud-face"],
        skincare: ["peach-mask", "gold-shimmer", "dew"],
        nails: ["peach-polish", "gold-polish", "blue-polish"]
      }
    },
    {
      id: "rosie",
      level: 2,
      name: "Rosie",
      emoji: "🌹",
      wish: "Birthday pink",
      blurb: "Rosie wants a birthday pink look.",
      skin: "#f3b89a",
      cape: "#ffb7d5",
      likes: ["pink", "rose", "berry", "party"],
      steps: ["hairStyle", "hairColor", "cheeks", "lips", "skincare", "nails"],
      choices: {
        hairStyle: ["curls", "bun", "pigtails", "bob"],
        hairColor: ["bubblegum", "rose-red", "berry", "cloud"],
        cheeks: ["rose-cheeks", "berry-cheeks", "gold-cheeks"],
        lips: ["rose-lips", "berry-lips", "nude"],
        skincare: ["rose-mist", "berry-glow", "dew", "gold-shimmer"],
        nails: ["bubble-polish", "rose-polish", "berry-polish", "blue-polish"]
      }
    },
    {
      id: "luna",
      level: 3,
      name: "Luna",
      emoji: "🌙",
      wish: "Moonlight party",
      blurb: "Luna wants a moonlight party look.",
      skin: "#e7c4a8",
      cape: "#d9ccff",
      likes: ["lavender", "plum", "silver", "moon"],
      steps: ["hairStyle", "hairColor", "eyes", "lips", "skincare", "nails"],
      choices: {
        hairStyle: ["spacebuns", "bun", "braids", "pixie", "bob"],
        hairColor: ["lavender", "plum", "silver", "midnight", "honey"],
        eyes: ["moon-eyes", "plum-eyes", "silver-eyes", "gold-eyes", "peach-eyes"],
        lips: ["plum-lips", "lavender-lips", "berry-lips", "nude"],
        skincare: ["moon-milk", "silver-dew", "plum-glow", "dew"],
        nails: ["lavender-polish", "plum-polish", "silver-polish", "midnight-polish", "gold-polish"]
      }
    },
    {
      id: "clover",
      level: 4,
      name: "Clover",
      emoji: "🍀",
      wish: "Garden picnic",
      blurb: "Clover wants a garden picnic look.",
      skin: "#d9a57a",
      cape: "#c8f0c0",
      likes: ["mint", "leaf", "butter", "garden"],
      steps: ["hairStyle", "hairColor", "accessory", "eyes", "lips", "skincare", "nails"],
      choices: {
        hairStyle: ["braids", "waves", "ponytail", "crown", "pixie"],
        hairColor: ["mint", "leaf", "butter", "honey", "inky"],
        accessory: ["flower", "mint-bow", "daisy-clip", "star-clip", "pink-bow"],
        eyes: ["leaf-eyes", "mint-eyes", "butter-eyes", "gold-eyes", "plum-eyes"],
        lips: ["leaf-lips", "mint-lips", "butter-lips", "rose-lips"],
        skincare: ["cucumber", "leaf-splash", "butter-cream", "dew", "rose-mist"],
        nails: ["mint-polish", "leaf-polish", "butter-polish", "peach-polish", "inky-polish"]
      }
    },
    {
      id: "coral",
      level: 5,
      name: "Coral",
      emoji: "🐚",
      wish: "Beach day",
      blurb: "Coral wants a beach day glow.",
      skin: "#c68642",
      cape: "#ffd0b8",
      likes: ["coral", "aqua", "sand", "beach"],
      steps: ["hairStyle", "hairColor", "accessory", "eyes", "cheeks", "lips", "skincare", "nails", "nailArt"],
      choices: {
        hairStyle: ["waves", "ponytail", "braids", "curls", "pixie", "bun"],
        hairColor: ["aqua", "coral", "sand", "honey", "plum", "midnight"],
        accessory: ["shell", "pearl", "flower", "star-clip", "pink-bow"],
        eyes: ["aqua-eyes", "coral-eyes", "sand-eyes", "moon-eyes", "plum-eyes"],
        cheeks: ["coral-cheeks", "sand-cheeks", "aqua-cheeks", "rose-cheeks", "plum-cheeks"],
        lips: ["coral-lips", "aqua-lips", "sand-lips", "rose-lips", "plum-lips"],
        skincare: ["ocean-mist", "coral-jelly", "sand-scrub", "dew", "moon-milk"],
        nails: ["coral-polish", "aqua-polish", "sand-polish", "gold-polish", "plum-polish", "midnight-polish"],
        nailArt: ["waves", "stripes", "dots", "stars", "plain", "moons"]
      }
    },
    {
      id: "starla",
      level: 6,
      name: "Starla",
      emoji: "⭐",
      wish: "Sparkle show",
      blurb: "Starla wants a sparkle show look.",
      skin: "#8d5524",
      cape: "#e6d4ff",
      likes: ["gold", "violet", "blush", "star"],
      steps: ["hairStyle", "hairColor", "accessory", "eyes", "cheeks", "lips", "skincare", "nails", "nailArt"],
      choices: {
        hairStyle: ["spacebuns", "crown", "curls", "waves", "bob", "pixie"],
        hairColor: ["starlight", "violet", "blush", "honey", "midnight", "inky"],
        accessory: ["star-clip", "pearl", "pink-bow", "moon-clip", "shell", "flower"],
        eyes: ["gold-eyes", "violet-eyes", "blush-eyes", "star-eyes", "moon-eyes", "aqua-eyes"],
        cheeks: ["blush-cheeks", "gold-cheeks", "violet-cheeks", "rose-cheeks", "sand-cheeks"],
        lips: ["blush-lips", "gold-lips", "violet-lips", "nude", "coral-lips", "plum-lips"],
        skincare: ["star-dust", "gold-shimmer", "violet-veil", "dew", "cucumber", "sand-scrub"],
        nails: ["star-polish", "violet-polish", "blush-polish", "gold-polish", "aqua-polish", "midnight-polish"],
        nailArt: ["stars", "hearts", "dots", "moons", "plain", "waves"]
      }
    }
  ];

  function option(step, id) {
    var list = CATALOG[step] || [];
    var i;
    if (!id) return null;
    for (i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  function choices(customer, step) {
    var ids = (customer.choices && customer.choices[step]) || [];
    var out = [];
    ids.forEach(function (id) {
      var row = option(step, id);
      if (row) out.push(row);
    });
    return out;
  }

  function loves(opt, customer) {
    var i;
    if (!opt || !opt.tags || !customer || !customer.likes) return false;
    for (i = 0; i < opt.tags.length; i++) {
      if (customer.likes.indexOf(opt.tags[i]) !== -1) return true;
    }
    return false;
  }

  function likeInfo(id) {
    return LIKES[id] || { name: id, color: "#ffffff" };
  }

  function freshLook() {
    return {
      hairStyle: "",
      hairColor: "",
      accessory: "",
      makeup: "",
      eyes: "",
      cheeks: "",
      lips: "",
      skincare: "",
      nails: "",
      nailArt: "",
      mannequin: { hairStyle: "", hairColor: "", accessory: "" },
      given: null
    };
  }

  function labelFor(points) {
    if (points === 40) return "Looks amazing";
    if (points === 20) return "Looks okay";
    if (points === 5) return "Looks kinda bad";
    return "Looks horrible";
  }

  function joinAnd(list) {
    if (!list.length) return "";
    if (list.length === 1) return list[0];
    if (list.length === 2) return list[0] + " and " + list[1];
    return list.slice(0, -1).join(", ") + ", and " + list[list.length - 1];
  }

  function mannequinOk(look, customer) {
    var given = look && look.given;
    if (!given) return false;
    if (!given.hairStyle || !given.hairColor) return false;
    if (given.hairStyle !== look.hairStyle || given.hairColor !== look.hairColor) return false;
    if (customer.steps.indexOf("accessory") !== -1) {
      if (!given.accessory || given.accessory !== look.accessory) return false;
    }
    return true;
  }

  function score(look, customer) {
    var empty = [];
    var matches = 0;
    var checked = 0;
    var ratio;
    var points;
    var tips = [];
    var phrase;

    look = look || freshLook();
    customer.steps.forEach(function (step) {
      var id = look[step];
      var opt;
      if (!id) {
        empty.push(step);
        return;
      }
      checked += 1;
      opt = option(step, id);
      if (loves(opt, customer)) matches += 1;
    });

    ratio = checked ? matches / checked : 0;

    if (empty.length >= 2 || checked === 0) points = 0;
    else if (empty.length === 1) points = 5;
    else if (ratio >= 0.75 && mannequinOk(look, customer)) points = 40;
    else if (ratio >= 0.5) points = 20;
    else if (ratio > 0) points = 5;
    else points = 0;

    phrase = joinAnd(customer.likes.map(function (id) { return likeInfo(id).name; }));

    if (empty.length >= 2) {
      tips.push("Some steps are still empty: " + empty.map(function (step) {
        return STEP_LABELS[step] || step;
      }).join(", ") + ".");
    } else if (empty.length === 1) {
      tips.push((STEP_LABELS[empty[0]] || empty[0]) + " is still empty.");
    } else if (points === 40) {
      tips.push(customer.name + " loves this look.");
    } else {
      if (ratio < 0.75) {
        tips.push("Use more colors " + customer.name + " loves: " + phrase + ".");
      }
      if (!mannequinOk(look, customer)) {
        tips.push("Try the hair on the mannequin, then give that hair to " + customer.name + ".");
      }
    }

    return {
      points: points,
      label: labelFor(points),
      empty: empty,
      matches: matches,
      checked: checked,
      mannequinOk: mannequinOk(look, customer),
      tips: tips
    };
  }

  function paint(look, customer, mannequin) {
    var source;
    var styleOpt;
    var colorOpt;
    var acc;
    var eyes = "#ffffff";
    var cheeks = "transparent";
    var lips = "#e7b2b8";
    var finish = "";
    var mask = "transparent";
    var nails = "#f8e0e4";
    var nailArt = "";
    var makeup;
    var eye;
    var cheek;
    var lip;
    var skin;
    var nail;
    var art;

    look = look || freshLook();
    source = mannequin ? (look.mannequin || {}) : look;
    styleOpt = option("hairStyle", source.hairStyle);
    colorOpt = option("hairColor", source.hairColor);
    acc = option("accessory", source.accessory);

    if (!mannequin) {
      makeup = option("makeup", look.makeup);
      if (makeup) {
        eyes = makeup.eyes || eyes;
        cheeks = makeup.cheeks || cheeks;
        lips = makeup.lips || lips;
      }
      eye = option("eyes", look.eyes);
      if (eye && eye.color) eyes = eye.color;
      cheek = option("cheeks", look.cheeks);
      if (cheek && cheek.color) cheeks = cheek.color;
      lip = option("lips", look.lips);
      if (lip && lip.color) lips = lip.color;
      skin = option("skincare", look.skincare);
      if (skin) {
        finish = skin.finish || "";
        if (skin.mask) mask = skin.mask;
      }
      nail = option("nails", look.nails);
      if (nail && nail.color) nails = nail.color;
      art = option("nailArt", look.nailArt);
      if (art && art.art) nailArt = art.art;
    }

    return {
      style: styleOpt ? styleOpt.id : "bald",
      hair: colorOpt ? colorOpt.color : "#f3d2c4",
      skin: mannequin ? "#f4e4d6" : customer.skin,
      cape: customer.cape,
      eyes: eyes,
      cheeks: cheeks,
      lips: lips,
      finish: finish,
      mask: mask,
      nails: nails,
      nailArt: nailArt,
      clip: acc ? acc.mark : "",
      showClip: !!acc
    };
  }

  function won(result) {
    return !!(result && result.points >= 20);
  }

  var api = {
    customers: CUSTOMERS,
    STEPS: STEPS,
    STEP_LABELS: STEP_LABELS,
    STEP_SHORT: STEP_SHORT,
    option: option,
    choices: choices,
    loves: loves,
    likeInfo: likeInfo,
    freshLook: freshLook,
    labelFor: labelFor,
    score: score,
    paint: paint,
    won: won
  };

  root.SPA_DATA = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
