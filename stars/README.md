# Stars

The star balance lives on the kids-chat server. This file sends the ledger calls and paints `#starbar` when that element is on the page. A daily-cap note is added beside it.

Read `kid` and `functionsUrl` from `window.KIDS_CHAT`. The device token is the one chat stores after the family code, at `localStorage` key `kidsChat.<kid>.token`. It is sent as `token` in the JSON body. `kid` is sent too. The token is what identifies the child. Do not put a passcode or a key in the page.

The chat poll can include `stars`, and the shared chat bubble shows that number. This folder does not edit `chat/chat.js`.

## Calls

`POST ${functionsUrl}/kid-stars`

- `{ token, kid, action: "balance" }` → `{ ok: true, kid, balance, earned_today, daily_cap }`. The cap is 100 stars a day. When `earned_today` has reached `daily_cap`, the page says "You've earned all your stars for today!"
- `{ token, kid, action: "earn", subject, level, qid }` → `{ ok, balance, earned: 1, earned_today }`. `subject` is one of `math`, `verbal`, `english`, `hebrew`, `russian`, `parsha`. `level` is 1–10.
- HTTP 429 `{ error: "slow_down" }` means two earns were less than 2 seconds apart. This client retries that earn once after 2 seconds. If it is still too fast, that answer is not counted and the question continues.
- HTTP 429 `{ error: "daily_cap" }` shows the same daily-cap sentence. Practice keeps going.
- `{ token, kid, action: "spend", reason: "hint", item: "<game id>" }` costs 5 and returns `{ ok: true, balance }`, or HTTP 402 `{ ok: false, error: "not_enough_stars", cost, need, balance, message }`. Show `message` as the server wrote it.
- This client never sends `reason: "game"`. A new game costs 20 stars and is charged only in the chat.
- Any HTTP 401 is locked, whatever the error string says.

`{ token, kid, action: "get_levels" }` → `{ ok, levels: { subject: level } }`.

`{ token, kid, action: "set_levels", levels: { subject: 1..10 } }` saves quest levels. Failures are ignored. The `localStorage` copy stays.

With no token, or on 401, show "Ask a grown-up to unlock stars" and point to the chat bubble. If the endpoint is missing (404) or the network fails, show "Stars are waking up..." and let practice continue without counting. Do not keep an authoritative balance in `localStorage`. A last-seen number may be cached in `sessionStorage` for display only.

## Levels

On a quest or practice page, if this iPad has no saved quest levels and the server does, those server levels are copied into `level-test.<kid>`. If this iPad already has levels, they stay. After a subject finishes, the page calls `set_levels` with the saved levels.

## Mock

`?starsmock=1` keeps an in-memory balance that starts at 20, with `earned_today` and `daily_cap: 100`. It does not call the server. Use it to try earning, a 5-star hint, and the not-enough-stars message.

```javascript
KidsStars.balance()
KidsStars.earn({ subject: "math", level: 5, qid: "math-5-2+3" })
KidsStars.spend({ reason: "hint", item: "animal-puzzle" })
KidsStars.setLevels({ math: 6, parsha: 4 })
KidsStars.syncLevels()
```
