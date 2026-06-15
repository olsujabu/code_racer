## Prompt Information
| Field | Value |
|---|---|
| Prompt given | `olsujabu` |
| Date | 2026/06/15 |
| Executer | Claude 4.8 xD |
| Full prompt | See below |

# CodeRacer

A code-typing speed game for algorithms — *typing.io for algorithms*. Pick an
algorithm and a language, then race to type the real implementation while a
polished, syntax-lit editor gives you live speed and accuracy feedback.

Client-only React + Vite. No backend: the snippet library is bundled, scoring
and highlighting are all client-side, and best scores persist in
`localStorage`.

## Run it

```bash
npm install
npm run dev      # start the dev server (prints a local URL)
npm run build    # type-check + production build into dist/
npm run preview  # serve the production build
```

## How it plays

- **Type real code**, punctuation and all — but indentation is **auto-skipped**.
  Press **Enter** at a line end to drop to the next line; its leading whitespace
  is jumped automatically and never counts toward your score.
- The snippet starts **dimmed in full syntax color** and **lights up** as you
  type each character correctly.
- A wrong key flashes the expected character red and does **not** advance the
  caret — type the right key (or **Backspace**) to continue.
- **WPM** = `(correct characters / 5) / minutes`, live. **Accuracy** counts every
  printable key you press, including ones you later correct.

## Content

Languages: **Python, JavaScript, Java, C++**. Core algorithms (Binary/Linear
Search, Bubble/Insertion/Selection/Quick/Merge Sort) plus an **Advanced** filter
for longer ones (Heap Sort, BFS, DFS, Dijkstra).

## Structure

```
src/
  data/snippets.ts       algorithm x language matrix + filename rules
  lib/tokenizer.ts       hand-rolled syntax tokenizer (no deps)
  lib/typing.ts          cell model, key handling, scoring
  lib/storage.ts         best-WPM persistence
  hooks/useTypingEngine  React binding for the engine + live timer
  components/            SelectorBar, EditorWindow, CodePane, Hud, Controls, ResultsScreen
```

Adding a language (Go, TypeScript, C#, …) or algorithm is just extending the
arrays in `src/data/snippets.ts` (and, for a new language, a keyword/type set in
`src/lib/tokenizer.ts`).

-----------------------------------------------------------------------------------------------------------------
FULL PROMPT : 

Build a **code-typing speed game** where the player picks an **algorithm** and a **language**, then types out the real implementation, getting live speed and accuracy feedback. Think *typing.io for algorithms*. It should feel like typing inside a polished code editor, not a generic web form.
---
## 1. Recommended stack (read this first)
**Client-only React. No backend.** For a typing game the code snippets are a fixed, bundled library and you only compare keystrokes against reference text — nothing runs on a server, so a Node/Express layer adds complexity for zero benefit.
- **Use:** Vite + React (plain JS or TypeScript). All snippets live in a local data file. State, scoring, and highlighting are all client-side. Persist best scores with `localStorage`.
- **Add a backend only if** you later want things that must be shared or survive across devices: a global leaderboard, user accounts, or saved history. Even then, prefer a serverless function or a backend-as-a-service (e.g. Supabase) over standing up a full Node server.
This keeps the project lean and avoids the "typical frontend + backend" shape you don't want.

---
## 2. Core flow
1. Player picks an **algorithm** (e.g. Binary Search) and a **language** (e.g. Python).
2. The editor loads that implementation as the target text.
3. Player types it out; the timer starts on the first keystroke.
4. On finish, show a results panel (WPM, accuracy, time, errors) with replay / next.
---

## 3. The typing mechanic (the important part)
- **Type real code**, including punctuation and symbols — but **auto-skip indentation**. When the player presses Enter, automatically advance past the next line's leading whitespace so they never type spaces/tabs for indentation. (This is what makes code typing bearable; copy typing.io's behavior.)
- **Light-up highlighting (the signature feel):** show the full snippet dimmed with syntax colors at low opacity. As each character is typed correctly, it lights up to full syntax color. The code visibly "illuminates" as you type it.
- **Per-character state:** correct = lit syntax color; incorrect = red background on the expected character; not-yet-typed = dimmed; current position = blinking caret.
- **Backspace** works and un-lights characters. At a line end, require **Enter** to advance (a wrong key there flashes but doesn't move the caret).
- **Auto-skipped whitespace does not count** toward typed characters or WPM — only what the player actually presses.
---

## 4. Content (algorithm × language matrix)
Generate **correct, idiomatic, concise** implementations for each pair. Don't write descriptions — write working code.
- **Languages:** Python, JavaScript, Java, C++. (Structure the data so adding Go / TypeScript / C# later is trivial.)
- **Core algorithms:** Binary Search, Linear Search, Bubble Sort, Insertion Sort, Selection Sort, Quick Sort, Merge Sort.
- **Optional / longer:** Heap Sort, BFS, DFS, Dijkstra's (offer behind an "advanced" filter since they're longer to type).

**Snippet rules:** one function/method per snippet; ~8–20 lines; 4-space indentation normalized; no blank lines; no trailing whitespace; use straight ASCII quotes and apostrophes so everything is typeable on a standard keyboard.

---

## 5. Visual direction
A distinctive code-editor aesthetic, not a generic template.
- Deep editor-dark background; a single warm **amber** accent for the caret, UI highlights, and the WPM number.
- A tasteful syntax palette: distinct colors for keywords, strings, numbers, function names, types, and comments. (Use these as the "lit" colors; the dimmed/untyped state is the same colors at low opacity.)
- **Type:** monospace for the code and all numbers (JetBrains Mono / IBM Plex Mono); a clean sans (Space Grotesk / Inter) for UI labels.
- Keep motion subtle: caret blink, smooth light-up, gentle hover states.

---

## 6. Layout
1. **Selector bar** — algorithm picker (chips or dropdown) + language tabs.
2. **Editor window** — a title bar showing the generated filename (e.g. `binary_search.py`, updates with algorithm + language), a left **gutter with line numbers**, and the code pane with the light-up typing behavior.
3. **HUD** — Speed (wpm), Accuracy (%), Time (s), Progress (%).
4. **Controls** — Restart, Next, and a Random button.

---

## 7. Scoring
- **Timer** starts on the first keystroke.
- **WPM** = `(correct_characters / 5) / minutes_elapsed`, live.
- **Accuracy** = `correct_keystrokes / total_keystrokes`, counting every printable key the player presses (including ones later corrected). Auto-skipped indentation is excluded.
- **Errors** = total − correct keystrokes.
- Track and persist **best WPM per algorithm+language** in `localStorage`.

---

## 8. Results screen
On completion show: the snippet name + language, a large WPM number, and tiles for Accuracy, Time, and Errors. Buttons: **Try again** (same snippet) and **Next**. Pressing Enter advances.

---

## 9. Quality bar
- Responsive down to mobile (tapping the editor raises the keyboard).
- Visible keyboard focus; ignore Ctrl/Cmd/Alt combos and prevent Tab from leaving the editor and Space from scrolling the page.
- Respect `prefers-reduced-motion`.
- No dependencies beyond React, web fonts, and (optionally) a syntax-highlighting lib like Prism — or hand-roll a small tokenizer so highlighting is fully under your control.

---

## 10. Optional extensions
- Difficulty via snippet length; a "marathon" mode that chains several snippets.
- A pace-car ghost to race against a target WPM.
- Global leaderboard — the one feature that justifies a backend; do it with a serverless function or Supabase, not a full server.
-----------------------------------------------------------------------------------------------------------------# code_racer
