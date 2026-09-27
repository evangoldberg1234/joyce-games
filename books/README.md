# Book Club

A child finds a book she finished, retells it in two or three sentences, and answers a short quiz on this page. A long enough book can earn 20 stars. Copy this folder onto another site and set `window.KIDS_CHAT` before the scripts. All requests live in `client.js`.

There is no chat step in the quiz. A 401 still means the device is locked: the page says to ask a grown-up to open the chat bubble and enter the family code.

## Calls

`POST ${functionsUrl}/kid-books` with `token` and `kid`.

- `lookup` `{ title, author? }` → `{ candidates: [{ work_id, title, author, pages, cover_url, year, eligible }] }`. At most 5 cards. `eligible: false` is below her page minimum (50 unless the server says otherwise). That card is grey, with "This one is a bit short for stars, but reading is always great!", and it cannot be sent.
- `submit` `{ work_id, retelling }` → `{ read_id, status: "awaiting_quiz" }`. The retelling must be 60–1000 characters. HTTP 409 `already_read` shows "You already did this book! 🌟" unless the server sent `message`.
- `status` `{ read_id }` is polled every 5 seconds.
  - `awaiting_quiz` — keep waiting. After about 3 minutes, she can come back from My Bookshelf.
  - `quiz_ready` — `questions: [{ q, choices }]` with 4 choices each. The page asks one at a time. A Hear it button shows when the device has an English voice.
  - `pending_review` — a grown-up needs to check it. Stars come after they say OK.
  - `passed` or `failed` — show that result.
- `answer` `{ read_id, answers: [5 choice indexes] }` → `{ score, passed, balance }`. A pass celebrates +20 stars. A fail is kind and offers one more try (2 attempts total). After the first fail, the page polls `status` again in case a new quiz was made.
- `list` → her books with `status`, `score`, and `date`. `work_id`, `read_id`, and `cover_url` are used when the server sends them. Tapping `awaiting_quiz` or `quiz_ready` resumes that book. `read_id` is also stored in `localStorage` under `books.reads.<kid>`.

Any HTTP 401 is locked. HTTP 404 or a network failure shows "Book Club is waking up...".

## Mock

`?starsmock=1` skips the server.

- Dear Zoo is too short.
- Charlotte's Web can pass (each correct choice is the first one).
- The Boxcar Children fails the first quiz, then can pass on the second.
- Frog and Toad becomes `pending_review`.
- Matilda is `already_read`.
- My Bookshelf includes a passed book, a review, a ready quiz, and one still waiting.

```javascript
KidBooks.lookup("Charlotte's Web", "")
KidBooks.submit("cw", "Wilbur is a pig. Charlotte is a spider who saves him with words in her web.")
KidBooks.status(readId)
KidBooks.answer(readId, [0, 0, 0, 0, 0])
KidBooks.list()
```
