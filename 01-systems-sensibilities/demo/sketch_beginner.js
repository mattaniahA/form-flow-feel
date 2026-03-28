// ─── YOUR COMPOSITION ────────────────────────────────────────────────────────
// Each line below is a decision. Change a number and reload — something moves.
// The canvas is 400 pixels wide and 400 pixels tall.
// (0, 0) is the top-left corner. X grows right. Y grows down.

let BACKGROUND   = '#3D3D8F'; // Canvas color

let BIG_COLOR    = '#FFFFFF'; // Large circle color
let BIG_SIZE     = 300;       // Large circle diameter in pixels

let MID_COLOR    = '#E85C2B'; // Square color
let MID_SIZE     = 160;       // Square width and height in pixels

let ACCENT_COLOR = '#2DB37A'; // Small circle color
let ACCENT_SIZE  = 80;        // Small circle diameter in pixels

// ─────────────────────────────────────────────────────────────────────────────

function setup() {
  createCanvas(400, 400);
  noLoop();
}

function draw() {
  background(BACKGROUND);

  // Large circle
  noStroke();
  fill(BIG_COLOR);
  ellipse(200, 200, BIG_SIZE, BIG_SIZE);

  // Square in the middle
  fill(MID_COLOR);
  rectMode(CENTER);
  rect(200, 200, MID_SIZE, MID_SIZE);
  rectMode(CORNER);

  // Small circle on top
  fill(ACCENT_COLOR);
  ellipse(200, 200, ACCENT_SIZE, ACCENT_SIZE);
}


// ─── TRY IT ──────────────────────────────────────────────────────────────────
// Change BACKGROUND to a different color — what mood does it create?
// Make BIG_SIZE smaller than MID_SIZE — what happens?
