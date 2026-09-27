// Joyce's animal puzzles.
// Each one is a letters-and-numbers Sudoku plus animal crossword clues.
// Rebuild with: python3 puzzle_tool.py generate
// Check them with: python3 puzzle_tool.py verify
const PUZZLES = [
  {
    "id": "cat",
    "title": "Cat",
    "difficulty": "Easy",
    "emoji": "\ud83d\udc31",
    "word": "CAT",
    "symbols": [
      "C",
      "A",
      "T",
      "1"
    ],
    "size": 4,
    "boxRows": 2,
    "boxCols": 2,
    "clues": [
      {
        "dir": "row",
        "index": 0
      },
      {
        "dir": "col",
        "index": 1
      }
    ],
    "solution": [
      "1",
      "C",
      "A",
      "T",
      "T",
      "A",
      "1",
      "C",
      "C",
      "1",
      "T",
      "A",
      "A",
      "T",
      "C",
      "1"
    ],
    "givens": [
      "",
      "C",
      "",
      "",
      "T",
      "",
      "1",
      "C",
      "C",
      "1",
      "T",
      "A",
      "A",
      "",
      "C",
      "1"
    ]
  },
  {
    "id": "dog",
    "title": "Dog",
    "difficulty": "Easy",
    "emoji": "\ud83d\udc36",
    "word": "DOG",
    "symbols": [
      "D",
      "O",
      "G",
      "2"
    ],
    "size": 4,
    "boxRows": 2,
    "boxCols": 2,
    "clues": [
      {
        "dir": "row",
        "index": 2
      },
      {
        "dir": "col",
        "index": 0
      }
    ],
    "solution": [
      "D",
      "2",
      "G",
      "O",
      "O",
      "G",
      "D",
      "2",
      "2",
      "D",
      "O",
      "G",
      "G",
      "O",
      "2",
      "D"
    ],
    "givens": [
      "D",
      "2",
      "G",
      "O",
      "",
      "G",
      "D",
      "2",
      "",
      "D",
      "",
      "",
      "",
      "O",
      "2",
      "D"
    ]
  },
  {
    "id": "fox",
    "title": "Fox",
    "difficulty": "Medium",
    "emoji": "\ud83e\udd8a",
    "word": "FOX",
    "symbols": [
      "F",
      "O",
      "X",
      "3"
    ],
    "size": 4,
    "boxRows": 2,
    "boxCols": 2,
    "clues": [
      {
        "dir": "row",
        "index": 1
      },
      {
        "dir": "col",
        "index": 2
      }
    ],
    "solution": [
      "3",
      "X",
      "F",
      "O",
      "F",
      "O",
      "3",
      "X",
      "X",
      "3",
      "O",
      "F",
      "O",
      "F",
      "X",
      "3"
    ],
    "givens": [
      "",
      "X",
      "",
      "O",
      "",
      "",
      "",
      "",
      "X",
      "3",
      "",
      "F",
      "O",
      "",
      "",
      "3"
    ]
  },
  {
    "id": "owl",
    "title": "Owl",
    "difficulty": "Medium",
    "emoji": "\ud83e\udd89",
    "word": "OWL",
    "symbols": [
      "O",
      "W",
      "L",
      "4"
    ],
    "size": 4,
    "boxRows": 2,
    "boxCols": 2,
    "clues": [
      {
        "dir": "row",
        "index": 3
      },
      {
        "dir": "col",
        "index": 0
      }
    ],
    "solution": [
      "O",
      "L",
      "4",
      "W",
      "W",
      "4",
      "L",
      "O",
      "L",
      "W",
      "O",
      "4",
      "4",
      "O",
      "W",
      "L"
    ],
    "givens": [
      "",
      "L",
      "4",
      "W",
      "",
      "4",
      "L",
      "",
      "",
      "W",
      "O",
      "",
      "",
      "",
      "",
      ""
    ]
  },
  {
    "id": "bear",
    "title": "Bear",
    "difficulty": "Harder",
    "emoji": "\ud83d\udc3b",
    "word": "BEAR",
    "symbols": [
      "B",
      "E",
      "A",
      "R",
      "1",
      "2"
    ],
    "size": 6,
    "boxRows": 2,
    "boxCols": 3,
    "clues": [
      {
        "dir": "row",
        "index": 0
      },
      {
        "dir": "col",
        "index": 2
      }
    ],
    "solution": [
      "B",
      "E",
      "2",
      "1",
      "A",
      "R",
      "R",
      "A",
      "1",
      "B",
      "2",
      "E",
      "2",
      "R",
      "B",
      "E",
      "1",
      "A",
      "A",
      "1",
      "E",
      "R",
      "B",
      "2",
      "E",
      "B",
      "A",
      "2",
      "R",
      "1",
      "1",
      "2",
      "R",
      "A",
      "E",
      "B"
    ],
    "givens": [
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "A",
      "",
      "B",
      "2",
      "E",
      "2",
      "R",
      "",
      "E",
      "1",
      "A",
      "",
      "1",
      "",
      "R",
      "B",
      "2",
      "E",
      "B",
      "",
      "2",
      "R",
      "1",
      "",
      "2",
      "",
      "A",
      "",
      ""
    ]
  },
  {
    "id": "frog",
    "title": "Frog",
    "difficulty": "Harder",
    "emoji": "\ud83d\udc38",
    "word": "FROG",
    "symbols": [
      "F",
      "R",
      "O",
      "G",
      "3",
      "4"
    ],
    "size": 6,
    "boxRows": 2,
    "boxCols": 3,
    "clues": [
      {
        "dir": "row",
        "index": 4
      },
      {
        "dir": "col",
        "index": 1
      },
      {
        "dir": "row",
        "index": 1
      }
    ],
    "solution": [
      "O",
      "4",
      "G",
      "F",
      "3",
      "R",
      "3",
      "F",
      "R",
      "O",
      "G",
      "4",
      "G",
      "R",
      "3",
      "4",
      "F",
      "O",
      "F",
      "O",
      "4",
      "G",
      "R",
      "3",
      "4",
      "3",
      "F",
      "R",
      "O",
      "G",
      "R",
      "G",
      "O",
      "3",
      "4",
      "F"
    ],
    "givens": [
      "",
      "",
      "",
      "",
      "3",
      "R",
      "",
      "",
      "",
      "",
      "",
      "",
      "G",
      "",
      "3",
      "4",
      "",
      "O",
      "F",
      "",
      "4",
      "G",
      "R",
      "3",
      "",
      "",
      "",
      "",
      "",
      "",
      "R",
      "",
      "O",
      "3",
      "4",
      "F"
    ]
  }
];
