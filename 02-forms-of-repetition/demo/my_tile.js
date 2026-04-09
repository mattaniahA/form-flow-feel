// ================================================================
//  MY TILE
// ================================================================
//
//  Your job: fill in drawTile() below with your own design.
//
//  Rules:
//    - draw inside the square from (0, 0) to (s, s)
//    - use `s` to size everything — no fixed pixel numbers
//    - (0, 0) is the top-left corner of your tile
//    - (s, s) is the bottom-right corner
//
//  The canvas shows your tile large so you can see what
//  you're drawing. A faint guide marks the boundary and
//  a few useful reference points.
// ================================================================


// ================================================================
//  PUT YOUR TILE HERE
// ================================================================

function drawTile() {
  // Draw something! A few starting ideas:
  //   line(0, 0, s, s);               — diagonal
  //   circle(s/2, s/2, s/2);          — circle in the center
  //   arc(0, 0, s, s, 0, HALF_PI);    — quarter arc in the corner
}


// ================================================================
//  SETTINGS
// ================================================================

const TILE_SIZE    = 300;      // how large the tile appears
const BG_COLOR     = '#f5f5f5';
const STROKE_COLOR = '#1a1a1a';
const STROKE_W     = 2;

// Set to false to hide the reference guide
const SHOW_GUIDE   = true;


// ================================================================
//  ENGINE
//  You don't need to change anything below this line.
// ================================================================

let s;

function setup() {
  let pad = 80;
  createCanvas(TILE_SIZE + pad * 2, TILE_SIZE + pad * 2);
  noLoop();
  s = TILE_SIZE;
}

function draw() {
  background(BG_COLOR);

  let ox = (width  - s) / 2;
  let oy = (height - s) / 2;

  // draw the tile
  push();
    translate(ox, oy);
    stroke(STROKE_COLOR);
    strokeWeight(STROKE_W);
    noFill();
    drawTile();
  pop();

  // draw the reference guide on top so it's always visible
  if (SHOW_GUIDE) {
    drawGuide(ox, oy);
  }
}

function drawGuide(ox, oy) {
  push();
  translate(ox, oy);

  // tile boundary
  noFill();
  stroke(0, 0, 0, 40);
  strokeWeight(1);
  rect(0, 0, s, s);

  // reference points: [x, y, label, alignH, alignV]
  let pts = [
    [0,   0,   '(0, 0)',     LEFT,   TOP   ],
    [s,   0,   '(s, 0)',     RIGHT,  TOP   ],
    [0,   s,   '(0, s)',     LEFT,   BOTTOM],
    [s,   s,   '(s, s)',     RIGHT,  BOTTOM],
    [s/2, 0,   '(s/2, 0)',  CENTER, TOP   ],
    [0,   s/2, '(0, s/2)',  LEFT,   CENTER],
    [s/2, s/2, '(s/2, s/2)', CENTER, CENTER],
  ];

  for (let [px, py, label, ah, av] of pts) {
    // dot
    fill(0, 0, 0, 80);
    noStroke();
    circle(px, py, 5);

    // label
    fill(0, 0, 0, 100);
    textFont('monospace');
    textSize(10);
    textAlign(ah, av);

    let lx = px + (ah === LEFT ? 6 : ah === RIGHT ? -6 : 0);
    let ly = py + (av === TOP ? 6 : av === BOTTOM ? -6 : 0);
    text(label, lx, ly);
  }

  pop();
}

// click or press space to redraw
function mousePressed() { redraw(); }
function keyPressed()    { if (key === ' ') redraw(); }
