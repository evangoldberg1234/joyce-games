# Stars

The star balance lives on the kids-chat server. This file only sends the ledger calls and paints `#starbar` when that element is on the page.

Read `kid` and `functionsUrl` from `window.KIDS_CHAT`. The device token is the one chat stores after the family code, at `localStorage` key `kidsChat.<kid>.token`. It is sent as `token` in the JSON body. Do not put a passcode or a key in the page.

## Calls

`POST ${functionsUrl}/kid-stars`

- `{ token, action: "balance" }` → `{ ok: true, kid, balance }`
- `{ token, action: "earn", subject, level, qid }` → `{ ok: true, balance, earned: 1 }`. A rate limit is HTTP 429 `{ ok: false, error: "slow_down", balance }`.
- `{ token, action: "spend", reason: "hint", item: "<game id>" }` → `{ ok: true, balance }`, or HTTP 402 `{ ok: false, error: "not_enough_stars", balance, cost }`.
- HTTP 401 `{ ok: false, error: "locked" }` means the token is missing or expired.

A hint costs 5 stars. Asking for a new game costs 20 stars. The host page should tell the child to ask in the chat. This folder does not send that chat message.

With no token, or on 401, show "Ask a grown-up to unlock stars" and point to the chat bubble. If the endpoint is missing (404) or the network fails, show "Stars are waking up..." and let practice continue without counting. Do not keep an authoritative balance in `localStorage`. A last-seen number may be cached in `sessionStorage` for display only.

## Mock

`?starsmock=1` keeps an in-memory balance that starts at 20. It does not call the server. Use it to try earning, a 5-star hint, and the not-enough-stars message.

```javascript
KidsStars.balance()
KidsStars.earn({ subject: "math", level: 5, qid: "math-5-2+3" })
KidsStars.spend({ reason: "hint", item: "animal-puzzle" })
```
