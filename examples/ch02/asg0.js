// Called on page load to set up the canvas and draw a default vector.
function main() {  
  // Retrieve <canvas> element.
  var canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  // Get the 2D rendering context.
  var ctx = canvas.getContext('2d');

  // Fill the canvas with black.
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Create a default vector v1 with z set to 0.
  var v1 = new Vector3([2.25, 2.25, 0.0]);  // You can change these default values if desired.

  // Draw the default vector in red.
  drawVector(ctx, v1, 'red');
}

/**
 * Draws a vector 'v' in the given color.
 * - Draws a line from the center of the canvas (assumed 400x400) to the point:
 *     (centerX + v.x * 20, centerY - v.y * 20)
 * - Scales by 20 to make vectors of length ≈1 more visible.
 * - Inverts the y-coordinate to convert from the canvas coordinate system (y increases down)
 *   to the standard Cartesian coordinate system (y increases up).
 *
 * @param {CanvasRenderingContext2D} ctx - The 2D drawing context from the canvas.
 * @param {Vector3} v - The vector to be drawn.
 * @param {string} color - The color for the vector (e.g., "red").
 */
function drawVector(ctx, v, color) {
  var centerX = ctx.canvas.width / 2;
  var centerY = ctx.canvas.height / 2;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  // Scale x and y by 20; note the y is inverted.
  ctx.lineTo(centerX + v.elements[0] * 20,
             centerY - v.elements[1] * 20);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
}

/**
 * Reads values from input elements, clears the canvas,
 * creates a Vector3 with the input values (z remains 0),
 * and redraws the vector using the drawVector function.
 */
function handleDrawEvent() {
  var canvas = document.getElementById('example');
  var ctx = canvas.getContext('2d');

  // 1. Clear the canvas by filling it black
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Read inputs for v1
  var xVal  = parseFloat(document.getElementById('xCoord').value);
  var yVal  = parseFloat(document.getElementById('yCoord').value);
  var v1 = new Vector3([xVal, yVal, 0.0]);

  // 3. Read inputs for v2
  var x2Val = parseFloat(document.getElementById('x2Coord').value);
  var y2Val = parseFloat(document.getElementById('y2Coord').value);
  var v2 = new Vector3([x2Val, y2Val, 0.0]);

  // 4. Draw v1 in red
  drawVector(ctx, v1, 'red');

  // 5. Draw v2 in blue
  drawVector(ctx, v2, 'blue');

}

/**
 * Computes the angle (in degrees) between two vectors v1 and v2.
 * @param {Vector3} v1 - The first vector.
 * @param {Vector3} v2 - The second vector.
 * @return {number|null} The angle in degrees, or null if one vector has zero length.
 */
function angleBetween(v1, v2) {
  // Calculate dot product.
  var dotProd = Vector3.dot(v1, v2);
  // Get magnitudes.
  var mag1 = v1.magnitude();
  var mag2 = v2.magnitude();
  
  // Check for zero-length vectors.
  if (mag1 === 0 || mag2 === 0) {
    console.log("Cannot compute angle with zero-length vector.");
    return null;
  }
  
  // Compute cosine of the angle.
  var cosTheta = dotProd / (mag1 * mag2);
  // Clamp cosTheta to the range [-1, 1] to avoid numerical issues.
  cosTheta = Math.max(-1, Math.min(1, cosTheta));
  
  // Calculate angle in radians and convert to degrees.
  var angleRad = Math.acos(cosTheta);
  var angleDeg = angleRad * (180 / Math.PI);
  return angleDeg;
}

/**
 * Computes the area of the triangle formed by vectors v1 and v2.
 * @param {Vector3} v1 - First vector.
 * @param {Vector3} v2 - Second vector.
 * @return {number} The area of the triangle.
 */
function areaTriangle(v1, v2) {
  // Compute the cross product using our static function.
  var crossProduct = Vector3.cross(v1, v2);
  // Get its magnitude (which equals the area of the parallelogram).
  var parallelogramArea = crossProduct.magnitude();
  // The triangle's area is half that.
  return parallelogramArea / 2;
}

function handleDrawOperationEvent() {
  var canvas = document.getElementById('example');
  var ctx = canvas.getContext('2d');

  // Clear the canvas (fill with black).
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Create v1 from inputs.
  var xVal  = parseFloat(document.getElementById('xCoord').value);
  var yVal  = parseFloat(document.getElementById('yCoord').value);
  var v1 = new Vector3([xVal, yVal, 0.0]);

  // Create v2 from inputs.
  var x2Val = parseFloat(document.getElementById('x2Coord').value);
  var y2Val = parseFloat(document.getElementById('y2Coord').value);
  var v2 = new Vector3([x2Val, y2Val, 0.0]);

  // Draw original vectors.
  drawVector(ctx, v1, "red");
  drawVector(ctx, v2, "blue");

  // Get the selected operation.
  var op = document.getElementById('opSelect').value;

  // For add and sub, compute v3 = v1 (+ or -) v2.
  if(op === "add" || op === "sub") {
      // Clone v1 to avoid modifying the original.
      var v3 = new Vector3([v1.elements[0], v1.elements[1], v1.elements[2]]);
      if(op === "add") {
          v3.add(v2);
      } else {  // op === "sub"
          v3.sub(v2);
      }
      // Draw the result in green.
      drawVector(ctx, v3, "green");
  }
  // For mul and div, use a scalar and draw two result vectors.
  else if(op === "mul" || op === "div") {
      // Read scalar value.
      var s = parseFloat(document.getElementById('scalar').value);
      // Clone v1 and v2.
      var v3 = new Vector3([v1.elements[0], v1.elements[1], v1.elements[2]]);
      var v4 = new Vector3([v2.elements[0], v2.elements[1], v2.elements[2]]);
      if(op === "mul") {
          v3.mul(s);
          v4.mul(s);
      } else {  // op === "div"
          v3.div(s);
          v4.div(s);
      }
      // Draw both resulting vectors in green.
      drawVector(ctx, v3, "green");
      drawVector(ctx, v4, "green");
  }
  else if(op === "magnitude") {
    // Compute and print the magnitudes of v1 and v2.
    var mag1 = v1.magnitude();
    var mag2 = v2.magnitude();
    console.log("Magnitude of v1: " + mag1);
    console.log("Magnitude of v2: " + mag2);
    // Optionally, you can draw the original vectors in green to highlight the operation,
    // or simply leave them as they are.
  }
  else if(op === "normalize") {
    // Clone v1 and v2 before normalizing.
    var v1norm = new Vector3([v1.elements[0], v1.elements[1], v1.elements[2]]);
    var v2norm = new Vector3([v2.elements[0], v2.elements[1], v2.elements[2]]);
    v1norm.normalize();
    v2norm.normalize();
    // Print the magnitudes of the normalized vectors (should both be 1).
    // console.log("Magnitude of normalized v1: " + v1norm.magnitude());
    // console.log("Magnitude of normalized v2: " + v2norm.magnitude());
    // Draw the normalized vectors in green.
    drawVector(ctx, v1norm, "green");
    drawVector(ctx, v2norm, "green");
  }
  else if(op === "angle") {
    // Compute the angle between v1 and v2.
    var angle = angleBetween(v1, v2);
    if(angle !== null) {
        console.log("Angle between v1 and v2: " + angle.toFixed(2));
    }
  }
  else if(op === "area") {
    // Compute the area of the triangle.
    var area = areaTriangle(v1, v2);
    console.log("Area of the triangle: " + area.toFixed(2));
    // Optionally, you might decide to draw something to represent the area,
    // but per instructions, simply printing to the console is sufficient.
  }
}



// Call main() when the window is loaded.
window.onload = main;