/*
 * ╔══════════════════════════════════════════════════════════════╗
 * ║              p5.js QUICK REFERENCE CARD                     ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * ── DRAWING BASICS ─────────────────────────────────────────────
 *
 *   createCanvas(w, h)        Make a drawing area w wide, h tall
 *   background(color)         Fill the whole canvas with a color
 *   stroke(r, g, b)           Set the outline color (RGB)
 *   strokeWeight(n)           Set outline thickness to n pixels
 *   fill(r, g, b)             Set the fill color
 *   noFill()                  Disable filling shapes
 *   noLoop()                  Stop draw() from repeating
 *
 * ── SHAPES & LINES ─────────────────────────────────────────────
 *
 *   circle(x, y, d)           Draw a circle at (x, y) with diameter d
 *   line(x1, y1, x2, y2)     Draw a line from (x1,y1) to (x2,y2)
 *
 * ── TEXT ────────────────────────────────────────────────────────
 *
 *   text(str, x, y)           Draw text at position (x, y)
 *   textSize(n)               Set the font size
 *   textAlign(h, v)           Set horizontal/vertical alignment
 *
 * ── MATH ───────────────────────────────────────────────────────
 *
 *   map(v, s1, e1, s2, e2)    Map a value from one range to another
 *   cos(angle)                Get horizontal offset from an angle
 *   sin(angle)                Get vertical offset from an angle
 *   TWO_PI                    A full circle in radians (360°)
 *   Math.floor(n)             Round a number down
 *
 * ── DATA STRUCTURES ────────────────────────────────────────────
 *
 *   { key: value }            Object — stores labeled data
 *   [ item1, item2 ]          Array  — stores a list of items
 *   object.key                Dot notation — read a value
 *   array[index]              Bracket notation — read by position
 *   array.length              How many items are in the array
 *
 * ════════════════════════════════════════════════════════════════
 */

// Our updated Object List containing both sleep and social data
let weekData = [
  { "day": "Mon", "hours": 8, "restful": 1, "dreamed": true,  "people": [10, 8, 3] },
  { "day": "Tue", "hours": 6, "restful": 1, "dreamed": false, "people": [2, 2, 1, 5, 4] },
  { "day": "Wed", "hours": 7, "restful": 2, "dreamed": true,  "people": [9] },
  { "day": "Thu", "hours": 5, "restful": 3, "dreamed": false, "people": [] },
  { "day": "Fri", "hours": 9, "restful": 2, "dreamed": true,  "people": [8, 7, 7, 6] },
  { "day": "Sat", "hours": 10,"restful": 2,"dreamed": true,  "people": [10, 9, 8, 8, 7, 2] },
  { "day": "Sun", "hours": 7, "restful": 1, "dreamed": false, "people": [4, 5] }
];

function setup() {
  // Canvas is tall enough to fit sleep rings on top, orbits below, and day labels at the bottom
  createCanvas(800, 430);
  noLoop(); 
  angleMode(RADIANS); // Needed for cos() and sin() to work with TWO_PI
}

function draw() {
  background(240);
  noFill(); 
  
  let sleep_Y = 120;  // Y-coordinate for the sleep rings (top row)
  let social_Y = 280; // Y-coordinate for the social orbits (bottom row)
  
  // Divide the canvas into equal columns, one per day
  let spacing = width / weekData.length;

  for (let i = 0; i < weekData.length; i++) {
    let dayData = weekData[i];
    let center_X = (spacing * i) + (spacing / 2);

    // ==========================================
    // 1. DRAW SLEEP RINGS (Top Row)
    // ==========================================
    let numCircles = Math.floor(dayData.hours); 
    let maxDiameter = spacing * 0.7; // Scale circles to fit within the column
    let minDiameter = 10;
    noFill();
    // Thicker stroke = more restful sleep
    let currentWeight = map(dayData.restful, 1, 3, 1, 5);
    strokeWeight(currentWeight);

    // Blue if dreamed, grey if not
    if (dayData.dreamed === true) {
      stroke("#3100FF"); // Royal Blue
    } else {
      stroke("#9F9DAA"); // Light gray
    }

    // Draw circles from outermost to innermost
    for (let j = 0; j < numCircles; j++) {
      let currentDiameter = maxDiameter;
      if (numCircles > 1) {
        currentDiameter = map(j, 0, numCircles - 1, maxDiameter, minDiameter);
      }
      circle(center_X, sleep_Y, currentDiameter);
    }

    // ==========================================
    // 2. DRAW SOCIAL ORBITS (Bottom Row)
    // ==========================================
    stroke(50);
    strokeWeight(1.5);
    
    // Draw "Self" dot in the center
    fill(50);
    circle(center_X, social_Y, 8); 
    noFill();

    let numPeople = dayData.people.length;

    for (let k = 0; k < numPeople; k++) {
      let closeness = dayData.people[k];
      
      // Spread people evenly around a full circle
      let angle = map(k, 0, numPeople, 0, TWO_PI);
      
      // Closeness is flipped: 10 (very close) = near the center, 1 (stranger) = far out
      let distance = map(closeness, 10, 1, 15, 45); 
      
      // Use trig to convert angle + distance into x, y coordinates
      let person_X = center_X + cos(angle) * distance;
      let person_Y = social_Y + sin(angle) * distance;
      
      // Faint connecting line from self to person
      stroke(200);
      line(center_X, social_Y, person_X, person_Y);
      
      // Draw the person dot
      stroke(50);
      circle(person_X, person_Y, 6);
    }

    // ==========================================
    // 3. DAY LABELS (Bottom)
    // ==========================================
    fill(80);
    noStroke();
    textAlign(CENTER, TOP);
    textSize(12);
    text(dayData.day, center_X, 370);
  }
}
