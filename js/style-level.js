/* Reading register for Joyce's pages.
   Young, Older, or Advanced. Default is Advanced.
   localStorage key: jw-style.
   A missing module (Miriam's copy of Brain Breaks) is not this file.
   This file does not change stars, prices, caps, or settings.js. */
(function (root) {
  var KEY = "jw-style";
  var EVENT = "jw-style-change";
  var LEVELS = ["young", "older", "advanced"];
  var DEFAULT = "advanced";

  var COPY = {
    "home.hello": {
      young: "Hi, {name}!",
      older: "Hello, {name}.",
      advanced: "Welcome back, {name}."
    },
    "home.tag": {
      young: "Tap a game.",
      older: "Pick a game to play.",
      advanced: "Choose where to spend your attention."
    },
    "home.price": {
      young: "A new game costs {price} stars.",
      older: "A new game costs {price} stars.",
      advanced: "A new game costs {price} stars."
    },
    "home.newgame": {
      young: "Ask {bot} for a new game",
      older: "Ask {bot} for a new game",
      advanced: "Ask {bot} to devise a new game"
    },
    "home.made": {
      young: "Made for {name}",
      older: "Made for {name}",
      advanced: "Built for {name}"
    },
    "home.play": {
      young: "Play",
      older: "Play",
      advanced: "Enter"
    },
    "home.empty": {
      young: "New games are coming soon.",
      older: "New games are on the way.",
      advanced: "New games are in preparation."
    },
    "chrome.howto": {
      young: "How to play",
      older: "How to play",
      advanced: "Instructions"
    },
    "game.treasure": {
      young: "Find your level. Brain Breaks remember it.",
      older: "A quest that finds your level, then saves it for Brain Breaks.",
      advanced: "A placement quest. It estimates your level in each subject and stores it for Brain Breaks."
    },
    "game.practice": {
      young: "More questions. A right answer can earn a star.",
      older: "Extra questions at your level. Each right answer can earn a star.",
      advanced: "Further questions at your measured level. A correct answer can earn a star."
    },
    "game.practice.free": {
      young: "More questions at your level.",
      older: "Extra questions at your level.",
      advanced: "Further questions at your measured level."
    },
    "game.books": {
      young: "Tell us a book you read. A long book can earn 20 stars.",
      older: "Tell us a book you finished. A long book can earn 20 stars.",
      advanced: "Report a book you finished. A long book can earn 20 stars. A short one does not."
    },
    "game.homework": {
      young: "Take a photo of your worksheet. Right answers can earn stars.",
      older: "Photograph one worksheet. Correct work can earn stars.",
      advanced: "Submit a photograph of one worksheet. Accurate work can earn stars."
    },
    "game.animals": {
      young: "A crossword and a number puzzle, with animals.",
      older: "A crossword and a Sudoku, with animals, letters, and numbers.",
      advanced: "A crossword beside a Sudoku, built from animals, letters, and digits."
    },
    "game.icecream": {
      young: "Ocean puzzles. Then build an ice cream.",
      older: "Ocean Sudoku and crossword clues. Then build your own ice cream.",
      advanced: "A seaside crossword-Sudoku. Clear a wave, then compose an ice cream."
    },
    "game.spa": {
      young: "Try hair, makeup, and nails. Dig a silly hole too.",
      older: "Style hair, makeup, skin, and nails. A silly dig is there too.",
      advanced: "Compose a look: hair, makeup, skin, and nails. A concealed dig remains, should you want it."
    },
    "practice.lead": {
      young: "{bot} has more questions. A right answer can earn {n} {unit}.",
      older: "{bot} has extra questions at your level. A right answer can earn {n} {unit}.",
      advanced: "{bot} has further questions, pitched from your level. A correct answer can earn {n} {unit}."
    },
    "practice.free": {
      young: "{bot} has more questions. Play as many as you like.",
      older: "{bot} has extra questions. Play as many as you like.",
      advanced: "{bot} has further questions. Work through as many as you wish."
    },
    "practice.quit": {
      young: "Pick another subject",
      older: "Pick another subject",
      advanced: "Choose another subject"
    },
    "practice.next": {
      young: "Next question",
      older: "Next question",
      advanced: "Continue"
    },
    "map.intro": {
      young: "{bot} has a map for {name}. Pick an island, or do them all.",
      older: "{bot} has a treasure map for {name}. Pick an island, or walk the whole map.",
      advanced: "{bot} prepared a placement map for {name}. Choose a subject, or proceed through every one."
    },
    "map.walk": {
      young: "Do them all",
      older: "Walk the whole map",
      advanced: "Assess every subject"
    },
    "map.levels": {
      young: "See my levels",
      older: "See my levels",
      advanced: "Review my levels"
    },
    "map.continue": {
      young: "Continue {title}",
      older: "Continue {title}",
      advanced: "Resume {title}"
    },
    "map.next": {
      young: "Next",
      older: "On we go",
      advanced: "Continue"
    },
    "map.see": {
      young: "See my level",
      older: "See this level",
      advanced: "Record this level"
    },
    "map.results": {
      young: "Here are your levels, {name}.",
      older: "The map is marked, {name}. Here are your levels.",
      advanced: "Placement is recorded, {name}. These are your levels."
    },
    "map.back": {
      young: "Back to the map",
      older: "Back to the map",
      advanced: "Return to the map"
    },
    "map.retake": {
      young: "Try {title} again",
      older: "Retake {title}",
      advanced: "Reassess {title}"
    },
    "ask.yes": {
      young: "Yes! ",
      older: "Correct. ",
      advanced: "Correct. "
    },
    "ask.no": {
      young: "Not quite. ",
      older: "Not quite. ",
      advanced: "Not this one. "
    },
    "bb.kicker": {
      young: "Brain Break",
      older: "Brain Break",
      advanced: "Brain Break"
    },
    "bb.who": {
      young: "Who is playing?",
      older: "Who is playing?",
      advanced: "Who is working?"
    },
    "bb.tap": {
      young: "Tap your name.",
      older: "Tap your name.",
      advanced: "Choose your name."
    },
    "bb.doneTitle": {
      young: "All done.",
      older: "Brain break complete.",
      advanced: "The break is complete."
    },
    "bb.doneWin": {
      young: "You finished the level. Back to the game.",
      older: "You finished the level. Back to the game.",
      advanced: "The level is complete. Return to the game."
    },
    "bb.doneLoss": {
      young: "Good try. Back to the game.",
      older: "Back to the game.",
      advanced: "Return to the game and attempt the level again."
    },
    "bb.keep": {
      young: "Keep playing",
      older: "Keep playing",
      advanced: "Continue"
    },
    "bb.yes": {
      young: "Yes!",
      older: "Correct.",
      advanced: "Correct."
    },
    "bb.almost": {
      young: "Almost! Try another one.",
      older: "Not quite. Try another.",
      advanced: "Incorrect. Consider the others."
    },
    "bb.got": {
      young: "Got it",
      older: "Got it",
      advanced: "Understood"
    },
    "bb.hear": {
      young: "Hear it",
      older: "Hear it",
      advanced: "Hear it"
    },
    "bb.math": {
      young: "Adding and subtracting",
      older: "Math",
      advanced: "Arithmetic"
    },
    "bb.words": {
      young: "Word problem",
      older: "Word problem",
      advanced: "Word problem"
    },
    "bb.translate": {
      young: "Word match",
      older: "Word match",
      advanced: "Vocabulary"
    },
    "bb.parsha": {
      young: "Torah portion",
      older: "Torah portion",
      advanced: "The weekly portion"
    },
    "bb.week": {
      young: "This week: ",
      older: "This week: ",
      advanced: "This week's reading: "
    },
    "bb.switch": {
      young: "Switch player",
      older: "Switch player",
      advanced: "Switch player"
    },
    "books.lead": {
      young: "Read a book. A long one can earn 20 stars.",
      older: "Tell us a book you finished. A long one can earn 20 stars.",
      advanced: "Record a book you finished. A long one can earn 20 stars. A short one does not."
    },
    "books.titleLabel": {
      young: "Book title",
      older: "Book title",
      advanced: "Title"
    },
    "books.authorLabel": {
      young: "Author, if you know it",
      older: "Author, if you know it",
      advanced: "Author, if you know it"
    },
    "books.find": {
      young: "Find",
      older: "Find",
      advanced: "Search"
    },
    "books.mine": {
      young: "My books",
      older: "My books",
      advanced: "My shelf"
    },
    "books.needTitle": {
      young: "Type the book's name.",
      older: "Type the book's name.",
      advanced: "Enter the title."
    },
    "books.looking": {
      young: "Looking...",
      older: "Looking...",
      advanced: "Searching the library..."
    },
    "books.none": {
      young: "No book with that name. Try again.",
      older: "No book with that name. Try again.",
      advanced: "No title matched. Try another spelling."
    },
    "books.which": {
      young: "Is it one of these?",
      older: "Is it one of these?",
      advanced: "Is it one of these?"
    },
    "books.shelf": {
      young: "My books",
      older: "My books",
      advanced: "My shelf"
    },
    "books.empty": {
      young: "No books yet. Find one you have read.",
      older: "No books yet. Find one you have read.",
      advanced: "The shelf is empty. Add a book you have finished."
    },
    "books.locked": {
      young: "Ask a grown-up to unlock. Open the chat bubble and enter the family code.",
      older: "Ask a grown-up to unlock. Open the chat bubble and enter the family code.",
      advanced: "A grown-up needs to unlock this. Open the chat and enter the family code."
    },
    "books.openChat": {
      young: "Open the chat",
      older: "Open the chat",
      advanced: "Open the chat"
    },
    "books.again": {
      young: "Try again",
      older: "Try again",
      advanced: "Try again"
    },
    "books.asleep": {
      young: "Book Club is waking up...",
      older: "Book Club is waking up.",
      advanced: "Book Club is not ready yet."
    },
    "books.checked": {
      young: "Nice reading. Tell {bot} what happened in the book.",
      older: "You finished it. Tell {bot} about the book.",
      advanced: "The book is recorded. Tell {bot} what you made of it."
    },
    "books.chat": {
      young: "Open the chat to talk with {bot} about it.",
      older: "Open the chat to tell {bot} about it.",
      advanced: "Continue with {bot} in the chat."
    },
    "books.short": {
      young: "This book is shorter than {min} pages, so it does not earn stars. You can still read it.",
      older: "This book is shorter than {min} pages, so it does not earn stars.",
      advanced: "Under {min} pages, so it does not meet the minimum for stars."
    },
    "books.paid": {
      young: "You already got stars for this book.",
      older: "You already earned stars for this book.",
      advanced: "Stars for this book are already recorded."
    },
    "books.progress": {
      young: "You are already telling {bot} about this book. Open the chat.",
      older: "You are already telling {bot} about this book. Open the chat.",
      advanced: "A conversation about this book is already open. Continue in the chat."
    },
    "books.twice": {
      young: "You already tried this book twice. Pick a different one.",
      older: "You already tried this book twice. Pick a different one.",
      advanced: "This title has already been tried twice. Choose a different book."
    },
    "books.other": {
      young: "Try another book.",
      older: "Try another book.",
      advanced: "Choose another book."
    },
    "books.moment": {
      young: "One moment...",
      older: "One moment.",
      advanced: "One moment."
    },
    "books.opening": {
      young: "Opening your books...",
      older: "Opening your books.",
      advanced: "Opening your shelf."
    },
    "hw.lead": {
      young: "Take a picture of one worksheet.",
      older: "Take a picture of one worksheet.",
      advanced: "Photograph one worksheet."
    },
    "hw.shoot": {
      young: "Take a photo of your worksheet",
      older: "Take a photo of your worksheet",
      advanced: "Photograph the worksheet"
    },
    "hw.checking": {
      young: "Checking...",
      older: "Checking.",
      advanced: "Reviewing the page."
    },
    "hw.history": {
      young: "My homework",
      older: "My homework",
      advanced: "Past worksheets"
    },
    "hw.none": {
      young: "No worksheets yet.",
      older: "No worksheets yet.",
      advanced: "No worksheets yet."
    },
    "hw.home": {
      young: "Go home",
      older: "Go home",
      advanced: "Return home"
    },
    "hw.hear": {
      young: "Hear it",
      older: "Hear it",
      advanced: "Hear it"
    },
    "hw.checked": {
      young: "I checked your worksheet.",
      older: "Your worksheet has been checked.",
      advanced: "The worksheet has been checked."
    },
    "hw.daily": {
      young: "You've earned all {day} homework stars today. Your answers are still checked.",
      older: "You've earned all {day} homework stars today. Your answers are still checked.",
      advanced: "Today's homework cap is {day} stars, and it is reached. Answers are still checked."
    },
    "hw.sheet": {
      young: "That's the most stars for one sheet ({cap}).",
      older: "That's the most stars for one sheet ({cap}).",
      advanced: "This sheet has reached its cap of {cap} stars."
    },
    "hw.retake": {
      young: "I couldn't read that clearly. Try again with good light, the whole page in the picture, and hold still.",
      older: "I couldn't read that clearly. Try again with good light, the whole page in the picture, and hold still.",
      advanced: "The page was hard to read. Retake it in good light, with the whole sheet in frame, and hold still."
    },
    "hw.dup": {
      young: "I already checked this one. Fix a problem, then take a new photo.",
      older: "This page was already checked. Fix a problem, then take a new photo.",
      advanced: "This page was already checked. Correct a problem, then submit a new photo."
    },
    "hw.not": {
      young: "That doesn't look like a worksheet.",
      older: "That doesn't look like a worksheet.",
      advanced: "That image does not look like a worksheet."
    },
    "hw.newly": {
      young: "Only newly fixed problems earn stars.",
      older: "Only newly fixed problems earn stars.",
      advanced: "Only newly corrected problems earn stars."
    },
    "hw.wait": {
      young: "Still checking. I'll tell you in the chat bubble too.",
      older: "Still checking. I'll tell you in the chat bubble too.",
      advanced: "Still reviewing. The result will also appear in the chat."
    },
    "hw.chat": {
      young: "You can also chat about it.",
      older: "You can also chat about it.",
      advanced: "You can also discuss it in the chat."
    },
    "hw.waitLines": {
      young: [
        "Looking at problem 1.",
        "Looking at problem 2.",
        "Checking each line."
      ],
      older: [
        "Reading problem 1.",
        "Reading problem 2.",
        "Checking each line."
      ],
      advanced: [
        "Reading the first problem.",
        "Comparing the work with the question.",
        "Checking the next line."
      ]
    },
    "ice.hi": {
      young: "Hi, {name}!",
      older: "Hello, {name}.",
      advanced: "Welcome back, {name}."
    },
    "ice.howtoTitle": {
      young: "How to play",
      older: "How to play",
      advanced: "Instructions"
    },
    "ice.howtoLead": {
      young: "Hi {name}. This is a crossword and a Sudoku, at the ocean.",
      older: "Hi {name}. This is a crossword and a Sudoku, at the ocean.",
      advanced: "{name}, this is a crossword and a Sudoku, set at the ocean."
    },
    "ice.go": {
      young: "Let's splash",
      older: "Let's start",
      advanced: "Begin"
    },
    "ice.example": {
      young: "Say I, C, E. That spells ICE. The number sits in the word.",
      older: "Say I, C, E. That spells ICE. The number sits in the word.",
      advanced: "Read I, C, E. That spells ICE. The digit sits inside the word."
    },
    "ice.pink": {
      young: "Pink boxes mean try a new one. Hint shows one box. It does not fill it in.",
      older: "Pink boxes mean try a new one. Hint shows one box. It does not fill it in.",
      advanced: "A pink cell is a conflict. Hint reveals one cell. It does not fill the grid."
    },
    "ice.board": {
      young: "Scoop board",
      older: "Scoop board",
      advanced: "Scoop board"
    },
    "ice.boardSub": {
      young: "Who has the most scoops on this iPad?",
      older: "Who has the most scoops on this iPad?",
      advanced: "Who has the most scoops on this iPad?"
    },
    "ice.start": {
      young: "Tap a box. Then tap a letter or a number.",
      older: "Tap a box. Then tap a letter or a number.",
      advanced: "Select an empty cell, then a letter or a digit."
    },
    "ice.watch": {
      young: "Watch the glowing box.",
      older: "Watch the glowing box.",
      advanced: "Watch the highlighted cell."
    },
    "ice.canbe": {
      young: "That box can be {symbol}.",
      older: "That box can be {symbol}.",
      advanced: "{symbol} fits that cell."
    },
    "ice.first": {
      young: "Tap a box first.",
      older: "Tap a box first.",
      advanced: "Select a cell first."
    },
    "ice.starter": {
      young: "That box is a starter. Pick an empty one.",
      older: "That box is a starter. Pick an empty one.",
      advanced: "That cell is given. Choose an empty one."
    },
    "ice.order": {
      young: "Read the letters in order. They spell {word}.",
      older: "Read the letters in order. They spell {word}.",
      advanced: "Read the letters in order. They spell {word}."
    },
    "ice.clash": {
      young: "Two boxes match. Try a new one.",
      older: "Two boxes match. Try a new one.",
      advanced: "Those two cells match. Choose a different symbol."
    },
    "ice.nice": {
      young: "Nice.",
      older: "That works.",
      advanced: "That placement holds."
    },
    "ice.keep": {
      young: "Keep going.",
      older: "Keep going.",
      advanced: "Continue."
    },
    "ice.empty": {
      young: "That box is empty now.",
      older: "That box is empty now.",
      advanced: "That cell is clear."
    },
    "ice.cleared": {
      young: "All clear. You can try again.",
      older: "All clear. You can try again.",
      advanced: "Cleared. You may begin again."
    },
    "ice.now": {
      young: "Now tap a letter or a number.",
      older: "Now tap a letter or a number.",
      advanced: "Now choose a letter or a digit."
    },
    "ice.erase": {
      young: "Erase a pink box and try a new one.",
      older: "Erase a pink box and try a new one.",
      advanced: "Clear a pink cell and try a different symbol."
    },
    "ice.backHappy": {
      young: "The {title} is happy you came back.",
      older: "The {title} is glad you came back.",
      advanced: "The {title} notes your return."
    },
    "ice.earned": {
      young: "You earned {pts} scoops. You have {total} scoops.",
      older: "You earned {pts} scoops. You have {total} scoops.",
      advanced: "You earned {pts} scoops. Your total is {total}."
    },
    "ice.steps": {
      young: [
        "Pick a swimmer. That profile keeps your scoops and ice creams on this iPad.",
        "Tap an empty box. Then tap a letter or a number.",
        "Every row, every column, and every bold box uses each letter and number one time.",
        "Mint boxes are the clue. Read the letters in order. They spell the word. A number can sit in the word.",
        "Finish a wave to earn scoops. Then build an ice cream and save it.",
        "The scoop board shows who has the most scoops on this iPad."
      ],
      older: [
        "Pick a swimmer. That profile keeps your scoops and ice creams on this iPad.",
        "Tap an empty box. Then tap a letter or a number.",
        "Every row, every column, and every bold box uses each letter and number one time.",
        "Mint boxes are the clue. Read the letters in order. They spell the word. A number can sit in the word.",
        "Finish a wave to earn scoops. Then build an ice cream and save it.",
        "The scoop board shows who has the most scoops on this iPad."
      ],
      advanced: [
        "Choose a swimmer. That profile keeps scoops and ice creams on this iPad.",
        "Select an empty cell, then a letter or a digit.",
        "Each row, column, and bold box contains every letter and digit once.",
        "Mint cells are the clue. Read those letters in order. They spell the word. A digit may sit inside it.",
        "Finish a wave to earn scoops, then compose an ice cream and save it.",
        "The scoop board ranks everyone on this iPad."
      ]
    },
    "spa.kicker": {
      young: "A huge spa just for you",
      older: "A spa for you",
      advanced: "The salon is open"
    },
    "spa.sub": {
      young: "Try hair on the mannequin, then style the guest. Style points stay in this game.",
      older: "Try hair on the mannequin, then style the guest. Style points stay in this game.",
      advanced: "Test hair on the mannequin, then dress the guest. Style points stay inside this game."
    },
    "spa.howtoLead": {
      young: "Welcome to Spa Salon. Each guest wants one look.",
      older: "Welcome to Spa Salon. Each guest wants one look.",
      advanced: "Each guest arrives with one requested look."
    },
    "spa.lets": {
      young: "Let's play",
      older: "Start",
      advanced: "Begin"
    },
    "spa.style": {
      young: "Let's style",
      older: "Start styling",
      advanced: "Begin"
    },
    "spa.digAgain": {
      young: "Dig again",
      older: "Dig again",
      advanced: "Dig again"
    },
    "spa.digFirst": {
      young: "Tee-hee. It's poop. +{n} style points.",
      older: "Found it. +{n} style points.",
      advanced: "Excavation complete. +{n} style points, as advertised."
    },
    "spa.digAgainMsg": {
      young: "Tee-hee. It's poop again.",
      older: "There it is again.",
      advanced: "The same find, again."
    },
    "spa.digStay": {
      young: "Silly surprise. Those {n} style points stay in this game.",
      older: "Those {n} style points stay in this game.",
      advanced: "Those {n} style points remain in this game."
    },
    "spa.digAlready": {
      young: "You already got the silly style points.",
      older: "You already received those style points.",
      advanced: "Those style points are already counted."
    },
    "spa.digHint": {
      young: "Tap or hold Dig. Something silly is under the grass.",
      older: "Tap or hold Dig. Something silly is under the grass.",
      advanced: "Tap or hold Dig. Something is buried under the grass."
    },
    "spa.hit": {
      young: "Yes. {name}",
      older: "Matched. {name}",
      advanced: "Matched. {name}"
    },
    "spa.miss": {
      young: "Wanted {wanted}. You picked {got}.",
      older: "Wanted {wanted}. You picked {got}.",
      advanced: "The list asked for {wanted}. This look has {got}."
    },
    "spa.steps": {
      young: [
        "Read the look list. It tells you the hair, makeup, skincare, and nails.",
        "Tap a hair style. It goes on the mannequin head first.",
        "Tap Put this hair on the guest when you want them to wear it.",
        "Pick makeup, skincare, and nail polish. Those go right on the guest.",
        "Tap Dig anytime. Tap or hold Dig until a silly surprise pops up. The first time adds 5 style points.",
        "Tap All done. The spa checks the list.",
        "Looks amazing is 40 style points. Looks okay is 20. Looks kinda bad is 5. Looks horrible is 0.",
        "Style points stay in this game. The star bar is your real stars."
      ],
      older: [
        "Read the look list. It tells you the hair, makeup, skincare, and nails.",
        "Tap a hair style. It goes on the mannequin head first.",
        "Tap Put this hair on the guest when you want them to wear it.",
        "Pick makeup, skincare, and nail polish. Those go right on the guest.",
        "Tap Dig anytime. Tap or hold Dig until a surprise pops up. The first time adds 5 style points.",
        "Tap All done. The spa checks the list.",
        "Looks amazing is 40 style points. Looks okay is 20. Looks kinda bad is 5. Looks horrible is 0.",
        "Style points stay in this game. The star bar is your real stars."
      ],
      advanced: [
        "Read the brief. It specifies hair, makeup, skincare, and nails.",
        "Choose a hair style. It appears on the mannequin first.",
        "Apply that hair to the guest when you want it worn.",
        "Choose makeup, skincare, and nail polish. Those go directly on the guest.",
        "Dig at any time. Hold Dig until the buried find appears. The first discovery adds 5 style points.",
        "Tap All done. The salon checks the brief.",
        "Looks amazing is 40 style points. Looks okay is 20. Looks kinda bad is 5. Looks horrible is 0.",
        "Style points stay in this game. The star bar is separate."
      ]
    },
    "animal.lead": {
      young: "Hi {name}. This is a crossword and a Sudoku.",
      older: "Hi {name}. This is a crossword and a Sudoku.",
      advanced: "{name}, this is a crossword paired with a Sudoku."
    },
    "animal.go": {
      young: "Let's play",
      older: "Start",
      advanced: "Begin"
    },
    "animal.example": {
      young: "Say C, A, T. That spells CAT. The number sits in the word.",
      older: "Say C, A, T. That spells CAT. The number sits in the word.",
      advanced: "Read C, A, T. That spells CAT. The digit sits inside the word."
    },
    "animal.pink": {
      young: "Pink boxes mean try a new one. Hint fills one box for you.",
      older: "Pink boxes mean try a new one. Hint fills one box for you.",
      advanced: "A pink cell is a conflict. Hint fills one cell."
    },
    "animal.win": {
      young: "You did it.",
      older: "Solved.",
      advanced: "Solved."
    },
    "animal.happy": {
      young: "The {title} is glad.",
      older: "The {title} puzzle is finished.",
      advanced: "The {title} puzzle is complete."
    },
    "animal.steps": {
      young: [
        "Tap an empty box.",
        "Tap a letter or a number.",
        "Every row, every column, and every bold box uses each letter and number one time.",
        "The animal clue shows the word. The letters in that line spell the word, in order. A number can sit in the line too."
      ],
      older: [
        "Tap an empty box.",
        "Tap a letter or a number.",
        "Every row, every column, and every bold box uses each letter and number one time.",
        "The animal clue shows the word. The letters in that line spell the word, in order. A number can sit in the line too."
      ],
      advanced: [
        "Select an empty cell.",
        "Choose a letter or a digit.",
        "Each row, column, and bold box contains every letter and digit once.",
        "The animal clue names the word. Those letters, in order, spell it. A digit may sit in the line."
      ]
    }
  };

  function isLevel(value) {
    return value === "young" || value === "older" || value === "advanced";
  }

  function get() {
    try {
      var stored = root.localStorage && root.localStorage.getItem(KEY);
      if (isLevel(stored)) return stored;
    } catch (err) {
      /* Private mode still gets the default. */
    }
    return DEFAULT;
  }

  function emit(level) {
    if (!root || typeof root.dispatchEvent !== "function" || typeof root.CustomEvent !== "function") return;
    root.dispatchEvent(new root.CustomEvent(EVENT, { detail: { level: level } }));
  }

  function set(level) {
    if (!isLevel(level)) return get();
    try {
      if (root.localStorage) root.localStorage.setItem(KEY, level);
    } catch (err) {
      /* The choice still applies for this page view. */
    }
    emit(level);
    return level;
  }

  function boost(style) {
    var level = style == null || style === "" ? get() : style;
    if (level === "advanced") return 2;
    if (level === "older") return 1;
    return 0;
  }

  /* Question difficulty at or above the adaptive level.
     Young adds nothing. Unknown styles add nothing.
     A cap may stop a raise. It never pulls the result under the adaptive level. */
  function questionLevel(adaptive, style, max) {
    var base = Math.round(Number(adaptive) || 1);
    if (base < 1) base = 1;
    var next = base + boost(style);
    if (max != null && max !== "") {
      var cap = Math.round(Number(max));
      if (isFinite(cap) && next > cap) next = cap;
    }
    if (next < base) next = base;
    return next;
  }

  /* One star per correct practice answer, in every register.
     The argument is accepted and ignored so a caller cannot fork the award. */
  function practiceReward() {
    return { stars: 1, note: "1 star earned" };
  }

  function baseVars() {
    var settings = root.KIDS_SETTINGS || {};
    var prices = settings.starPrices || {};
    var homework = settings.homework || {};
    return {
      name: settings.childName || "Joyce",
      bot: settings.botName || "Sofie",
      price: prices.newGame != null ? prices.newGame : 20,
      practice: prices.practice != null ? prices.practice : 1,
      sheet: homework.perSheet != null ? homework.perSheet : 10,
      day: homework.perDay != null ? homework.perDay : 20
    };
  }

  function fill(template, vars) {
    return String(template == null ? "" : template).replace(/\{(\w+)\}/g, function (_, key) {
      return vars && vars[key] != null ? String(vars[key]) : "";
    });
  }

  function t(key, fallback, extra) {
    var entry = COPY[key];
    var style = get();
    var template = fallback;
    if (entry && entry[style] != null && typeof entry[style] === "string") template = entry[style];
    if (template == null) template = "";
    var vars = baseVars();
    if (extra) {
      var name;
      for (name in extra) {
        if (Object.prototype.hasOwnProperty.call(extra, name)) vars[name] = extra[name];
      }
    }
    return fill(template, vars);
  }

  function list(key) {
    var entry = COPY[key];
    if (!entry) return [];
    var style = get();
    var value = entry[style] != null ? entry[style] : entry.advanced;
    if (!Array.isArray(value)) return [];
    return value.slice();
  }

  function applyDom(scope) {
    if (typeof document === "undefined") return;
    var rootNode = scope && scope.querySelectorAll ? scope : document;
    var nodes = rootNode.querySelectorAll("[data-style]");
    var i;
    for (i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var key = el.getAttribute("data-style");
      if (!el.hasAttribute("data-style-fallback")) {
        el.setAttribute("data-style-fallback", el.textContent);
      }
      el.textContent = t(key, el.getAttribute("data-style-fallback"));
    }
  }

  function isBerniePath(path) {
    return /\/bernie(\/|$)/i.test(String(path || ""));
  }

  function paint(group) {
    if (!group) return;
    var current = get();
    var buttons = group.querySelectorAll("button");
    var i;
    for (i = 0; i < buttons.length; i++) {
      var on = buttons[i].getAttribute("data-level") === current;
      buttons[i].setAttribute("aria-checked", on ? "true" : "false");
      buttons[i].tabIndex = on ? 0 : -1;
    }
  }

  function mount() {
    if (typeof document === "undefined" || !document.body) return;
    if (document.getElementById("style-level")) return;
    var path = root.location && root.location.pathname;
    if (isBerniePath(path)) return;

    var style = document.createElement("style");
    style.textContent = [
      "#joyce-chrome{position:relative;z-index:30;display:flex;flex-wrap:wrap;align-items:center;",
      "gap:6px 8px;width:100%;max-width:100%;box-sizing:border-box;flex:0 0 auto;",
      "padding:6px 8px 2px;pointer-events:auto}",
      "#joyce-chrome #kid-switch{margin:0;max-width:100%}",
      "#style-level{display:inline-flex;flex:0 1 auto;align-items:stretch;min-width:0;max-width:100%;",
      "border:3px solid #1d4e96;border-radius:999px;background:#fff;overflow:hidden;",
      "box-shadow:0 3px 0 #1d4e96;font-family:\"Trebuchet MS\",\"Segoe UI\",sans-serif}",
      "#style-level button{flex:0 1 auto;min-width:0;min-height:44px;margin:0;padding:4px 12px;",
      "border:0;border-radius:0;background:transparent;color:#16356b;",
      "font:inherit;font-size:14px;font-weight:700;line-height:1.1;letter-spacing:0.01em;",
      "box-shadow:none}",
      "#style-level button + button{border-left:2px solid #1d4e96}",
      "#style-level button[aria-checked=true]{background:#ffe14a}",
      "body:has(#joyce-chrome) .sky > .sun{top:108px}",
      "@media (max-width:412px){#style-level button{font-size:14px;padding:4px 10px}}",
      "@media (max-height:500px){body:has(#joyce-chrome) .sky > .sun{top:8px;width:48px;height:48px}}"
    ].join("");
    document.head.appendChild(style);

    var bar = document.createElement("div");
    bar.id = "joyce-chrome";

    var group = document.createElement("div");
    group.id = "style-level";
    group.setAttribute("role", "radiogroup");
    group.setAttribute("aria-label", "How the page talks");

    var labels = { young: "Young", older: "Older", advanced: "Advanced" };
    LEVELS.forEach(function (level) {
      var button = document.createElement("button");
      button.type = "button";
      button.setAttribute("role", "radio");
      button.setAttribute("data-level", level);
      button.textContent = labels[level];
      button.addEventListener("click", function () {
        set(level);
      });
      group.appendChild(button);
    });
    paint(group);

    var kid = document.getElementById("kid-switch");
    if (kid && kid.parentNode) {
      kid.parentNode.insertBefore(bar, kid);
      bar.appendChild(kid);
    } else {
      document.body.insertBefore(bar, document.body.firstChild);
    }
    bar.appendChild(group);

    root.addEventListener(EVENT, function () {
      paint(group);
      applyDom();
    });
    applyDom();
    emit(get());
  }

  var api = {
    KEY: KEY,
    EVENT: EVENT,
    LEVELS: LEVELS,
    DEFAULT: DEFAULT,
    get: get,
    set: set,
    boost: boost,
    questionLevel: questionLevel,
    practiceReward: practiceReward,
    t: t,
    list: list,
    apply: applyDom,
    isBerniePath: isBerniePath
  };

  root.JoyceStyle = api;

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
    else mount();
  }

  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
