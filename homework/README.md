# Homework photo check

A child photographs one worksheet. The page shrinks the picture, sends it to the star server, and lists which problems look right. A wrong problem shows a hint, never an answer. Newly fixed problems can earn stars, up to 10 on one sheet and 20 homework stars in a day.

Copy this `homework/` folder onto another child's site unchanged. It reads `kid` and `functionsUrl` from `window.KIDS_CHAT`. The device token is the one chat stores at `localStorage` key `kidsChat.<kid>.token`.

The page needs a `#starbar` element. Stars fly into it. Load `stars/stars.js` before `client.js`. Network calls go through `KidsStars.postJson`, which sends `token` and `kid`, saves a renewed token, and maps the same errors as the star ledger.

## Call

`POST ${functionsUrl}/kid-homework`

```json
{ "kid": "joyce", "token": "<device token>", "image": "<base64 jpeg>", "sheet_id": "optional" }
```

`image` is raw base64, without a `data:` prefix. The long side is at most 1600 pixels. The JPEG stays under about 1.5MB. The photo is drawn through `createImageBitmap` (or an `Image`) so EXIF rotation is kept.

`sheet_id` is sent only when she taps "Fix it and take a new photo" for the same sheet.

HTTP 200:

- `{ "status": "checked", "sheet_id", "problems": [{ "n", "correct", "hint?" }], "stars_earned", "sheet_stars_total", "sheet_cap": 10, "daily_remaining", "balance", "token?" }`
- `{ "status": "retake", "reason" }`
- `{ "status": "duplicate" }`
- `{ "status": "not_homework" }`

A correct problem shows a green check. A wrong one shows a soft thinking face and its hint. Hints are read aloud. The page never shows an answer.

When stars are earned, they fly into the counter one by one, with a sparkle and a short Web Audio chime, and the counter ticks up. Then the page calls `KidsChat.setStars(balance)` when that hook exists.

Messages:

- `You got 7 right! +7 ⭐` uses the number correct and `stars_earned`.
- Sheet cap: `That's the most stars for one sheet (10) — amazing work!`
- Daily cap: `You've earned all 20 homework stars today! Your answers are still checked.`
- Retake: `I couldn't read that clearly. Try again with good light, the whole page in the picture, and hold still.`
- Duplicate: `I already checked this photo! Fix a problem, then take a new one.`
- Not homework: `Hmm, that doesn't look like a worksheet.`
- Locked matches the rest of the stars: ask a grown-up to unlock stars in the chat bubble.

Errors match `kid-stars`: HTTP 401 `locked`, `bad_token`, and `token_expired` all mean locked. HTTP 403 `no_passcode_yet` or `origin_not_allowed`. HTTP 429 `slow_down` (one retry after `retry_after`) or `daily_cap`. HTTP 503 `not_configured`. HTTP 500 `server_error`. HTTP 413 `too_large` says the photo is too big. A 429 `daily_cap` may still include `problems`, with `stars_earned` 0. Those problems are still shown.

## Mock

Open `homework/index.html?starsmock=1`. Each photo cycles through checked, retake, duplicate, not homework, and the daily cap. Pin one screen with `?hwmock=checked`, `retake`, `duplicate`, `not_homework`, or `cap`. Nothing is uploaded.
