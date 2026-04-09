// ============================================================
// FFF WEEK 2 — STARTER drawTile() FUNCTIONS
// ============================================================
// This file is a reference library, not a complete sketch.
// Each function below corresponds to one of the tiles on the
// p5.js vocabulary slide. They're written so you can read them,
// copy them, and modify them.

// HOW TO USE THIS FILE
// --------------------
// 1. Look through these examples and find one that's close to
//    the tile you drew on paper.
// 2. Copy that function into your sketch (the one we gave
//    you with the grid skeleton).
// 3. Rename it to drawTile() — the skeleton calls a function
//    by exactly that name.
// 4. Modify it until it matches your tile.

// Each function uses a variable called `s` for the tile size.
// In the skeleton, `s` is already defined for you. You don't
// need to set it yourself — just use it inside your function.

// IF YOU GET STUCK
// ----------------
// Pick the simplest one (the diagonal line) and start there.
// Run it. See it work. Then change one number at a time and
// see what happens. There is no wrong answer.
// ============================================================


// ============================================================
// CLOSED SHAPES
// ============================================================

// ------------------------------------------------------------
// CIRCLE
// circle(x, y, diameter)  — x,y is the center; diameter sets the size
// A filled circle in the center of the tile.
// ------------------------------------------------------------
function drawTile_circle() {
  circle(s / 2, s / 2, s / 2);
}


// ------------------------------------------------------------
// TRIANGLE
// triangle(x1, y1, x2, y2, x3, y3)  — three corner points, clockwise
// A large triangle pointing upward, filling most of the tile.
// ------------------------------------------------------------
function drawTile_triangle() {
  triangle(s / 2, 0, 0, s, s, s);
}


// ------------------------------------------------------------
// SQUARE
// square(x, y, size)  — x,y is the top-left corner; size is side length
// A small square offset from center.
// ------------------------------------------------------------
function drawTile_square() {
  square(s / 2, s / 2, s / 2);
}


// ------------------------------------------------------------
// ELLIPSE
// ellipse(x, y, w, h)  — x,y is the center; w and h set width and height
// A wide, flat ellipse in the center.
// ------------------------------------------------------------
function drawTile_ellipse() {
  ellipse(s / 2, s / 2, s * 0.6, s * 0.3);
}


// ============================================================
// LINES
// ============================================================

// ------------------------------------------------------------
// DIAGONAL LINE
// line(x1, y1, x2, y2)  — draws a straight line from (x1,y1) to (x2,y2)
// The simplest possible tile. A single line from the top-left
// corner to the bottom-right corner.
// ------------------------------------------------------------
function drawTile_diagonal() {
  line(0, 0, s, s);
}



// ------------------------------------------------------------
// HORIZONTAL LINE
// line(x1, y1, x2, y2)  — draws a straight line from (x1,y1) to (x2,y2)
// A single horizontal line through the middle of the tile.
// ------------------------------------------------------------
function drawTile_horizontal() {
  line(0, s / 2, s, s / 2);
}


// ------------------------------------------------------------
// VERTICAL LINE
// line(x1, y1, x2, y2)  — draws a straight line from (x1,y1) to (x2,y2)
// A single vertical line, slightly left of center.
// ------------------------------------------------------------
function drawTile_vertical() {
  line(s / 3, 0, s / 3, s);
}


// ============================================================
// DOTS
// ============================================================

// ------------------------------------------------------------
// THREE DOTS IN A DIAGONAL
// circle(x, y, diameter)  — x,y is the center; diameter sets the size
// Three small dots arranged from bottom-left to top-right.
// We use small circles instead of point() so the dots have
// a consistent size regardless of stroke weight.
// ------------------------------------------------------------
function drawTile_three_dots() {
  circle(s / 4, s * 3 / 4, s / 12);
  circle(s / 2, s / 2, s / 12);
  circle(s * 3 / 4, s / 4, s / 12);
}


// ============================================================
// CURVES
// ============================================================

// ------------------------------------------------------------
// TWO QUARTER ARCS (the classic Truchet tile)
// arc(x, y, w, h, start, stop)  — center (x,y), size w×h, start/stop angles in radians
// Two quarter circles in opposite corners. When the engine
// rotates this across the grid, the arcs link up to form
// continuous flowing curves. One of the most visually
// rewarding starting points.
// ------------------------------------------------------------
function drawTile_double_arc() {
  arc(0, 0, s, s, 0, HALF_PI);
  arc(s, s, s, s, PI, PI + HALF_PI);
}


// ------------------------------------------------------------
// S-CURVE
// arc(x, y, w, h, start, stop)  — center (x,y), size w×h, start/stop angles in radians
// Two arcs forming an S shape — one at the top opening down,
// one at the bottom opening up.
// ------------------------------------------------------------
function drawTile_s_curve() {
  arc(s / 2, 0, s, s, HALF_PI, PI);
  arc(s / 2, s, s, s, PI + HALF_PI, 0);
}


// ============================================================
// COMBINATIONS
// ============================================================

// ------------------------------------------------------------
// CIRCLE WITH A LINE THROUGH IT
// circle(x, y, diameter)  — x,y is the center; diameter sets the size
// line(x1, y1, x2, y2)    — draws a straight line from (x1,y1) to (x2,y2)
// A circle in the center crossed by a horizontal line.
// Two primitives combined.
// ------------------------------------------------------------
function drawTile_circle_line() {
  circle(s / 2, s / 2, s / 2);
  line(0, s / 2, s, s / 2);
}


// ------------------------------------------------------------
// TRIANGLE WITH A DOT ABOVE
// triangle(x1, y1, x2, y2, x3, y3)  — three corner points, clockwise
// circle(x, y, diameter)             — x,y is the center; diameter sets the size
// A small narrow triangle with a small dot floating above
// its apex. Asymmetric — looks different in each rotation.
// ------------------------------------------------------------
function drawTile_triangle_dot() {
  triangle(s / 3, s / 2, s / 4, s * 3 / 4, s * 0.42, s * 3 / 4);
  circle(s / 3, s / 4, s / 12);
}


// ------------------------------------------------------------
// ARC HILL WITH CIRCLE BELOW
// arc(x, y, w, h, start, stop)  — center (x,y), size w×h, start/stop angles in radians
// circle(x, y, diameter)         — x,y is the center; diameter sets the size
// A half-circle opening downward (like a hill or dome) with
// a small filled circle sitting beneath it.
// ------------------------------------------------------------
function drawTile_hill_circle() {
  arc(s / 2, s / 2, s, s, PI, TWO_PI);
  circle(s / 2, s * 3 / 4, s / 4);
}


// ------------------------------------------------------------
// TILTED ELLIPSE AND RECTANGLE
// push() / pop()       — save and restore the current transform state
// translate(x, y)      — move the origin to (x,y)
// rotate(angle)        — rotate by angle in radians around the current origin
// ellipse(x, y, w, h)  — center (x,y), width w, height h
// rect(x, y, w, h)     — top-left corner (x,y), width w, height h
// A tilted ellipse next to an upright rectangle. This one
// uses push() and rotate() to tilt just the ellipse, then
// pop() to draw the rectangle without rotation.
// More advanced than the others — read it last if you want.
// ------------------------------------------------------------
function drawTile_tilted_pair() {
  push();
  translate(s / 2, s / 2);
  rotate(PI / 7);
  ellipse(-s / 4, 0, s / 4, s * 0.7);
  pop();
  rect(s / 2, s * 0.07, s / 4, s * 0.65);
}


// ============================================================
// EMPTY TILE
// ============================================================
// Sometimes the right mark is no mark. When the engine places
// these randomly across the grid, they create breathing room
// — pauses in the pattern. An empty function is a legitimate
// answer.
// ------------------------------------------------------------
function drawTile_empty() {
  // intentionally blank
}


// ============================================================
// MORE TO TRY
// ============================================================


// ------------------------------------------------------------
// SINGLE CORNER ARC
// arc(x, y, w, h, start, stop)  — center (x,y), size w×h, start/stop angles in radians
// One quarter-circle in the top-left corner only.
// Much quieter than the double arc. When rotated randomly,
// it scatters curves loosely across the grid.
// ------------------------------------------------------------
function drawTile_corner_arc() {
  arc(0, 0, s, s, 0, HALF_PI);
}


// ------------------------------------------------------------
// CORNER BRACKET (L-shape)
// line(x1, y1, x2, y2)  — draws a straight line from (x1,y1) to (x2,y2)
// Two lines meeting at the top-left corner — like the corner
// of a picture frame. Rotated randomly, the brackets snap
// together to form enclosures and channels.
// ------------------------------------------------------------
function drawTile_bracket() {
  line(0, 0, s / 2, 0);       // horizontal arm
  line(0, 0, 0, s / 2);       // vertical arm
}


// ------------------------------------------------------------
// HALF-FILLED TRIANGLE
// fill(color)              — sets the fill color (0 = black)
// triangle(x1, y1, x2, y2, x3, y3)  — three corner points, clockwise
// noFill()                 — disables fill for subsequent shapes
// A filled right triangle in the lower-left half of the tile.
// When rotated randomly, you get soft checkerboard-like forms.
// When all facing the same direction, you get a solid diagonal
// stripe.
// ------------------------------------------------------------
function drawTile_half_fill() {
  fill(0);
  triangle(0, 0, 0, s, s, s);
  noFill();
}



// ------------------------------------------------------------
// DOT GRID
// circle(x, y, diameter)  — x,y is the center; diameter sets the size
// A 3×3 grid of small dots filling the tile.
// Repetition inside repetition. Try changing the dot size
// (the last argument to circle) or the spacing.
// ------------------------------------------------------------
function drawTile_dot_grid() {
  let gap = s / 4;
  for (let r = 1; r <= 3; r++) {
    for (let c = 1; c <= 3; c++) {
      circle(c * gap, r * gap, s / 14);
    }
  }
}


// ------------------------------------------------------------
// LEAF / LENS
// arc(x, y, w, h, start, stop)  — center (x,y), size w×h, start/stop angles in radians
// Two arcs curving toward each other to form a pointed lens
// shape. The top arc bows up; the bottom arc bows down.
// Rotated at 90° and 270°, the leaf stands upright.
// ------------------------------------------------------------
function drawTile_leaf() {
  arc(s / 2, 0,     s, s, 0,  PI);   // top arc, bowing down
  arc(s / 2, s,     s, s, PI, TWO_PI); // bottom arc, bowing up
}


// ------------------------------------------------------------
// STARBURST
// line(x1, y1, x2, y2)  — draws a straight line from (x1,y1) to (x2,y2)
// Eight short lines radiating from the tile center, evenly
// spaced. Symmetric — the same in every rotation. Vary the
// line length (the 0.4 multiplier) to make it denser or looser.
// ------------------------------------------------------------
function drawTile_starburst() {
  let cx = s / 2, cy = s / 2;
  let r  = s * 0.4;
  for (let i = 0; i < 8; i++) {
    let angle = (TWO_PI / 8) * i;
    line(cx, cy, cx + cos(angle) * r, cy + sin(angle) * r);
  }
}


// ------------------------------------------------------------
// NESTED SQUARES
// rect(x, y, w, h)  — top-left corner (x,y), width w, height h
// Three concentric squares, shrinking toward the center.
// All stroke, no fill — like a bullseye made of rectangles.
// Symmetric, but has more visual weight than the rings version.
// ------------------------------------------------------------
function drawTile_nested_squares() {
  let m1 = s * 0.1;
  let m2 = s * 0.25;
  let m3 = s * 0.38;
  rect(m1, m1, s - m1 * 2, s - m1 * 2);
  rect(m2, m2, s - m2 * 2, s - m2 * 2);
  rect(m3, m3, s - m3 * 2, s - m3 * 2);
}


// ------------------------------------------------------------
// WAVE
// beginShape() / endShape()  — start and end a custom shape
// curveVertex(x, y)          — adds a smooth Catmull-Rom curve point; first and last
//                              are phantom control points that shape the curve's ends
// A smooth S-shaped curve crossing the tile from left edge to
// right edge, passing through the center. The curve is drawn
// with beginShape / curveVertex so it stays smooth.
// Tiled in a row, the waves align into a continuous ribbon.
// ------------------------------------------------------------
function drawTile_wave() {
  noFill();
  beginShape();
  curveVertex(-s * 0.2, s / 2);     // phantom start point
  curveVertex(0,        s / 2);
  curveVertex(s * 0.25, s * 0.2);
  curveVertex(s * 0.5,  s / 2);
  curveVertex(s * 0.75, s * 0.8);
  curveVertex(s,        s / 2);
  curveVertex(s * 1.2,  s / 2);     // phantom end point
  endShape();
}


// ------------------------------------------------------------
// SPIRAL SUGGESTION
// arc(x, y, w, h, start, stop)  — center (x,y), size w×h, start/stop angles in radians
// Three concentric quarter-arcs, each slightly larger than
// the last, stepping around the center. Not a true spiral —
// more of a suggestion of one. Asymmetric, so rotation
// visibly changes the feel of the tile.
// ------------------------------------------------------------
function drawTile_spiral() {
  arc(s * 0.5, s * 0.5, s * 0.25, s * 0.25, PI,       PI + HALF_PI);
  arc(s * 0.5, s * 0.5, s * 0.55, s * 0.55, HALF_PI,  PI);
  arc(s * 0.5, s * 0.5, s * 0.85, s * 0.85, 0,        HALF_PI);
}


// ------------------------------------------------------------
// TWO PARALLEL LINES
// line(x1, y1, x2, y2)  — draws a straight line from (x1,y1) to (x2,y2)
// A pair of horizontal lines running across the tile, sitting
// above and below center. They tile seamlessly end-to-end.
// Rotated 90°, they become vertical stripes.
// ------------------------------------------------------------
function drawTile_parallel_lines() {
  line(0, s * 0.35, s, s * 0.35);
  line(0, s * 0.65, s, s * 0.65);
}


// ------------------------------------------------------------
// STEP
// line(x1, y1, x2, y2)  — draws a straight line from (x1,y1) to (x2,y2)
// A right-angle polyline that steps from the left edge to the
// bottom edge — like one stair. When you tile it and rotate,
// the steps lock together into zigzag staircases and maze-like
// channels.
// ------------------------------------------------------------
function drawTile_step() {
  line(0,     s / 2, s / 2, s / 2);  // horizontal segment
  line(s / 2, s / 2, s / 2, s);      // vertical segment
}


// ============================================================
// MIXING AND MATCHING
// ============================================================
//
// You're not limited to one of these. You can take pieces
// from two or three and combine them. A drawTile() function
// can have as many lines inside it as you want — the rule is
// just "draw something inside a square of size s."
//
// Some combinations to try:
//   - a circle AND a small dot in the middle
//   - a diagonal line AND a small triangle
//   - two arcs from different examples
//   - any of the above with different stroke weights or colors
// ============================================================


// ============================================================
// A NOTE ON COORDINATES
// ============================================================
//
// Inside any drawTile() function, the coordinate system goes
// from (0, 0) at the top-left of the tile to (s, s) at the
// bottom-right. Think of it as drawing inside a small square
// where the top-left corner is always (0, 0) and the size is
// always `s`.
//
// Useful reference points:
//   (0, 0)         top-left corner
//   (s, 0)         top-right corner
//   (0, s)         bottom-left corner
//   (s, s)         bottom-right corner
//   (s/2, s/2)     center of the tile
//   (s/2, 0)       middle of the top edge
//   (s, s/2)       middle of the right edge
//
// Once you know these six points, you can describe almost any
// mark you might draw on grid paper.
