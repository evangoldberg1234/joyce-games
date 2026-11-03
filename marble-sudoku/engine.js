/* Marble Sudoku rules and puzzle generator.
   Numbers stay inside this file. The page draws a colored ball for each one.
   4×4 uses 2×2 boxes, 6×6 uses 2×3 boxes, 9×9 uses 3×3 boxes.
   A generated puzzle is checked to have exactly one completion. */
(function (root) {
  var SPECS = {
    4: { n: 4, br: 2, bc: 2, givens: 8 },
    6: { n: 6, br: 2, bc: 3, givens: 16 },
    9: { n: 9, br: 3, bc: 3, givens: 36 }
  };

  function spec(size) {
    var found = SPECS[size];
    if (!found) return null;
    return { n: found.n, br: found.br, bc: found.bc, givens: found.givens };
  }

  function boxIndex(info, r, c) {
    return (Math.floor(r / info.br) * (info.n / info.bc)) + Math.floor(c / info.bc);
  }

  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffle(list, rng) {
    var i;
    for (i = list.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var swap = list[i];
      list[i] = list[j];
      list[j] = swap;
    }
    return list;
  }

  function range(n) {
    var list = [];
    var i;
    for (i = 0; i < n; i++) list.push(i);
    return list;
  }

  function popcount(x) {
    var n = 0;
    var v = x;
    while (v) {
      v &= v - 1;
      n++;
    }
    return n;
  }

  function bitValue(bit) {
    var v = 1;
    var b = bit;
    while (b > 1) {
      b >>= 1;
      v++;
    }
    return v;
  }

  /* A valid filled grid, then bands, rows, stacks, columns, and colors are shuffled. */
  function buildSolution(info, rng) {
    var n = info.n;
    var base = [];
    var r;
    var c;
    for (r = 0; r < n; r++) {
      for (c = 0; c < n; c++) {
        base[r * n + c] = (r * info.bc + Math.floor(r / info.br) + c) % n;
      }
    }
    var symbols = shuffle(range(n), rng);
    var bandCount = n / info.br;
    var bandOrder = shuffle(range(bandCount), rng);
    var rows = [];
    var b;
    for (b = 0; b < bandCount; b++) {
      var inner = shuffle(range(info.br), rng);
      var k;
      for (k = 0; k < info.br; k++) rows.push(bandOrder[b] * info.br + inner[k]);
    }
    var stackCount = n / info.bc;
    var stackOrder = shuffle(range(stackCount), rng);
    var cols = [];
    var s;
    for (s = 0; s < stackCount; s++) {
      var innerC = shuffle(range(info.bc), rng);
      var k2;
      for (k2 = 0; k2 < info.bc; k2++) cols.push(stackOrder[s] * info.bc + innerC[k2]);
    }
    var out = [];
    for (r = 0; r < n; r++) {
      for (c = 0; c < n; c++) {
        out[r * n + c] = symbols[base[rows[r] * n + cols[c]]] + 1;
      }
    }
    return out;
  }

  function countSolutions(grid, size, limit) {
    var info = spec(size);
    if (!info || !grid || grid.length !== info.n * info.n) {
      return { count: 0, solution: null };
    }
    var n = info.n;
    var total = n * n;
    var work = [];
    var rows = [];
    var cols = [];
    var boxes = [];
    var i;
    for (i = 0; i < n; i++) {
      rows[i] = 0;
      cols[i] = 0;
      boxes[i] = 0;
    }
    var fullMask = (1 << n) - 1;
    for (i = 0; i < total; i++) {
      var v = grid[i] | 0;
      work[i] = v;
      if (!v) continue;
      if (v < 1 || v > n) return { count: 0, solution: null };
      var bit = 1 << (v - 1);
      var r0 = (i / n) | 0;
      var c0 = i % n;
      var b0 = boxIndex(info, r0, c0);
      if ((rows[r0] & bit) || (cols[c0] & bit) || (boxes[b0] & bit)) {
        return { count: 0, solution: null };
      }
      rows[r0] |= bit;
      cols[c0] |= bit;
      boxes[b0] |= bit;
    }

    var cap = limit == null ? 2 : limit;
    var count = 0;
    var solution = null;

    function search() {
      if (count >= cap) return;
      var best = -1;
      var bestAvail = 0;
      var bestCount = n + 1;
      var cell;
      for (cell = 0; cell < total; cell++) {
        if (work[cell]) continue;
        var r = (cell / n) | 0;
        var c = cell % n;
        var b = boxIndex(info, r, c);
        var avail = fullMask & ~(rows[r] | cols[c] | boxes[b]);
        if (!avail) return;
        var bits = popcount(avail);
        if (bits < bestCount) {
          best = cell;
          bestAvail = avail;
          bestCount = bits;
          if (bits === 1) break;
        }
      }
      if (best < 0) {
        count++;
        if (count === 1) solution = work.slice();
        return;
      }
      var hand = bestAvail;
      var r1 = (best / n) | 0;
      var c1 = best % n;
      var b1 = boxIndex(info, r1, c1);
      while (hand) {
        var bit = hand & -hand;
        hand ^= bit;
        work[best] = bitValue(bit);
        rows[r1] |= bit;
        cols[c1] |= bit;
        boxes[b1] |= bit;
        search();
        work[best] = 0;
        rows[r1] ^= bit;
        cols[c1] ^= bit;
        boxes[b1] ^= bit;
        if (count >= cap) return;
      }
    }

    search();
    return { count: count, solution: solution };
  }

  function generate(size, seed, options) {
    var info = spec(size);
    if (!info) throw new Error("Marble Sudoku has no " + size + " board");
    options = options || {};
    var usedSeed = seed == null ? ((Date.now() ^ ((Math.random() * 0x100000000) >>> 0)) >>> 0) : (seed >>> 0);
    var rng = mulberry32(usedSeed || 1);
    var solution = buildSolution(info, rng);
    var puzzle = solution.slice();
    var order = shuffle(range(info.n * info.n), rng);
    var target = options.givens == null ? info.givens : options.givens;
    var budget = options.budget == null ? 700 : options.budget;
    var started = Date.now();
    var kept = puzzle.length;
    var i;
    for (i = 0; i < order.length && kept > target; i++) {
      if (budget && Date.now() - started > budget) break;
      var idx = order[i];
      var saved = puzzle[idx];
      puzzle[idx] = 0;
      if (countSolutions(puzzle, info.n, 2).count !== 1) puzzle[idx] = saved;
      else kept--;
    }
    return {
      size: info.n,
      boxRows: info.br,
      boxCols: info.bc,
      givens: puzzle,
      solution: solution,
      seed: usedSeed || 1
    };
  }

  function conflicts(grid, size) {
    var info = spec(size);
    var bad = {};
    if (!info || !grid) return bad;
    var n = info.n;

    function mark(indexes) {
      var groups = {};
      var i;
      for (i = 0; i < indexes.length; i++) {
        var index = indexes[i];
        var value = grid[index] | 0;
        if (!value) continue;
        if (!groups[value]) groups[value] = [];
        groups[value].push(index);
      }
      var key;
      for (key in groups) {
        if (!Object.prototype.hasOwnProperty.call(groups, key)) continue;
        if (groups[key].length > 1) {
          var g;
          for (g = 0; g < groups[key].length; g++) bad[groups[key][g]] = true;
        }
      }
    }

    var r;
    var c;
    for (r = 0; r < n; r++) {
      var row = [];
      for (c = 0; c < n; c++) row.push(r * n + c);
      mark(row);
    }
    for (c = 0; c < n; c++) {
      var col = [];
      for (r = 0; r < n; r++) col.push(r * n + c);
      mark(col);
    }
    var br;
    var bc;
    for (br = 0; br < n; br += info.br) {
      for (bc = 0; bc < n; bc += info.bc) {
        var box = [];
        for (r = br; r < br + info.br; r++) {
          for (c = bc; c < bc + info.bc; c++) box.push(r * n + c);
        }
        mark(box);
      }
    }
    return bad;
  }

  function isValid(grid, size) {
    var info = spec(size);
    if (!info || !grid || grid.length !== info.n * info.n) return false;
    var i;
    for (i = 0; i < grid.length; i++) {
      if ((grid[i] | 0) < 1 || (grid[i] | 0) > info.n) return false;
    }
    return Object.keys(conflicts(grid, size)).length === 0;
  }

  function assess(grid, size) {
    var info = spec(size);
    var bad = conflicts(grid, size);
    var full = true;
    var i;
    if (!info || !grid || grid.length !== info.n * info.n) full = false;
    else {
      for (i = 0; i < grid.length; i++) {
        if (!(grid[i] | 0)) full = false;
      }
    }
    var badCount = Object.keys(bad).length;
    return {
      bad: bad,
      full: full,
      solved: full && badCount === 0
    };
  }

  var api = {
    spec: spec,
    generate: generate,
    countSolutions: countSolutions,
    conflicts: conflicts,
    isValid: isValid,
    assess: assess,
    boxIndex: boxIndex
  };

  root.MarbleEngine = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
