/* Each piece, drawn at its target, rebuilds the ghost.
   The build itself is six parts: a miss still awards the right tap,
   a second tap does not, and the order ends at the drive. */
var assert = require("assert");
var fs = require("fs");
var path = require("path");
var spawn = require("child_process").spawnSync;
var questions = require("../shared/questions.js");
var guess = require("../shared/guess.js");

var ORDER = ["rear-wheel", "front-wheel", "engine", "cab", "arms", "bucket"];
assert.deepStrictEqual(questions.order.map(function (part) { return part.id; }), ORDER);

var earned = [];
var state = guess.createState();
ORDER.forEach(function (id, index) {
  if (index === 0 || index === 3) {
    var miss = guess.answer(state, false);
    assert.strictEqual(miss.earned, false);
    assert.strictEqual(miss.say, "Try again");
  }
  var got = guess.answer(state, true);
  assert.strictEqual(got.earned, true, id + " still awards after a miss");
  var extra = guess.answer(state, true);
  assert.strictEqual(extra.ignore, true, id + " is not awarded twice");
  assert.strictEqual(extra.earned, false);
  earned.push(id);
  guess.nextQuestion(state);
});
assert.deepStrictEqual(earned, ORDER);
assert.strictEqual(earned.length, 6);

var img = path.join(__dirname, "img");
ORDER.forEach(function (id) {
  assert.ok(fs.existsSync(path.join(img, "tile-" + id + ".webp")), "tile " + id);
  assert.ok(fs.existsSync(path.join(img, id + ".webp")), id);
});
assert.ok(fs.existsSync(path.join(img, "outline.webp")), "outline");

var root = path.join(__dirname, "..", "..");
var script = [
  "import json, os, re",
  "import numpy as np",
  "from PIL import Image",
  "root = " + JSON.stringify(root),
  "js = open(os.path.join(root, 'bernie/loader/loader.js'), encoding='utf-8').read()",
  "parts = []",
  "for block in re.finditer(r'\\{[^}]*id:\\s*\"([^\"]+)\"[^}]*src:\\s*\"img/[^\"]+\"[^}]*\\}', js):",
  "    body = block.group(0)",
  "    def num(key, body=body):",
  "        m = re.search(key + r':\\s*(-?\\d+)', body)",
  "        return int(m.group(1))",
  "    parts.append((block.group(1), num('x'), num('y'), num('w'), num('h')))",
  "assert parts, 'no parts'",
  "img = os.path.join(root, 'bernie/loader/img')",
  "ghost = np.array(Image.open(os.path.join(img, 'ghost.webp')).convert('RGBA')).astype(np.float32)",
  "h, w = ghost.shape[:2]",
  "recon = np.zeros_like(ghost)",
  "for name, x, y, pw, ph in parts:",
  "    piece = np.array(Image.open(os.path.join(img, name + '.webp')).convert('RGBA')).astype(np.float32)",
  "    assert piece.shape[1] == pw and piece.shape[0] == ph, name",
  "    assert 0 <= x and x + pw <= w and 0 <= y and y + ph <= h, name",
  "    src_a = np.zeros((h, w), np.float32)",
  "    src_rgb = np.zeros((h, w, 3), np.float32)",
  "    src_a[y:y+ph, x:x+pw] = piece[:,:,3] / 255.0",
  "    src_rgb[y:y+ph, x:x+pw] = piece[:,:,:3]",
  "    dst_a = recon[:,:,3] / 255.0",
  "    out_a = src_a + dst_a * (1 - src_a)",
  "    for c in range(3):",
  "        recon[:,:,c] = np.where(out_a > 1e-4, (src_rgb[:,:,c] * src_a + recon[:,:,c] * dst_a * (1 - src_a)) / np.maximum(out_a, 1e-4), 0)",
  "    recon[:,:,3] = out_a * 255.0",
  "mask = (ghost[:,:,3] > 40) | (recon[:,:,3] > 40)",
  "rgb = np.abs(recon[:,:,:3] - ghost[:,:,:3]).mean(axis=2)",
  "alpha = np.abs(recon[:,:,3] - ghost[:,:,3])",
  "rgb_mae = float(rgb[mask].mean())",
  "alpha_mae = float(alpha[mask].mean())",
  "print('assembly rgb mae %.3f alpha mae %.3f parts %d' % (rgb_mae, alpha_mae, len(parts)))",
  "limit = 2.0",
  "if rgb_mae > limit or alpha_mae > limit:",
  "    raise SystemExit('assembly diff rgb %.3f alpha %.3f over %.1f' % (rgb_mae, alpha_mae, limit))",
  "ids = [p[0] for p in parts]",
  "if ids != ['rear-wheel', 'front-wheel', 'engine', 'cab', 'arms', 'bucket']:",
  "    raise SystemExit('parts are not the six exclusive crops: %s' % ids)",
  "def centroid(name, x, y, pw, ph):",
  "    piece = np.array(Image.open(os.path.join(img, name + '.webp')).convert('RGBA'))",
  "    ys, xs = np.where(piece[:,:,3] > 20)",
  "    return x + float(xs.mean()), y + float(ys.mean())",
  "bucket = [p for p in parts if p[0] == 'bucket'][0]",
  "engine = [p for p in parts if p[0] == 'engine'][0]",
  "bx, by = centroid(*bucket)",
  "ex, ey = centroid(*engine)",
  "print('bucket x %.0f engine x %.0f' % (bx, ex))",
  "if not bx < w * 0.40:",
  "    raise SystemExit('bucket is not on the front')",
  "if not ex > w * 0.55:",
  "    raise SystemExit('engine is not on the rear')",
].join("\n");

var result = spawn("python3", ["-c", script], { encoding: "utf8" });
if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
assert.strictEqual(result.status, 0, "assembly diff failed");
