# Book Club

A child types a book she has read. A long book can earn 20 stars after she talks about it in the chat. This page does not give a quiz. Copy this folder onto another site and set `window.KIDS_CHAT` before the scripts. Load `chat/chat.js` on the same page so the bubble is there. Do not edit `chat.js`.

The "Tell … in the chat" button clicks `.kc-fab`, the chat bubble.

## Calls

All requests live in `client.js`.

`POST ${functionsUrl}/kid-books` with `token` and `kid`.

- `{ token, kid, action: "lookup", title, author }` → `{ ok, results: [{ work_id, title, author, cover_url, pages, pages_source }] }`. The page shows at most 5 cards. A missing cover gets a placeholder. Pages may be null.
- `{ token, kid, action: "start", work_id }` → `{ ok, status, pages, min_pages, message, book_id }`.
- `{ token, kid, action: "list" }` → `{ ok, books: [{ title, author, pages, status, date, score }] }`. `cover_url` is optional.

`status` from start:

- `check` — show the server `message` when it has one, and a button that opens the chat bubble.
- `too_short` — show the server `message`.
- `already_paid` — "You already got your stars for this book! 🌟" unless the server sent a message.
- `pages_unknown` or `in_progress` — show the server `message`.

The page always prefers `message` when the server sends one.

Shelf labels: `earned` / `paid` → "Earned 20 ⭐", `waiting` → "Waiting for a grown-up", `check` / `in_progress` → "Still checking", `too_short` → "Too short".

Any HTTP 401 means locked: "Ask a grown-up to unlock" and a button that opens the chat bubble. HTTP 404 or a network failure shows "Book Club is waking up...".

## Mock

`?starsmock=1` skips the server. Lookup returns five pretend books, including Dear Zoo (too short) and one book with no cover. Starting Charlotte's Web is the check state.

```javascript
KidBooks.lookup("Charlotte's Web", "E. B. White")
KidBooks.start("cw")
KidBooks.list()
```
