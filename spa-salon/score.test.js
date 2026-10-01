/* Checks the style-point bands and that this game never asks the star server to pay them. */
var fs = require("fs");
var path = require("path");
var assert = require("assert");
var looks = require("./looks.js");

function chosenFrom(guest) {
  return {
    hair: guest.target.hair,
    makeup: guest.target.makeup,
    skin: guest.target.skin,
    nails: guest.target.nails
  };
}

looks.guests.forEach(function (guest) {
  ["hair", "makeup", "skin", "nails"].forEach(function (key) {
    assert.ok(looks.find(key, guest.target[key]), guest.name + " target " + key + " is missing");
  });
  var perfect = looks.scoreLook(guest.target, chosenFrom(guest));
  assert.strictEqual(perfect.points, 40, guest.name);
  assert.strictEqual(perfect.label, "Looks amazing");
  assert.strictEqual(perfect.won, true);
  assert.strictEqual(perfect.matches, 4);
});

var mia = looks.guests[0];
var three = chosenFrom(mia);
three.nails = "purple";
var okay = looks.scoreLook(mia.target, three);
assert.strictEqual(okay.points, 20);
assert.strictEqual(okay.label, "Looks okay");
assert.strictEqual(okay.won, true);
assert.strictEqual(okay.matches, 3);

var two = chosenFrom(mia);
two.nails = "purple";
two.skin = "cloud";
var mid = looks.scoreLook(mia.target, two);
assert.strictEqual(mid.points, 5);
assert.strictEqual(mid.label, "Looks kinda bad");
assert.strictEqual(mid.won, false);

var one = { hair: mia.target.hair, makeup: "berry", skin: "cloud", nails: "clear" };
var low = looks.scoreLook(mia.target, one);
assert.strictEqual(low.points, 0);
assert.strictEqual(low.label, "Looks horrible");
assert.strictEqual(low.won, false);

var none = looks.scoreLook(mia.target, {});
assert.strictEqual(none.points, 0);
assert.strictEqual(none.matches, 0);
assert.strictEqual(none.rows[0].gotName, "Not picked");

var game = fs.readFileSync(path.join(__dirname, "game.js"), "utf8");
assert.ok(!/KidsStars\s*\.\s*earn\b/.test(game), "style points must not call KidsStars.earn");
assert.ok(/style points/.test(game), "the page should name them style points");

var howtoStart = game.indexOf('makeButton("Let\'s play", "big-btn sun howto-go"');
var howtoSteps = game.indexOf('el("div", "howto-steps")');
assert.ok(howtoStart > 0, "How to Play needs a Let's play button");
assert.ok(howtoSteps > howtoStart, "the start button is above the scrolling steps");
assert.ok(game.indexOf("joyce-spa-howto") > 0, "first visit still uses joyce-spa-howto");
assert.ok(game.indexOf('howtoBtn.addEventListener') > 0, "the header How to play button stays");
assert.ok(game.indexOf("document.body.appendChild(overlay)") > 0, "How to Play sits above the header");

var css = fs.readFileSync(path.join(__dirname, "game.css"), "utf8");
assert.ok(/\.sheet\.howto-sheet\s*\{[\s\S]*?overflow:\s*hidden/.test(css), "the how-to card does not scroll the start button away");
assert.ok(/\.howto-steps\s*\{[\s\S]*?overflow:\s*auto/.test(css), "only the steps scroll");
assert.ok(/\.howto-foot/.test(css), "a pinned footer keeps Let's play in view");
assert.ok(/\.sheet \.howto-go\s*\{[\s\S]*?position:\s*static/.test(css), "the sky .sun rule must not pull Let's play out of the card");

console.log("Spa Salon score checks passed.");
