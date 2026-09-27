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

## Brain Breaks

Brain Breaks are the shared pause between play: a few questions instead of an ad. The module lives in `brain-break/` (script, styles, and question data). Animal Puzzle already uses it. Another game can add the same two lines.

From a game folder one level down from the site root:

```html
<link rel="stylesheet" href="../brain-break/brain-break.css">
<script src="../brain-break/brain-break.js"></script>
```

Then start it when the game starts. `isPaused` should be true on menus, how-to screens, and win screens, so the timer only counts active play. Call `betweenLevels()` after a level is solved and before the next one starts. If a break just finished, that call will not stack a second one.

```javascript
var breaks = JoyceBrainBreaks.attach({
  isPaused: function () {
    return howtoOpen || justSolved || screen !== "play";
  }
});

breaks.betweenLevels().then(startNextLevel);
```

Joyce and Miriam each have saved levels for math, word problems, word match (English, Russian, and Hebrew), and the weekly Torah portion. A break is about three questions. The game stays paused until the break is finished.

For testing, add `?bbtest=10` to the game URL. That uses a 10 second timer instead of a minute and a half. Nothing about it is shown on screen.

```bash
node brain-break/test.js
```
