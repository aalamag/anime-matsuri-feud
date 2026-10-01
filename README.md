# Anime Matsuri Family Feud — Sakura & Spirits

Web version of `Anime_Matsuri_Sakura_Spirits_Family_Feud_PLAYABLE.pptx`.
Plain HTML/CSS/JS with no dependencies, no build step, and nothing to install.

## Pages
| URL | What it is |
|---|---|
| `/` | **Host console**: the live stage plus host controls and the answer key |
| `/?view=board` | **Audience screen** for the projector/TV, opened with the *Audience screen* button. No controls. Press **F** for fullscreen. |
| `/admin` | **Organizer admin** (PIN `matsuri2026`): edit questions, the round lineup, multipliers, and Fast Money settings |

The host and audience screens sync through `BroadcastChannel`, so open both in the **same browser on the same computer**
(e.g. the laptop drives a second display). When an audience screen is connected, sound plays there instead of on the host.

## Host controls
- Click a tile or an answer-key item to reveal it, or use keys **1–8**. **X** = strike. **Enter / →** = next. **Ctrl+Z** = undo.
- Rules come from the PPT: a face-off, then the winning team chooses PLAY or PASS (click the team that will play).
  After 3 strikes the other team gets one steal guess. The round points × multiplier go to the winner.
- Fast Money uses 2 players with 20s/25s clocks and a target of 200. Player 1's answers stay hidden while Player 2 plays, and a repeated answer is flagged.
- If the page is refreshed, the game resumes from the saved state.

## Content changes vs. the PPT
| Slot | PPT | Now |
|---|---|---|
| Round 3 (×2) | Anime power you'd want | **Famous anime couple** (new) |
| Round 5 (×3) | Anime that made viewers cry | **Best anime teacher / mentor** (new) |
| Round 6 (special) | Anime world to visit (repeats FM Q5) | **Best female anime character** (new) |
| Fast Money Q2 | Anime weapon | **Popular Pokémon** (new) |

The replaced PPT rounds are still in the admin question bank as alternates. A "Popular Pokémon" main round and
Fast Money versions of couple/teacher/female are in the bank too. Survey point values are samples, like the PPT's.

## Deploy to Vercel (no CLI needed)
1. Push this folder to a GitHub repo.
2. In Vercel: **Add New → Project →** import the repo. Framework preset: **Other**. Leave the build command empty and keep the output directory at the root.
3. `vercel.json` turns on clean URLs, so `/admin` works.

## Run locally
`python -m http.server 8765` in this folder, then open http://127.0.0.1:8765/ (use `admin.html` locally).

## Notes
- The admin PIN is a client-side gate (only a SHA-256 hash is in the source). It is fine for a party game but it is not real security.
- Admin edits are saved in **this browser's** storage and apply when the host clicks **New game**. Use Export/Import JSON to move them to another computer.
