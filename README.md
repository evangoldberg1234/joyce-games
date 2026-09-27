# Joyce's Web

A small static site of games for Joyce. GitHub Pages serves this folder from the project root, so the pages are plain HTML, CSS, and JavaScript with relative links.

Open `index.html` and tap a game.

## Animal Puzzle

A crossword mixed with Sudoku. Each grid uses letters and numbers. Every row, column, and bold box contains each symbol once. Animal clues tell you which lines spell a word, in order, with the numbers sitting in the gaps.

The puzzles live in `animal-puzzle/puzzles.js`. Check that each one has a single solution:

```bash
python3 animal-puzzle/puzzle_tool.py verify
```

## Add a game

1. Make a new folder with its own `index.html`.
2. Add one object to the list in `games.js`.
