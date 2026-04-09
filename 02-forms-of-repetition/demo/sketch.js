// ================================================================
//  PUT YOUR TILE HERE
//  Replace the contents of drawTile() with your own design.
//
//  Rules:
//    - draw inside a square from (0,0) to (s, s)
//    - use `s` to size everything — don't use fixed pixel numbers
//    - the engine handles all the positioning and rotation
// ================================================================

function drawTile() {
  // Default: the classic Truchet quarter-arc tile.
  // Two quarter-circles in opposite corners.
  // When rotated randomly across the grid, they form
  // flowing connected curves.
  
  // Replace these two lines with your own mark.
  arc(0, 0, s, s, 0, HALF_PI);
  arc(s, s, s, s, PI, PI + HALF_PI);
}


// ================================================================
//  SETTINGS
//  Adjust these to change how your pattern looks.
// ================================================================

const TILE_SIZE    = 60;        // size of each tile in pixels
const CANVAS_SIZE  = 600;       // canvas width and height in pixels

const BG_COLOR     = '#f5f5f5'; // background / fill color
const STROKE_COLOR = '#1a1a1a'; // line / stroke color
const STROKE_W     = 1.5;       // stroke thickness

// How tiles are rotated as the engine fills the grid:
//   'random'  — each tile picks 0°, 90°, 180°, or 270° at random
//   'none'    — all tiles face the same direction (no rotation)
const ROTATION = 'random';


// ================================================================
//  PATTERN ENGINE
//  You don't need to change anything below this line.
//  The engine reads your drawTile() and tiles it across the canvas.
// ================================================================

let s; // tile size — available inside drawTile()

function setup() {
  createCanvas(CANVAS_SIZE, CANVAS_SIZE);
  noLoop();
  s = TILE_SIZE;
}

function draw() {
  background(BG_COLOR);
  stroke(STROKE_COLOR);
  strokeWeight(STROKE_W);
  noFill();

  let cols = ceil(width  / s);
  let rows = ceil(height / s);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {

      // pick rotation angle: 0, 90, 180, or 270 degrees
      let angle = 0;
      if (ROTATION === 'random') {
        angle = floor(random(4)) * HALF_PI;
      }

      push();
        // 1. move origin to the top-left of this tile's cell
        translate(col * s, row * s);

        // 2. shift to tile center so we rotate around it
        translate(s / 2, s / 2);
        rotate(angle);

        // 3. shift back so (0,0) is the tile's top-left corner
        translate(-s / 2, -s / 2);

        // 4. let your function draw the tile
        drawTile();
      pop();

    }
  }
}

// click to regenerate (useful when ROTATION is 'random')
function mousePressed() {
  redraw();
}
