// ─── SYSTEM VARIABLES ────────────────────────────────────────────────────────
// Change any of these and reload — the whole composition responds.
// Click anywhere on the canvas to generate a new variation.

let PALETTE = [           // Colors the system draws from — add, remove, or swap freely
  '#FFFFFF',
  '#3D3D8F',
  '#E85C2B',
  '#2DB37A',
];

// Shape types available — remove any to restrict the mix
let SHAPES = ['circle', 'square', 'diamond', 'ring'];

// ─────────────────────────────────────────────────────────────────────────────

function setup() {
  createCanvas(400, 400);
  noLoop(); // Draw once — redraws only happen on click
}

function draw() {
  // Pick three colors, avoiding obvious same-color pairs
  let bgColor = random(PALETTE);

  let fgColor = random(PALETTE);
  if (fgColor === bgColor) {
    fgColor = random(PALETTE);
  }

  let accentColor = random(PALETTE);
  if (accentColor === fgColor) {
    accentColor = random(PALETTE);
  }

  // Pick two shape types — one large, one small
  let bgShape = random(SHAPES);
  let fgShape = random(SHAPES);

  // Fill canvas with background color
  background(bgColor);

  // Center of the canvas
  let cx = 200;
  let cy = 200;

  // Large background shape
  drawShape(bgShape, cx, cy, 300, fgColor);

  // Small foreground shape on top
  drawShape(fgShape, cx, cy, 120, accentColor);
}

function mousePressed() {
  redraw();
}

// ─── SHAPE DISPATCHER ────────────────────────────────────────────────────────

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

// ─── SHAPE HELPERS ───────────────────────────────────────────────────────────

function drawCircle(x, y, size, col) {
  noStroke();
  fill(col);
  ellipse(x, y, size, size);
}

function drawSquare(x, y, size, col) {
  noStroke();
  fill(col);
  rectMode(CENTER);
  rect(x, y, size, size);
  rectMode(CORNER);
}

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

function drawRing(x, y, size, col) {
  noStroke();
  fill(col);

  let dotCount = 8;
  let ringRadius = size * 0.35;
  let dotSize = size * 0.22;

  for (let i = 0; i < dotCount; i++) {
    let angle = (TWO_PI / dotCount) * i;
    let dotX = x + cos(angle) * ringRadius;
    let dotY = y + sin(angle) * ringRadius;
    ellipse(dotX, dotY, dotSize, dotSize);
  }
}

// ─── TRY IT ──────────────────────────────────────────────────────────────────
// Click the canvas to explore new combinations.
// Remove a color from PALETTE — notice how the system adapts.
// Remove a shape from SHAPES — does it feel more restrained?
