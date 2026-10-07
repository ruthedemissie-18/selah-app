# Onboarding & validation check

Run on 2026-10-07 against the dev server (npm run dev) in headless Microsoft Edge at 390×844.
A test driver filled in fields, pressed Enter, clicked buttons and reloaded the page the way a person would, using two accounts:

- **Account A** — Psalm Tester, psalms@test.com · book **Psalms** · interest **Prayer & Worship** · struggle **Anxiety & Worry** · location La Mirada, United States
- **Account B** — John Tester, john@test.com · book **John** · interest **Youth Ministry** · no struggles · location skipped

Unit tests (npm test): **22/22 passed** — validateEmail, validatePassword, validateConfirm, validateName, validateCustomTopic, validateLocation, orderChannels, groupCircles, and the account rules (salted hash, duplicates, wrong password, unknown email, change password, delete).

## Browser walkthrough — 45/45 passed

| Check | Expected | Result |
|---|---|---|
| Sign-up: Continue disabled with empty fields | Disabled | Pass |
| Sign-up: name under 2 characters (on blur) | Use at least 2 characters | Pass |
| Sign-up: email without a valid domain (on blur) | Enter a valid email… | Pass |
| Sign-up: password hint shown under the field | Use 8 or more characters. | Pass |
| Sign-up: password under 8 characters (on blur) | Use at least 8 characters | Pass |
| Sign-up: confirm mismatch shows while typing | Passwords don't match | Pass |
| Sign-up: Continue still disabled while invalid | Disabled | Pass |
| Sign-up: Continue enabled once all fields valid | Enabled | Pass |
| Sign-up: Enter submits; button shows "Creating account…" | Creating account… then Location step | Pass |
| Password stored only as salted hash | No plain password in storage | Pass |
| Email trimmed and lowercased | psalms@test.com | Pass |
| Location: City without Country blocks Continue | Disabled + "Enter your country" | Pass |
| Location: City + Country (no State) is valid | Enabled | Pass |
| Book: Continue disabled until a book is picked | Disabled "Pick a book to continue" | Pass |
| Book: Enter does nothing while the book list is open | Still on Book step, list open | Pass |
| Book: picking Psalms enables Continue | Enabled | Pass |
| Interests: button says "Pick at least one" until one is chosen | Disabled "Pick at least one" | Pass |
| Interests: custom topic under 2 characters rejected (Enter) | Use at least 2 characters | Pass |
| Interests: duplicate custom topic rejected | You've already added that topic | Pass |
| Interests: one pick enables Continue | Enabled | Pass |
| Refresh mid-onboarding keeps the step and answers | Struggles step, Anxiety still selected | Pass |
| Back keeps answers already chosen | Prayer & Worship still selected | Pass |
| A · Home greets by first name | Welcome, Psalm | Pass |
| A · Bible Study: local circle near their city first | Local studies near La Mirada | Pass |
| A · Bible Study: "Groups studying Psalms" section | Present, Psalms circles | Pass |
| A · Discussions: first channel is their interest, selected | # Prayer & Worship | Pass |
| A · Profile shows name, location, book and interests | Psalm Tester · La Mirada, United States · Psalms · Prayer & Worship | Pass |
| A · Add a prayer (Enter submits) | Prayer appears in Current | Pass |
| Log out returns to intro, account stays saved | Intro shown, account still stored | Pass |
| Sign-up: duplicate email rejected (any case) | An account with this email already exists. | Pass |
| Location: Skip is allowed | Moves to Book | Pass |
| B · Home greets by first name | Welcome, John | Pass |
| B · Bible Study: "Groups studying John" first (no location given) | Groups studying John | Pass |
| A and B see different Bible Study content | Different first section | Pass |
| B · Discussions: first channel is their interest, selected | # Youth Ministry | Pass |
| B · does not see A's prayers or answers | 0 unanswered · 0 answered; John tags | Pass |
| Edit Profile: same name rule | Save disabled, "Use at least 2 characters" | Pass |
| Edit Profile: at least one interest required | Save disabled, "Pick at least one" | Pass |
| Edit Profile: new book re-orders Bible Study immediately | Groups studying Romans | Pass |
| Edit Profile: new interests re-order Discussions immediately | # Apologetics | Pass |
| Log in: wrong password | That email and password don't match. | Pass |
| Log in: unknown email | We couldn't find an account with that email. | Pass |
| Returning user goes straight to Home | Welcome, Psalm (no onboarding) | Pass |
| A's own data comes back after B used the app | 1 unanswered; Psalms tags | Pass |
| Refresh while signed in stays signed in | Home | Pass |

## Not checked in a browser

| Check | Expected | Result |
|---|---|---|
| Profile photo is kept per account | Each account shows its own photo after switching | Not checked in a browser (needs the file picker) |
| Settings: Change email / Change password / Delete account | Duplicate email rejected; current password verified; account and data removed | Not checked in a browser (covered by the auth unit tests) |
| Struggles answer (Anxiety) has a visible effect | Saved on the account | Not checked in a browser (saved, but no screen shows struggles yet) |
| Local circles near the user in Browse search | Near section first when searching or filtering | Not checked in a browser (Home ordering checked; same function) |
| Real phone / deployed site on Vercel | Same behavior | Not checked in a browser (tested on the dev server at 390px) |
