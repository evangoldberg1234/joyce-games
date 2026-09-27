# Book Club

A child types a book she has read. If it is long enough, she tells the bot about it in the chat, and that chat is the quiz. This page does not ask quiz questions. Copy this folder onto another site and set `window.KIDS_CHAT` before the scripts. Load `chat/chat.js` on the same page so the bubble is there. Do not edit `chat.js`.

The chat button clicks `.kc-fab`.

## Calls

All requests live in `client.js`.

`POST ${functionsUrl}/kid-books` with `token` and `kid`.

- `lookup` `{ title, author? }` → `{ ok, results: [{ work_id, title, author, cover_url, pages, pages_source }] }`. The page shows at most 5 cards, then "None of these". Pages may be null. A missing cover gets a placeholder.
- `start` `{ work_id }` → `{ ok, status, pages, min_pages, message, book_id }`. The page prefers `message` when the server sends one.
  - `check` — "Great reading! Now tell Sofie about your book in the chat 💬", and a button that opens the chat bubble. The server posts the finished-book line into the chat.
  - `too_short` — a kind note, and no stars.
  - `already_paid` — "You already got your stars for this book! 🌟".
  - `pages_unknown` — the same check screen, plus a small note that a grown-up will OK the stars.
  - `in_progress` — "You're already telling Sofie about this book, open the chat!" and the chat button.
- `list` → `{ ok, books: [{ title, author, pages, status, date, score }] }`. Shelf labels: `earned` → "Earned 20 ⭐", `waiting` → "Waiting for a grown-up", `check` → "Telling Sofie", `too_short` → "Too short", `try_again` → "Try again". The bot name comes from `window.KIDS_CHAT`.

Any HTTP 401 is locked: "Ask a grown-up to unlock" and a button that opens the chat bubble. HTTP 404 or a network failure shows "Book Club is waking up...".

## Mock

`?starsmock=1` skips the server. Lookup returns five pretend books. Dear Zoo is too short, the Boxcar Children has no page count, Frog and Toad is already in progress, and Matilda is already paid.

```javascript
KidBooks.lookup("Charlotte's Web", "E. B. White")
KidBooks.start("cw")
KidBooks.list()
```
