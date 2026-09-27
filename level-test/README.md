# Level quest

A treasure-map quiz. It is a game of its own: the child picks one subject or walks the whole map, can quit, and can resume. Copy this folder with `questions/` and `stars/`. The page must load the host's `window.KIDS_CHAT` before these scripts.

## How a level is chosen

Each subject starts at level 5, the middle of 1–10. A correct answer steps up one. A wrong answer steps down one. That path is a staircase.

- After 8 questions, it stops if the last two reversals (direction changes) are within 1 level of each other.
- It always stops by 10 questions.
- The saved level is the middle of those last two reversals, or the last level asked if the path never turned.

Fun names run from Pebble (1) to Treasure (10).

Results are stored in `localStorage` under `level-test.<kid>`, with the date. Retaking a subject replaces that result.

## Brain Breaks

When a subject finishes, the page calls:

```javascript
JoyceBrainBreaks.seedFromLevelTest({
  kid: window.KIDS_CHAT.kid,
  levels: { math: 6, verbal: 5, hebrew: 7 }
});
```

See `brain-break/README.md` for how quest levels map onto Brain Break subjects. Verbal seeds word problems. English, Hebrew, and Russian seed the language match. The kid id has to be `joyce` or `miriam`.

```bash
node level-test/test.js
```
