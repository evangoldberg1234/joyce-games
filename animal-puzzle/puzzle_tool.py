#!/usr/bin/env python3
"""Generate and verify Joyce's animal puzzles.

Each puzzle is a Sudoku on a mixed set of letters and numbers (every symbol
once in each row, column, and bold box) plus crossword clues: on a clued row
or column, the letters in order spell the animal. The number tiles sit in
the leftover cells.

Run:
  python3 puzzle_tool.py generate   # rewrite puzzles.js
  python3 puzzle_tool.py verify     # prove every puzzle has one solution
"""

from __future__ import annotations

import json
import random
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE / "puzzles.js"


def box_index(size, box_rows, box_cols, r, c):
    return (r // box_rows) * (size // box_cols) + (c // box_cols)


def letter_order_ok(values, word, letter_set):
    """True when this line can still spell the animal in order.

    Numbers are skipped. Empty cells may become a letter or a number.
    A finished line must be exactly the animal with numbers in the gaps.
    """
    target = list(word)

    def can(pos, word_index):
        if pos == len(values):
            return word_index == len(target)
        cell = values[pos]
        if cell in (None, ""):
            if can(pos + 1, word_index):
                return True
            return word_index < len(target) and can(pos + 1, word_index + 1)
        if cell in letter_set:
            if word_index < len(target) and cell == target[word_index]:
                return can(pos + 1, word_index + 1)
            return False
        return can(pos + 1, word_index)

    return can(0, 0)


def solve(size, box_rows, box_cols, symbols, word, clues, grid, limit=2):
    """Count solutions. grid cells are symbols or None. Stops at `limit`."""
    letter_set = {ch for ch in word}
    clue_rows = {clue["index"] for clue in clues if clue["dir"] == "row"}
    clue_cols = {clue["index"] for clue in clues if clue["dir"] == "col"}
    row_used = [set() for _ in range(size)]
    col_used = [set() for _ in range(size)]
    box_used = [set() for _ in range(size)]
    empties = []
    for r in range(size):
        for c in range(size):
            value = grid[r][c]
            if value is None:
                empties.append((r, c))
            else:
                row_used[r].add(value)
                col_used[c].add(value)
                box_used[box_index(size, box_rows, box_cols, r, c)].add(value)

    solutions = []

    def line_ok_after(r, c):
        if r in clue_rows:
            if not letter_order_ok(grid[r], word, letter_set):
                return False
        if c in clue_cols:
            column = [grid[i][c] for i in range(size)]
            if not letter_order_ok(column, word, letter_set):
                return False
        return True

    def search():
        if len(solutions) >= limit:
            return
        best_i = None
        best_opts = None
        for i, (r, c) in enumerate(empties):
            if grid[r][c] is not None:
                continue
            b = box_index(size, box_rows, box_cols, r, c)
            opts = []
            for symbol in symbols:
                if symbol in row_used[r] or symbol in col_used[c] or symbol in box_used[b]:
                    continue
                grid[r][c] = symbol
                if line_ok_after(r, c):
                    opts.append(symbol)
                grid[r][c] = None
            if not opts:
                return
            if best_opts is None or len(opts) < len(best_opts):
                best_i = i
                best_opts = opts
                if len(opts) == 1:
                    break
        if best_opts is None:
            solutions.append([[cell for cell in row] for row in grid])
            return
        r, c = empties[best_i]
        b = box_index(size, box_rows, box_cols, r, c)
        for symbol in best_opts:
            grid[r][c] = symbol
            row_used[r].add(symbol)
            col_used[c].add(symbol)
            box_used[b].add(symbol)
            search()
            row_used[r].remove(symbol)
            col_used[c].remove(symbol)
            box_used[b].remove(symbol)
            grid[r][c] = None
            if len(solutions) >= limit:
                return

    search()
    return solutions


def empty_grid(size):
    return [[None for _ in range(size)] for _ in range(size)]


def fill_solution(size, box_rows, box_cols, symbols, word, clues, rng):
    """Find one completed grid that obeys Sudoku and the crossword clues."""
    letter_set = {ch for ch in word}
    clue_rows = {clue["index"] for clue in clues if clue["dir"] == "row"}
    clue_cols = {clue["index"] for clue in clues if clue["dir"] == "col"}
    grid = empty_grid(size)
    row_used = [set() for _ in range(size)]
    col_used = [set() for _ in range(size)]
    box_used = [set() for _ in range(size)]

    def line_ok(r, c):
        if r in clue_rows and not letter_order_ok(grid[r], word, letter_set):
            return False
        if c in clue_cols:
            column = [grid[i][c] for i in range(size)]
            if not letter_order_ok(column, word, letter_set):
                return False
        return True

    def bt():
        best = None
        best_opts = None
        for r in range(size):
            for c in range(size):
                if grid[r][c] is not None:
                    continue
                b = box_index(size, box_rows, box_cols, r, c)
                opts = [
                    s
                    for s in symbols
                    if s not in row_used[r] and s not in col_used[c] and s not in box_used[b]
                ]
                if not opts:
                    return False
                if best_opts is None or len(opts) < len(best_opts):
                    best = (r, c, b)
                    best_opts = opts
                    if len(opts) == 1:
                        break
            if best_opts is not None and len(best_opts) == 1:
                break
        if best is None:
            return True
        r, c, b = best
        opts = best_opts[:]
        rng.shuffle(opts)
        for symbol in opts:
            grid[r][c] = symbol
            row_used[r].add(symbol)
            col_used[c].add(symbol)
            box_used[b].add(symbol)
            if line_ok(r, c) and bt():
                return True
            row_used[r].remove(symbol)
            col_used[c].remove(symbol)
            box_used[b].remove(symbol)
            grid[r][c] = None
        return False

    if not bt():
        return None
    return grid


def spells(values, word):
    letters = [v for v in values if v in word]
    return letters == list(word)


def discover_clues(grid, word):
    size = len(grid)
    found = []
    for r in range(size):
        if spells(grid[r], word):
            found.append({"dir": "row", "index": r})
    for c in range(size):
        column = [grid[r][c] for r in range(size)]
        if spells(column, word):
            found.append({"dir": "col", "index": c})
    return found


def clue_key(clue):
    return (clue["dir"], clue["index"])


def dig_puzzle(solution, symbols, word, clues, box_rows, box_cols, rng, max_empties, min_empties):
    """Remove cells while the crossword Sudoku stays uniquely solvable."""
    size = len(solution)
    grid = [row[:] for row in solution]
    cells = [(r, c) for r in range(size) for c in range(size)]
    rng.shuffle(cells)

    # Prefer to open cells on clue lines first so the animal word is part of the solve.
    clue_rows = {clue["index"] for clue in clues if clue["dir"] == "row"}
    clue_cols = {clue["index"] for clue in clues if clue["dir"] == "col"}

    def on_clue(r, c):
        return r in clue_rows or c in clue_cols

    cells.sort(key=lambda rc: (0 if on_clue(*rc) else 1, rng.random()))

    empties = 0
    removed = []
    for r, c in cells:
        if empties >= max_empties:
            break
        saved = grid[r][c]
        grid[r][c] = None
        found = solve(size, box_rows, box_cols, symbols, word, clues, grid, limit=2)
        if len(found) == 1 and naked_single_solvable(
            size, box_rows, box_cols, symbols, word, clues, grid
        ):
            empties += 1
            removed.append((r, c, saved))
        else:
            grid[r][c] = saved

    # If we could not open enough cells, this pattern is too locked.
    if empties < min_empties:
        return None

    # Keep at least one letter and one number for the player to enter.
    letters = set(word)
    open_letters = 0
    open_numbers = 0
    for r in range(size):
        for c in range(size):
            if grid[r][c] is None:
                value = solution[r][c]
                if value in letters:
                    open_letters += 1
                else:
                    open_numbers += 1
    if open_letters < 1 or open_numbers < 1:
        return None

    # Each clue line should still have something to figure out.
    for clue in clues:
        if clue["dir"] == "row":
            vals = grid[clue["index"]]
        else:
            vals = [grid[r][clue["index"]] for r in range(size)]
        if all(v is not None for v in vals):
            return None

    return grid


def anchor_empty_clues(solution, given, clues):
    """On a fully blank clue line, give back the first letter so the word has a start."""
    size = len(solution)
    for clue in clues:
        if clue["dir"] == "row":
            cells = [(clue["index"], c) for c in range(size)]
        else:
            cells = [(r, clue["index"]) for r in range(size)]
        if any(given[r][c] is not None for r, c in cells):
            continue
        for r, c in cells:
            if solution[r][c].isalpha():
                given[r][c] = solution[r][c]
                break
    return given


def naked_single_solvable(size, box_rows, box_cols, symbols, word, clues, grid):
    """True when an 8-year-old can finish using one-cell-at-a-time logic."""
    letter_set = set(word)
    clue_rows = {clue["index"] for clue in clues if clue["dir"] == "row"}
    clue_cols = {clue["index"] for clue in clues if clue["dir"] == "col"}
    work = [row[:] for row in grid]

    def options(r, c):
        used = set()
        for i in range(size):
            if work[r][i] is not None:
                used.add(work[r][i])
            if work[i][c] is not None:
                used.add(work[i][c])
        br = (r // box_rows) * box_rows
        bc = (c // box_cols) * box_cols
        for rr in range(br, br + box_rows):
            for cc in range(bc, bc + box_cols):
                if work[rr][cc] is not None:
                    used.add(work[rr][cc])
        found = []
        for symbol in symbols:
            if symbol in used:
                continue
            work[r][c] = symbol
            ok = True
            if r in clue_rows and not letter_order_ok(work[r], word, letter_set):
                ok = False
            if ok and c in clue_cols:
                column = [work[i][c] for i in range(size)]
                if not letter_order_ok(column, word, letter_set):
                    ok = False
            work[r][c] = None
            if ok:
                found.append(symbol)
        return found

    while True:
        progress = False
        for r in range(size):
            for c in range(size):
                if work[r][c] is not None:
                    continue
                opts = options(r, c)
                if len(opts) == 1:
                    work[r][c] = opts[0]
                    progress = True
        if not progress:
            break
    return all(cell is not None for row in work for cell in row)


def clues_are_needed(solution, symbols, word, clues, box_rows, box_cols, given_grid):
    """True when the givens alone (no animal clues) are not a unique Sudoku."""
    size = len(solution)
    found = solve(size, box_rows, box_cols, symbols, word, [], given_grid, limit=2)
    return len(found) != 1


def make_level(spec, rng):
    size = spec["size"]
    box_rows = spec["boxRows"]
    box_cols = spec["boxCols"]
    word = spec["word"]
    number_symbols = spec["numbers"]
    symbols = list(word) + list(number_symbols)
    if len(symbols) != size or len(set(symbols)) != size:
        raise ValueError(f"Symbol count must match grid size for {spec['id']}")

    for _attempt in range(spec.get("attempts", 400)):
        forced = [{"dir": d, "index": i} for d, i in spec["forceClues"]]
        solution = fill_solution(size, box_rows, box_cols, symbols, word, forced, rng)
        if solution is None:
            continue
        extra = discover_clues(solution, word)
        # Always keep the forced clues. Add extra spelling lines up to maxClues.
        chosen = []
        seen = set()
        for clue in forced + extra:
            key = clue_key(clue)
            if key in seen:
                continue
            seen.add(key)
            chosen.append({"dir": clue["dir"], "index": clue["index"]})
            if len(chosen) >= spec["maxClues"]:
                break
        if len(chosen) < spec["minClues"]:
            continue
        # Want at least one across and one down when the grid has both.
        dirs = {c["dir"] for c in chosen}
        if "row" not in dirs or "col" not in dirs:
            continue
        given = dig_puzzle(
            solution,
            symbols,
            word,
            chosen,
            box_rows,
            box_cols,
            rng,
            max_empties=spec["maxEmpties"],
            min_empties=spec["minEmpties"],
        )
        if given is None:
            continue
        if spec.get("anchorClues"):
            given = anchor_empty_clues(solution, given, chosen)
        need = clues_are_needed(solution, symbols, word, chosen, box_rows, box_cols, given)
        if spec.get("cluesMustMatter") and not need:
            continue
        puzzle = {
            "id": spec["id"],
            "title": spec["title"],
            "difficulty": spec["difficulty"],
            "emoji": spec["emoji"],
            "word": word,
            "symbols": symbols,
            "size": size,
            "boxRows": box_rows,
            "boxCols": box_cols,
            "clues": chosen,
            "solution": [cell for row in solution for cell in row],
            "givens": ["" if cell is None else cell for row in given for cell in row],
        }
        return puzzle
    raise RuntimeError(f"Could not build puzzle {spec['id']}")


LEVELS = [
    {
        "id": "cat",
        "title": "Cat",
        "difficulty": "Easy",
        "emoji": "🐱",
        "word": "CAT",
        "numbers": ["1"],
        "size": 4,
        "boxRows": 2,
        "boxCols": 2,
        "forceClues": [("row", 0), ("col", 1)],
        "minClues": 2,
        "maxClues": 3,
        "minEmpties": 5,
        "maxEmpties": 6,
        "cluesMustMatter": False,
        "anchorClues": True,
        "attempts": 300,
    },
    {
        "id": "dog",
        "title": "Dog",
        "difficulty": "Easy",
        "emoji": "🐶",
        "word": "DOG",
        "numbers": ["2"],
        "size": 4,
        "boxRows": 2,
        "boxCols": 2,
        "forceClues": [("row", 2), ("col", 0)],
        "minClues": 2,
        "maxClues": 3,
        "minEmpties": 6,
        "maxEmpties": 7,
        "cluesMustMatter": False,
        "anchorClues": True,
        "attempts": 300,
    },
    {
        "id": "fox",
        "title": "Fox",
        "difficulty": "Medium",
        "emoji": "🦊",
        "word": "FOX",
        "numbers": ["3"],
        "size": 4,
        "boxRows": 2,
        "boxCols": 2,
        "forceClues": [("row", 1), ("col", 2)],
        "minClues": 2,
        "maxClues": 3,
        "minEmpties": 8,
        "maxEmpties": 9,
        "cluesMustMatter": True,
        "attempts": 500,
    },
    {
        "id": "owl",
        "title": "Owl",
        "difficulty": "Medium",
        "emoji": "🦉",
        "word": "OWL",
        "numbers": ["4"],
        "size": 4,
        "boxRows": 2,
        "boxCols": 2,
        "forceClues": [("row", 3), ("col", 0)],
        "minClues": 2,
        "maxClues": 3,
        "minEmpties": 6,
        "maxEmpties": 9,
        "cluesMustMatter": True,
        "attempts": 500,
    },
    {
        "id": "bear",
        "title": "Bear",
        "difficulty": "Harder",
        "emoji": "🐻",
        "word": "BEAR",
        "numbers": ["1", "2"],
        "size": 6,
        "boxRows": 2,
        "boxCols": 3,
        "forceClues": [("row", 0), ("col", 2)],
        "minClues": 2,
        "maxClues": 3,
        "minEmpties": 10,
        "maxEmpties": 16,
        "cluesMustMatter": True,
        "attempts": 400,
    },
    {
        "id": "frog",
        "title": "Frog",
        "difficulty": "Harder",
        "emoji": "🐸",
        "word": "FROG",
        "numbers": ["3", "4"],
        "size": 6,
        "boxRows": 2,
        "boxCols": 3,
        "forceClues": [("row", 4), ("col", 1), ("row", 1)],
        "minClues": 2,
        "maxClues": 3,
        "minEmpties": 16,
        "maxEmpties": 20,
        "cluesMustMatter": True,
        "attempts": 500,
    },
]


def puzzle_to_grids(puzzle):
    size = puzzle["size"]
    symbols = puzzle["symbols"]
    solution = [puzzle["solution"][i : i + size] for i in range(0, size * size, size)]
    givens = []
    for r in range(size):
        row = []
        for c in range(size):
            value = puzzle["givens"][r * size + c]
            row.append(value if value else None)
        givens.append(row)
    return solution, givens


def check_latin(grid, symbols, box_rows, box_cols):
    size = len(grid)
    symbol_set = set(symbols)
    for r in range(size):
        if set(grid[r]) != symbol_set:
            return False
    for c in range(size):
        if {grid[r][c] for r in range(size)} != symbol_set:
            return False
    boxes = size // box_cols
    for br in range(0, size, box_rows):
        for bc in range(0, size, box_cols):
            cells = [
                grid[r][c]
                for r in range(br, br + box_rows)
                for c in range(bc, bc + box_cols)
            ]
            if set(cells) != symbol_set or len(cells) != size:
                return False
    return True


def verify_puzzle(puzzle):
    size = puzzle["size"]
    errors = []
    if len(puzzle["solution"]) != size * size:
        errors.append("solution length")
    if len(puzzle["givens"]) != size * size:
        errors.append("givens length")
    if set(puzzle["symbols"]) != set(puzzle["word"]) | {s for s in puzzle["symbols"] if s.isdigit()}:
        errors.append("symbols must be the animal letters plus numbers")
    if len(puzzle["symbols"]) != size:
        errors.append("symbol count")
    solution, givens = puzzle_to_grids(puzzle)
    if not check_latin(solution, puzzle["symbols"], puzzle["boxRows"], puzzle["boxCols"]):
        errors.append("solution is not a valid sudoku")
    for clue in puzzle["clues"]:
        if clue["dir"] == "row":
            values = solution[clue["index"]]
        else:
            values = [solution[r][clue["index"]] for r in range(size)]
        if not spells(values, puzzle["word"]):
            errors.append(f"clue {clue} does not spell {puzzle['word']}")
    for r in range(size):
        for c in range(size):
            given = givens[r][c]
            if given is not None and given != solution[r][c]:
                errors.append(f"given {given} != solution at {r},{c}")
    found = solve(
        size,
        puzzle["boxRows"],
        puzzle["boxCols"],
        puzzle["symbols"],
        puzzle["word"],
        puzzle["clues"],
        givens,
        limit=2,
    )
    if len(found) != 1:
        errors.append(f"expected 1 solution, found {len(found)}")
    elif found[0] != solution:
        errors.append("unique solution does not match stored solution")
    open_letters = 0
    open_numbers = 0
    letters = set(puzzle["word"])
    for r in range(size):
        for c in range(size):
            if givens[r][c] is None:
                if solution[r][c] in letters:
                    open_letters += 1
                else:
                    open_numbers += 1
    if open_letters < 1 or open_numbers < 1:
        errors.append("player should enter both a letter and a number")
    dirs = {c["dir"] for c in puzzle["clues"]}
    if dirs != {"row", "col"}:
        errors.append("need both an across clue and a down clue")
    if not naked_single_solvable(
        size,
        puzzle["boxRows"],
        puzzle["boxCols"],
        puzzle["symbols"],
        puzzle["word"],
        puzzle["clues"],
        givens,
    ):
        errors.append("puzzle needs guessing; it should yield to one-cell logic")
    return errors


def write_js(puzzles):
    body = json.dumps(puzzles, indent=2)
    text = (
        "// Joyce's animal puzzles.\n"
        "// Each one is a letters-and-numbers Sudoku plus animal crossword clues.\n"
        "// Rebuild with: python3 puzzle_tool.py generate\n"
        "// Check them with: python3 puzzle_tool.py verify\n"
        "const PUZZLES = "
        + body
        + ";\n"
    )
    OUT.write_text(text)
    print(f"Wrote {OUT} ({len(puzzles)} puzzles)")


def show(puzzle):
    size = puzzle["size"]
    print(
        f"\n{puzzle['emoji']} {puzzle['title']} ({puzzle['difficulty']}) "
        f"word {puzzle['word']} symbols {''.join(puzzle['symbols'])}"
    )
    clues = ", ".join(
        f"{'across' if c['dir']=='row' else 'down'} {c['index']+1}" for c in puzzle["clues"]
    )
    empties = sum(1 for g in puzzle["givens"] if g == "")
    print(f"  clues: {clues} | empty cells: {empties}")
    print("  solution        givens")
    for r in range(size):
        sol = " ".join(puzzle["solution"][r * size + c] for c in range(size))
        giv = " ".join(puzzle["givens"][r * size + c] or "·" for c in range(size))
        print(f"  {sol}     {giv}")


def generate():
    rng = random.Random(20260927)
    puzzles = []
    for spec in LEVELS:
        print(f"Building {spec['id']}...", flush=True)
        puzzle = make_level(spec, rng)
        errors = verify_puzzle(puzzle)
        if errors:
            raise RuntimeError(f"{spec['id']} failed verification: {errors}")
        show(puzzle)
        puzzles.append(puzzle)
    write_js(puzzles)


def load_puzzles():
    text = OUT.read_text()
    start = text.index("[")
    end = text.rindex("]") + 1
    return json.loads(text[start:end])


def verify():
    puzzles = load_puzzles()
    if len(puzzles) < 4:
        print("FAIL: need several puzzles")
        return 1
    failed = False
    for puzzle in puzzles:
        errors = verify_puzzle(puzzle)
        solution, givens = puzzle_to_grids(puzzle)
        matter = clues_are_needed(
            solution,
            puzzle["symbols"],
            puzzle["word"],
            puzzle["clues"],
            puzzle["boxRows"],
            puzzle["boxCols"],
            givens,
        )
        status = "OK" if not errors else "FAIL"
        print(
            f"{status} {puzzle['id']}: empties={sum(1 for g in puzzle['givens'] if not g)} "
            f"clues={len(puzzle['clues'])} clues_needed={matter}"
        )
        if errors:
            failed = True
            for err in errors:
                print("  -", err)
    if failed:
        print("VERIFICATION FAILED")
        return 1
    print(f"VERIFIED {len(puzzles)} puzzles, each with exactly one solution")
    return 0


def main():
    if len(sys.argv) < 2 or sys.argv[1] not in {"generate", "verify"}:
        print("Usage: python3 puzzle_tool.py generate|verify")
        return 2
    if sys.argv[1] == "generate":
        generate()
        return 0
    return verify()


if __name__ == "__main__":
    sys.exit(main())
