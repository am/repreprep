# Rep Rep Rep

Hands-on lessons that teach music production on your own instruments. The Model:Cycles course is ready; MicroFreak and Ableton Live come next.

Built with [Astro](https://astro.build) and hosted on Cloudflare Workers. Every lesson step is its own page, built ahead of time. Progress is saved in the browser, and in a Cloudflare D1 database for people who sign in.

## Run it on your computer

```sh
npm install      # once
npm run dev
```

Open http://localhost:4321. On your own computer the account page offers a **local test account**, so you can try signing in without setting anything up. Local progress lives in `.wrangler/` in this folder.

`npm run preview` builds the site and runs it exactly as Cloudflare will (http://localhost:8787).

## Addresses

| Page | Address |
| --- | --- |
| Start page | `/` |
| Course home | `/model-cycles` |
| A lesson (its intro) | `/model-cycles/lessons/05` |
| A step in a lesson | `/model-cycles/lessons/05/3` |
| A song study | `/model-cycles/songs/looped/2` |
| Panel guide, one control | `/model-cycles/panel/lfo` |
| Machines, shortcuts | `/model-cycles/machines`, `/model-cycles/shortcuts` |
| Sign in, back up progress | `/account` |

## Where things are

- `src/content/lessons/`: the lessons, one YAML file each (`model-cycles/lesson-05.yaml`, `model-cycles/song-01-looped.yaml`). They are an Astro content collection (`src/content.config.ts`): every file is checked against `src/course/schema.js` when the site builds, so a missing or misspelled field stops the build and names the file.
- `src/course/`: the rest of the course. `model-cycles/figures/` (the drawings), `model-cycles/controls.js` (panel drawing and the description of every key and knob), `reference.js` (machines and shortcuts). `shared/` holds the step formatting, the playable grid and the Spotify links. `index.js` lists the instruments and turns lesson files into pages (intro step, address, short name); pages read the lessons through `content.js`, scripts and tests through `files.js`.
- `src/components/`: the page pieces as Astro components. `course/` has the lesson player and its parts, the notes, the course map and the panel guide; `site/` has the header, footer, logo, theme switch and shared blocks (`Band`, `Card`).
- `src/layouts/Base.astro`: the page shell every page uses.
- `src/pages/`: one file per kind of address. `api/` and `auth/` are the only parts that run on the server.
- Browser code: each component carries its own `<script>` (the player, notes, quiz, panel guide, grids). They share `src/client/progress.js` (your progress, saved in the browser and to your account) and `src/client/lesson.js`; `src/client/site.js` runs the header, footer and theme switch on every page, and `audio.js` plays the grids. The theme, saved layout, logo and home page fade stay as small inline scripts because they must run before the page first paints.
- `src/lib/`: sign-in and the database.

After editing lessons, run `npm run check`: it renders every step and stops at the first broken one.

## Tests

- `npm test` runs everything that also runs on every pull request: `npm run check`, the unit tests (`tests/unit`: step text, grids, song links), a build with checks on the built pages (`tests/site`: every step page exists, no broken links, the player and other components as built), the server routes run in Cloudflare's local runtime with an empty local database (`tests/server`: the contact form, refusing writes from other sites, and, in a second build with `SIGN_IN=true`, signing in with the local test account, saving progress, the account download and deleting the account), and the browser tests (`tests/e2e`: moving through a lesson, ticks, notes, quizzes, progress files, theme, the phone menu; `account.spec.mjs` signs in on the sign-in build and checks that progress follows you to another browser, signing out and deleting the account). The browser tests need Chromium once: `npx playwright install chromium`.
- `npm run test:unit` runs only the unit tests, in a second.
- `npm run compare` is for changes that should not change the site, like a cleanup. It builds `main` next to your checkout, compares the HTML of every page (ignoring whitespace layout and other differences a visitor can't see), and compares screenshots of the main pages (desktop and phone, dark and light). Any difference is listed, and the screenshots that differ are saved in `.compare/shots` with the changed pixels in red. `npm run compare <branch or commit>` compares with something other than `main`, and `--no-scripts` or `--no-styles` leave script tags, or styles, out of the HTML comparison (for changes that only move browser code or CSS; the screenshots still compare the result). Besides whole pages, the screenshots cover states reached by clicking: an open lesson picker, an answered quiz, the full-window player, a control's info box, an edited grid, notes being edited, saved progress, the phone menu and the contact form's messages.

Lesson ids (`w05`, `s01`) and step positions are what progress is stored under. Changing a lesson's id, or inserting a step in the middle of a lesson, moves people's ticks.

## Progress and accounts

- Signed out, progress (ticked steps, finished lessons, notes, layout) is kept in the browser.
- Signed in, it's also saved to the account and loads on any device. When you sign in, the newer of the browser's and the account's progress wins.
- Sign-in is with Google or GitHub, so the site never stores passwords. Sessions are a random token in an HttpOnly cookie; the database stores only its hash.
- Sign-in is switched off for now, and `/account` is a "Your progress" page. The switch is `SIGN_IN` in `astro.config.mjs` (an `astro:env` setting, read by the pages, the server and the browser code): change its default to `true`, or build with `SIGN_IN=true`, to bring sign-in back.
- `/account` can download progress as a file and load one, including `progress.json` from the old local version of the course.

## Publish on Cloudflare

1. Put this folder in a GitHub repository.
2. Sign in: `npx wrangler login`.
3. Deploy: `npm run deploy`. The first deploy creates the `repreprep` D1 database; the app creates its tables on first use.
4. The domain: `repreprep.studio` and `www.repreprep.studio` are custom domains in `wrangler.jsonc`, attached on every deploy (the zone must be in the same Cloudflare account). www redirects to the root through a Redirect Rule in the zone (Rules → Redirect Rules → "Redirect from WWW to root").
5. Set up sign-in (either or both):
   - **Google**: in Google Cloud Console create an OAuth client (type "Web application") with redirect URI `https://repreprep.studio/auth/google/callback`.
   - **GitHub**: in GitHub → Settings → Developer settings → OAuth Apps, create an app with callback URL `https://repreprep.studio/auth/github/callback`.
   - Store the keys as secrets: `npx wrangler secret put GOOGLE_CLIENT_ID`, then `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`.
   The account page only shows the providers whose keys are set.

Messages sent from the contact form on `/privacy` are emailed to you and also stored in D1 (kept for a year; `npm run messages` lists the latest). Email needs Email Routing enabled on the repreprep.studio zone, your address verified there as a destination, and that address stored as a secret: `npx wrangler secret put CONTACT_TO`.

Pushes to `main` run the tests and then deploy automatically through GitHub Actions (`.github/workflows/deploy.yml`), and every pull request that passes the tests gets a preview link at `pr-<number>-repreprep.<subdomain>.workers.dev`, posted as a PR comment. The workflow needs a `CLOUDFLARE_API_TOKEN` repository secret (an API token from the "Edit Cloudflare Workers" template, plus Account → D1 → Edit) and a `CLOUDFLARE_ACCOUNT_ID` repository variable. Previews share the production D1 database.

## License and contributing

The code is MIT ([LICENSE](LICENSE)). The lessons, drawings and explanations are CC BY-NC-SA 4.0 ([LICENSE-CONTENT.md](LICENSE-CONTENT.md)). To help, read [CONTRIBUTING.md](CONTRIBUTING.md).
