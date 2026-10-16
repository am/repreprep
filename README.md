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
| A Modded Cycles lesson | `/model-cycles/mods/acid-bass` |
| Panel guide, one control | `/model-cycles/panel/lfo` |
| Machines, shortcuts | `/model-cycles/machines`, `/model-cycles/shortcuts` |
| Sign in, back up progress | `/account` |

## Where things are

- `src/course/`: the course itself. `model-cycles/lessons/` (one file per unit, plus `songs.js` and `mods.js` for the Modded Cycles custom-firmware lessons), `model-cycles/figures/` (the drawings), `model-cycles/controls.js` (panel drawing and the description of every key and knob), `reference.js` (machines and shortcuts). `shared/` holds the step formatting, the playable grid and the Spotify links.
- `src/course/views.js`: the page markup (player, lesson text, lesson list).
- `src/pages/`: one file per kind of address. `api/` and `auth/` are the only parts that run on the server.
- `src/client/`: the browser script (progress, saving, the quiz, the drum grids).
- `src/lib/`: sign-in and the database.

After editing lessons, run `npm run check`: it renders every step and stops at the first broken one.

Lesson ids (`w05`, `s01`) and step positions are what progress is stored under. Changing a lesson's id, or inserting a step in the middle of a lesson, moves people's ticks.

## Progress and accounts

- Signed out, progress (ticked steps, finished lessons, notes, layout) is kept in the browser.
- Signed in, it's also saved to the account and loads on any device. When you sign in, the newer of the browser's and the account's progress wins.
- Sign-in is with Google or GitHub, so the site never stores passwords. Sessions are a random token in an HttpOnly cookie; the database stores only its hash.
- `/account` can download progress as a file and load one, including `progress.json` from the old local version of the course.

## Publish on Cloudflare

1. Put this folder in a GitHub repository.
2. Sign in: `npx wrangler login`.
3. Deploy: `npm run deploy`. The first deploy creates the `repreprep` D1 database; the app creates its tables on first use.
4. Add the domain: in the Cloudflare dashboard, Workers & Pages → repreprep → Settings → Domains & Routes → add `repreprep.studio`.
5. Set up sign-in (either or both):
   - **Google**: in Google Cloud Console create an OAuth client (type "Web application") with redirect URI `https://repreprep.studio/auth/google/callback`.
   - **GitHub**: in GitHub → Settings → Developer settings → OAuth Apps, create an app with callback URL `https://repreprep.studio/auth/github/callback`.
   - Store the keys as secrets: `npx wrangler secret put GOOGLE_CLIENT_ID`, then `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`.
   The account page only shows the providers whose keys are set.

Pushes to `main` deploy automatically through GitHub Actions (`.github/workflows/deploy.yml`), and every pull request gets a preview link at `pr-<number>-repreprep.<subdomain>.workers.dev`, posted as a PR comment. The workflow needs a `CLOUDFLARE_API_TOKEN` repository secret (an API token from the "Edit Cloudflare Workers" template, plus Account → D1 → Edit) and a `CLOUDFLARE_ACCOUNT_ID` repository variable. Previews share the production D1 database.

## License and contributing

The code is MIT ([LICENSE](LICENSE)). The lessons, drawings and explanations are CC BY-NC-SA 4.0 ([LICENSE-CONTENT.md](LICENSE-CONTENT.md)). To help, read [CONTRIBUTING.md](CONTRIBUTING.md).
