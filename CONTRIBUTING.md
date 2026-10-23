# Contributing to Rep Rep Rep

Thanks for helping. Fixes to lessons, corrections against the real instruments and new lessons are all welcome.

## Before you start

- For anything bigger than a typo, open an issue first so we can agree on the idea.
- Run the site locally with `npm install` and `npm run dev` (see the README).
- After changing lessons, run `npm run check`. It renders every step and stops at the first broken one.
- Before opening a pull request, run `npm run format`, then `npm test` (see Tests in the README).

## How lessons are written

- One idea per lesson. Each lesson has an intro, Learn steps (the idea, with our own drawings or a playable grid), Play steps (click-by-click on the device) and Check steps (multiple choice).
- Write Play steps as short separate sentences. Each sentence becomes a bullet.
- Each lesson is a YAML file in `src/content/lessons/<instrument>/`. Steps are listed under `steps:` with `id` (written for you, see below), `k` (learn, play or check), `t` (the text), `hl` (keys to light up), `fig` (a drawing's name, or a playable `grid` whose rows give `hits: "1,5,9,13"`), and for Check steps `q` (the options, the right one starting with `!`) and `a` (why). `src/course/schema.js` lists every field.
- Write keys as `[NAME]`, for example `[FUNC]` or `[TRIG 5]`. They render as keycaps.
- Button combinations must match the instrument's official manual. Say which page or section you checked in your pull request.
- Everything lives inside the lessons: no links to videos or other sites. The one exception is songs, which name the artist and link to the original track on Spotify.
- Don't mention future lessons in a lesson's text.
- Keep lesson ids (`w05`, `s01`) unchanged. People's saved progress is stored by them and by step ids.
- Don't write step ids yourself. Add a step without an `id` and run `npm run ids`: it gives each new step an id no step of that lesson has ever had, and records it in `src/content/step-ids.yaml`, the register of every id each lesson has used. Taking a step out moves its id to `retired` there, so it's never given out again. Commit the register with your lesson. `npm run check` (and so every pull request) fails if a step has no id, an id isn't in the register, or an id the main branch has was dropped or reused.
- Never change a step's id, even when you rewrite its text, and never edit the register by hand.
- Steps can be added anywhere, removed or reordered: give a new step a new id. A removed step's ticks are simply ignored.

## What's new

Every change people would notice goes in `src/content/changelog.yaml`, newest release at the top, and the same version goes in `package.json` (the tests check both). The site shows the list on `/whats-new`, the version in the footer, and a dot on the bell in the header (and on the menu knob on phones) for anyone who hasn't opened `/whats-new` since a new version came out.

- `site:` lists changes to the site, one sentence each.
- `lessons:` lists changes to lessons, as `lesson: model-cycles/w08` plus `what:`, one sentence saying what's new for someone who already did the lesson. People who had started that lesson see it as a note on the lesson until they mark it as read.
- A small fix can join the release it will ship with. Use a new minor version (0.3.0 after 0.2.0) for new lessons or features, and a patch version (0.3.1) for fixes.

## Licensing of contributions

The code is under the MIT license ([LICENSE](LICENSE)). The course content is under CC BY-NC-SA 4.0 ([LICENSE-CONTENT.md](LICENSE-CONTENT.md)).

**By opening a pull request, you agree that:**

1. your contribution is your own work, or you have the right to submit it;
2. it is licensed under the same license as the files it changes;
3. you also allow the project owner to use, change and publish your contribution in any way, including on a site that accepts tips or donations, without the NonCommercial restriction.

Point 3 lets the site keep a tip button while the course stays free for everyone.
