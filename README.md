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

## Treasure Map and stars

Treasure Map (`level-test/`) finds a level in math, verbal, English, Hebrew, Russian, and Parsha, then seeds Brain Breaks and saves those levels on the star server. Practice (`practice/`) asks more questions at that level. A right answer can earn one star, up to 100 a day. Animal Puzzle hints cost 5 stars. Asking Sofie for a new game costs 20 stars, and that charge happens in the chat. The shared pieces are `questions/`, `level-test/`, `practice/`, and `stars/`. Book Club (`books/`) lets her log a finished book. The quiz happens in the chat. A long book can earn 20 stars. Homework (`homework/`) checks a photo of one worksheet. The check can take about a minute. A sheet can earn up to 10 stars, and homework stars stop at 20 for the day.

## Brain Breaks

Brain Breaks are a short set of questions at the end of every level, instead of an ad. There is no timer. The module lives in `brain-break/` and is meant to be copied into another site unchanged. See `brain-break/README.md` for the full game-author notes.

From a game folder one level down from the site root:

```html
<link rel="stylesheet" href="../brain-break/brain-break.css">
<script src="../brain-break/brain-break.js"></script>
```

When a level ends, win or loss, wait for the break, then continue:

```javascript
JoyceBrainBreaks.levelEnd({ won: true, level: levelNumber }).then(function () {
  startNextLevel();
});
```

`level` is the 1-based game level she just finished. A higher level nudges the questions harder. That nudge is not saved. `won` is `true` when she beat the level and `false` when she missed it, ran out of chances, gave up, or restarted. The promise resolves when she taps Keep playing. If a break is already open, that same promise is returned.

Animal Puzzle calls this when she leaves the “You did it!” screen (next animal, all animals, or play again) and when she taps Reset on a puzzle she has not finished. Reset is the give-up path, because the puzzle has no lives. Hint, Erase, and the Animals menu do not end the level. Opening a puzzle from the menu does not show a break.

Joyce and Miriam each have saved levels for math, word problems, word match (English, Russian, and Hebrew), and the weekly Torah portion. Correct answers step a level up. Misses step it down gently. A break is about three questions.

```bash
node brain-break/test.js
```

## Safety rules

Stars and prices are enforced on the server only. The site can show a balance the server sent. It cannot grant stars. Editing `settings.js` or the data saved on the iPad cannot create stars. The chat cannot change settings. Only a parent can change settings, by editing `settings.js`.

## Set this up for your own kids

You can make a copy of this site for your own child.

1. On GitHub, open this project and click **Fork**. That makes your own copy.
2. Delete the `CNAME` file, or replace what is inside it with your own web address. That file points at Joyce's website. A fork should remove it, or use its own domain.
3. Open `settings.js`. Change the name, age, grade, subjects, and languages. That is the only file that is different for each child. Leave the game folders as they are.
4. Turn on GitHub Pages. Go to **Settings**, then **Pages**, then **Deploy from a branch**. Choose branch `main` and the `/` (root) folder.

Your site will show up at `https://<username>.github.io/<repo>/`.

Chat and stars are optional. The games work fine without them. A backend can be self-hosted later if you want chat and stars. See [BACKEND.md](BACKEND.md). This project does not include any passwords or secret keys.
