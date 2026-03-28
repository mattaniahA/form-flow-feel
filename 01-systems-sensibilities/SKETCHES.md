# Systems Sensibilities — Sketch Guide

These three p5.js sketches explore the same idea at increasing levels of complexity: **what does it mean to design a system rather than a single image?**

Each sketch uses the same color palette and the same four shapes (circle, square, diamond, ring). The difference is how much control you give to the system versus yourself.

---

## sketch_beginner.js — You decide everything

**The concept: direct control**

Every visual decision is explicit. You choose the background color, the size of the big circle, the color of the square, the size of the accent dot. Nothing is left to chance. The composition is fixed — reload the page and you get exactly the same result.

```
let BIG_COLOR  = '#FFFFFF';
let BIG_SIZE   = 300;
let MID_SIZE   = 160;
```

This is how most people start making things: one decision at a time, full control. It's predictable and easy to reason about. But it only produces one outcome.

**What to notice:**
- Changing a single variable has an immediate, isolated effect.
- The structure is always the same: big circle → square → small circle, stacked in the center.
- There are no surprises.

**The tradeoff:** total control, zero variation. You are the system.

---

## sketch_intermediate.js — You set the rules, randomness decides the result

**The concept: constrained randomness**

You no longer specify what the composition looks like — you specify what it's *allowed* to look like. A `PALETTE` array holds your colors. A `SHAPES` array holds your allowed shapes. The sketch picks from these on each draw.

```
let PALETTE = ['#FFFFFF', '#3D3D8F', '#E85C2B', '#2DB37A'];
let SHAPES  = ['circle', 'square', 'diamond', 'ring'];
```

Click the canvas → a new random composition, still within your rules.

**What to notice:**
- The palette and shape list are the real design decisions. Remove a color or shape and every possible output changes.
- The system can produce combinations you wouldn't have thought of yourself.
- Each click is a fresh draw — nothing is remembered between clicks.

**The tradeoff:** you trade direct control for a space of possibilities. You are the editor, not the author of each image.

---

## sketch_advanced.js — The system scales itself

**The concept: a system that operates at multiple levels**

The grid sketch takes the intermediate approach and runs it across a 4×4 tile grid. Each tile independently draws its own randomly chosen composition — background color, two shapes, two colors — all from the same shared palette and shape list.

```
let TILE_SIZE = 160;
let GRID_COLS = 4;
let GRID_ROWS = 4;
```

Now the system has two levels of structure:
1. **The grid** — a layout rule that repeats a unit across space
2. **The tile** — a composition rule that operates within each unit

Because every tile shares the same rules but draws its own random values, you get visual coherence (the palette and shapes feel unified) alongside variation (no two tiles are identical).

Press any key → new seed → the entire grid redraws at once.

**What to notice:**
- Changing `PALETTE` or `SHAPES` affects every tile simultaneously — one edit, system-wide impact.
- `TILE_SIZE`, `GRID_COLS`, and `GRID_ROWS` let you scale the system up or down without changing any tile logic.
- The `MARGIN` variable creates breathing room inside each tile — a small decision with a visible systemic effect.
- The canvas size is computed (`TILE_SIZE * GRID_COLS`), not hardcoded — the canvas grows and shrinks with the grid.

**The tradeoff:** you give up even more direct control, but gain a system that generates richness you couldn't produce by hand.

---

## The big idea

| Sketch | What you control | What the system controls |
|---|---|---|
| Beginner | Every color, every size | Nothing |
| Intermediate | The palette, the allowed shapes | Which colors and shapes appear |
| Advanced | The palette, shapes, grid dimensions | The full color + composition of a pattern |

Each level up, you are making fewer decisions *about the image* and more decisions *about what kinds of images are possible*. That shift — from designing an artifact to designing a system — is the core idea of generative and systems-based design.

A useful question to sit with: **at what point did you stop being the designer of the image, and start being the designer of the process?**
