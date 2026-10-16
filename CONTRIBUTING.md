# Contributing to Rep Rep Rep

Thanks for helping. Fixes to lessons, corrections against the real instruments and new lessons are all welcome.

## Before you start

- For anything bigger than a typo, open an issue first so we can agree on the idea.
- Run the site locally with `npm install` and `npm run dev` (see the README).
- After changing lessons, run `npm run check`. It renders every step and stops at the first broken one.

## How lessons are written

- One idea per lesson. Each lesson has an intro, Learn steps (the idea, with our own drawings or a playable grid), Play steps (click-by-click on the device) and Check steps (multiple choice).
- Write Play steps as short separate sentences. Each sentence becomes a bullet.
- Write keys as `[NAME]`, for example `[FUNC]` or `[TRIG 5]`. They render as keycaps.
- Button combinations must match the instrument's official manual. Say which page or section you checked in your pull request.
- Everything lives inside the lessons: no links to videos or other sites. The one exception is songs, which name the artist and link to the original track on Spotify.
- Don't mention future lessons in a lesson's text.
- Keep lesson ids (`w05`, `s01`) and the order of existing steps unchanged. People's saved progress is stored by them.

## Licensing of contributions

The code is under the MIT license ([LICENSE](LICENSE)). The course content is under CC BY-NC-SA 4.0 ([LICENSE-CONTENT.md](LICENSE-CONTENT.md)).

**By opening a pull request, you agree that:**

1. your contribution is your own work, or you have the right to submit it;
2. it is licensed under the same license as the files it changes;
3. you also allow the project owner to use, change and publish your contribution in any way, including on a site that accepts tips or donations, without the NonCommercial restriction.

Point 3 lets the site keep a tip button while the course stays free for everyone.
