////////////////////////////////
/////// SYSTEM VARIABLES ///////
////////////////////////////////

// Change any of these and reload to see the whole system respond.

let TILE_SIZE = 160;      // Width and height of each tile in pixels
let GRID_COLS = 4;        // Number of tile columns across the canvas
let GRID_ROWS = 4;        // Number of tile rows down the canvas

let BG_COLOR = '#FFFFF'; // Canvas background — shows as a thin seam between tiles

let PALETTE = [           // Colors the system draws from — add, remove, or swap freely
  '#FFFFFF',
  '#3D3D8F',
  '#E85C2B',
  '#2DB37A',
];

// Shape types the system can use — remove any to restrict the mix
let SHAPES = [ 'circle', 'square', 'diamond', 'ring'];

let STROKE_WEIGHT = 3;    // Line weight used when drawing outlined shapes
let MARGIN = 14;          // Padding inside each tile before shapes begin (in pixels)

// ─────────────────────────────────


function setup() {
  // Create the canvas sized to fit the full grid
  createCanvas(TILE_SIZE * GRID_COLS, TILE_SIZE * GRID_ROWS);
  noLoop(); // Draw once — redraws only happen on keypress
}

function draw() {
  // Fill the canvas with the background color (visible as grid seams)
  background(BG_COLOR);

  // Loop through every grid position and draw a tile
  for (let col = 0; col < GRID_COLS; col++) {
    for (let row = 0; row < GRID_ROWS; row++) {
      let x = col * TILE_SIZE;
      let y = row * TILE_SIZE;
      drawTile(x, y);
    }
  }
}

function keyPressed() {
  redraw();
}

//////////////////////
//////// TILE ////////
/////////////////////

// Draw one tile at grid position (x, y) with a randomly chosen composition
function drawTile(x, y) {
  // Pick three colors — try to avoid obvious same-color pairs
  let bgColor = random(PALETTE);

  let fgColor = random(PALETTE);
  if (fgColor === bgColor) {
    fgColor = random(PALETTE);
  }

  let accentColor = random(PALETTE);
  if (accentColor === fgColor) {
    accentColor = random(PALETTE);
  }

  // Pick two shape types — one for the large background form, one for the small foreground
  let bgShapeType = random(SHAPES);
  let fgShapeType = random(SHAPES);

  // Center point of the tile
  let cx = x + TILE_SIZE / 2;
  let cy = y + TILE_SIZE / 2;

  // Size of the drawable area inside the tile (respects MARGIN)
  let innerSize = TILE_SIZE - MARGIN * 2;

  // Draw the tile rectangle — inset by 1px on each side so BG_COLOR shows as seam
  noStroke();
  fill(bgColor);
  rect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2);

  // Draw the large background shape (fills most of the inner area)
  drawShape(bgShapeType, cx, cy, innerSize, fgColor);

  // Draw the small foreground shape (centered on top, half the size)
  drawShape(fgShapeType, cx, cy, innerSize * 0.5, accentColor);
}

// ─── SHAPE DISPATCHER ─────────────────────────────────────────────────────────

// Route to the correct shape drawing function based on the type string
function drawShape(shapeType, x, y, size, col) {
  if (shapeType === 'circle') {
    drawCircle(x, y, size, col);
  } else if (shapeType === 'square') {
    drawSquare(x, y, size, col);
  } else if (shapeType === 'diamond') {
    drawDiamond(x, y, size, col);
  } else if (shapeType === 'ring') {
    drawRing(x, y, size, col);
  }
}

// ─── SHAPE HELPERS ────────────────────────────────────────────────────────────

// Draw a filled circle centered at (x, y)
function drawCircle(x, y, size, col) {
  noStroke();
  fill(col);
  ellipse(x, y, size, size);
}

// Draw a filled square centered at (x, y)
function drawSquare(x, y, size, col) {
  noStroke();
  fill(col);
  rectMode(CENTER);
  rect(x, y, size, size);
  rectMode(CORNER); // Reset so other rect() calls aren't affected
}

// Draw a filled diamond (square rotated 45°) centered at (x, y)
function drawDiamond(x, y, size, col) {
  noStroke();
  fill(col);
  push();
  translate(x, y);
  rotate(PI / 4);
  rectMode(CENTER);
  rect(0, 0, size * 0.707, size * 0.707); // 0.707 = 1/√2, keeps tip-to-tip = size
  rectMode(CORNER);
  pop();
}

// Draw eight small circles arranged in a ring, centered at (x, y)
function drawRing(x, y, size, col) {
  noStroke();
  fill(col);

  let dotCount = 8;                   // Number of circles in the ring
  let ringRadius = size * 0.35;       // Distance from center to each circle's center
  let dotSize = size * 0.22;          // Diameter of each small circle

  for (let i = 0; i < dotCount; i++) {
    let angle = (TWO_PI / dotCount) * i;
    let dotX = x + cos(angle) * ringRadius;
    let dotY = y + sin(angle) * ringRadius;
    ellipse(dotX, dotY, dotSize, dotSize);
  }
}
