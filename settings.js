/* settings.js
   This is the one file to edit for your own child.
   Load it first on every page. The games read window.KIDS_SETTINGS
   and window.KIDS_CHAT. You do not need to edit the game folders.

   There are NO secrets in this file.
   No passcodes, no passwords, and no tokens.
   A family code, if you use one, is typed on the iPad and stays in the browser.
*/

(function () {
  /* A test can set this before the page loads. Families can ignore it. */
  var preset = window.KIDS_SETTINGS_PRESET || {};

  var settings = {
    /* The name on the home page. */
    childName: "Joyce",

    /* A short id for saved levels and the star server. Use lowercase letters. */
    childKey: "joyce",

    /* Used to pick a starting difficulty for Treasure Map. */
    age: 8,
    grade: 2,

    /* The name in the browser tab and on the home page. */
    siteTitle: "Joyce's Web",

    /* The chat buddy. The bubble uses this name. */
    botName: "Sofie",
    botEmoji: "🦊",

    /* blue, or a hex color such as #2b86f0. "blue" is this site's sky blue. */
    themeColor: "blue",

    /* Turn a subject off with false. It disappears from Treasure Map and Practice. */
    subjects: {
      math: true,
      verbal: true,
      english: true,
      hebrew: true,
      russian: true,
      parsha: true
    },

    /* Language codes this child uses.
       en = English, he = Hebrew, ru = Russian.
       To add another language, for example Spanish:
         1. Add its code to this list, like 'es'.
         2. Put questions in questions/spanish.js and set window.Q_SPANISH.
            If it should show up as its own subject, add that subject in
            questions/bank.js too.
         3. The speaker button uses the first two letters ('es') to pick a
            voice. An iPad voice named es-ES or es-MX matches 'es'.
       Hebrew questions stay hidden if 'he' is not in this list.
       Russian questions stay hidden if 'ru' is not in this list. */
    languages: ["en", "he", "ru"],

    /* Prices shown on the page.
       When the backend is on, the server enforces the real prices.
       These numbers are for the words on the screen, and for playing offline. */
    starPrices: {
      newGame: 20,
      animalPuzzleHint: 5,
      practice: 1
    },

    /* Homework photos. on: false hides the tile.
       perSheet and perDay are the caps shown to the child.
       The server still decides the real caps when it is connected. */
    homework: {
      on: true,
      perSheet: 10,
      perDay: 20
    },

    /* Book Club. on: false hides the tile. */
    bookClub: {
      on: true
    },

    /* Leave levelTestStart as null to use age and grade:
         grade 1, or age 7 and under, starts at level 3
         grade 2, or age 8, starts at level 5
         grade 3 or higher, or age 9 and up, starts at level 6
       Or set a number from 1 to 10 to choose the start yourself. */
    levelTestStart: null,

    /* Chat and stars.
       Leave functionsUrl as '' (empty) to run with no backend at all.
       Games, Brain Breaks, Treasure Map, and Practice still work.
       Chat, the star counter, Homework, and Book Club stay hidden.
       chat: false hides only the chat bubble.
       stars: false hides stars, and the Animal Puzzle hint is free. */
    backend: {
      functionsUrl: "https://btrvclzpgilavyzmlhnz.supabase.co/functions/v1",
      chat: true,
      stars: true
    }
  };

  if (preset.backend) {
    if (preset.backend.functionsUrl !== undefined) settings.backend.functionsUrl = preset.backend.functionsUrl;
    if (preset.backend.chat !== undefined) settings.backend.chat = preset.backend.chat;
    if (preset.backend.stars !== undefined) settings.backend.stars = preset.backend.stars;
  }
  if (preset.homework && preset.homework.on !== undefined) settings.homework.on = preset.homework.on;
  if (preset.bookClub && preset.bookClub.on !== undefined) settings.bookClub.on = preset.bookClub.on;

  function startingLevel(age, grade, override) {
    var picked = Number(override);
    if (picked >= 1 && picked <= 10) return Math.round(picked);
    grade = Number(grade);
    age = Number(age);
    if (grade >= 3 || age >= 9) return 6;
    if ((grade && grade <= 1) || age <= 7) return 3;
    return 5;
  }

  settings.levelTest = {
    startLevel: startingLevel(settings.age, settings.grade, settings.levelTestStart)
  };

  var url = String(settings.backend.functionsUrl || "").trim();
  var chatOn = url !== "" && settings.backend.chat !== false;
  var starsOn = url !== "" && settings.backend.stars !== false;
  var homeworkOn = settings.homework.on !== false && starsOn;
  var bookClubOn = settings.bookClub.on !== false && chatOn;

  settings.features = {
    chat: chatOn,
    stars: starsOn,
    homework: homeworkOn,
    bookClub: bookClubOn
  };

  window.KIDS_SETTINGS = settings;

  /* Shared files, including chat.js, keep reading this object. */
  window.KIDS_CHAT = {
    kid: settings.childKey,
    kidName: settings.childName,
    botName: settings.botName,
    botEmoji: settings.botEmoji,
    functionsUrl: url,
    chat: settings.backend.chat !== false,
    stars: settings.backend.stars !== false,
    gameCost: settings.starPrices.newGame
  };

  var THEME = { blue: "#2b86f0" };

  function themeHex(value) {
    var raw = String(value || "blue").trim();
    var named = THEME[raw.toLowerCase()];
    return named || raw;
  }

  function applyPage() {
    if (!document.documentElement) return;
    var hex = themeHex(settings.themeColor);
    var theme = document.querySelector('meta[name="theme-color"]');
    if (theme) theme.setAttribute("content", hex);
    document.documentElement.style.setProperty("--sky-deep", hex);
    var apple = document.querySelector('meta[name="apple-mobile-web-app-title"]');
    if (apple) apple.setAttribute("content", settings.siteTitle);

    var page = document.body && document.body.getAttribute("data-page");
    if (page) document.title = page + " · " + settings.siteTitle;
    else if (document.body && document.body.classList.contains("home")) document.title = settings.siteTitle;

    function fill(selector, value) {
      var nodes = document.querySelectorAll(selector);
      var i;
      for (i = 0; i < nodes.length; i++) nodes[i].textContent = value;
    }
    fill("[data-child-name]", settings.childName);
    fill("[data-site-title]", settings.siteTitle);
    fill("[data-bot-name]", settings.botName);
    fill("[data-site-link]", "\u2190 " + settings.siteTitle);

    var prices = settings.starPrices || {};
    var caps = settings.homework || {};
    var priceNodes = document.querySelectorAll("[data-price]");
    var p;
    for (p = 0; p < priceNodes.length; p++) {
      var key = priceNodes[p].getAttribute("data-price");
      if (prices[key] != null) priceNodes[p].textContent = String(prices[key]);
      if (key === "sheet" && caps.perSheet != null) priceNodes[p].textContent = String(caps.perSheet);
      if (key === "day" && caps.perDay != null) priceNodes[p].textContent = String(caps.perDay);
    }

    var feats = settings.features;
    var needNodes = document.querySelectorAll("[data-needs]");
    var n;
    for (n = 0; n < needNodes.length; n++) {
      var parts = String(needNodes[n].getAttribute("data-needs") || "").split(/\s+/);
      var hide = false;
      var k;
      for (k = 0; k < parts.length; k++) {
        if (parts[k] && !feats[parts[k]]) hide = true;
      }
      if (hide) {
        needNodes[n].hidden = true;
        needNodes[n].style.display = "none";
      }
    }
  }

  if (document.body) applyPage();
  else document.addEventListener("DOMContentLoaded", applyPage);
})();
