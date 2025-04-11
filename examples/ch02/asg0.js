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
  var v1 = new Vector3([2.25, 2.25, 0.0]);  

  drawVector(ctx, v1, 'red');
}

/**
 * @param {CanvasRenderingContext2D} ctx - The 2D drawing context from the canvas.
 * @param {Vector3} v - The vector to be drawn.
 * @param {string} color 
 */
function drawVector(ctx, v, color) {
  var centerX = ctx.canvas.width / 2;
  var centerY = ctx.canvas.height / 2;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);

  ctx.lineTo(centerX + v.elements[0] * 20,
             centerY - v.elements[1] * 20);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
}


function handleDrawEvent() {
  var canvas = document.getElementById('example');
  var ctx = canvas.getContext('2d');

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  var xVal  = parseFloat(document.getElementById('xCoord').value);
  var yVal  = parseFloat(document.getElementById('yCoord').value);
  var v1 = new Vector3([xVal, yVal, 0.0]);

  var x2Val = parseFloat(document.getElementById('x2Coord').value);
  var y2Val = parseFloat(document.getElementById('y2Coord').value);
  var v2 = new Vector3([x2Val, y2Val, 0.0]);

  drawVector(ctx, v1, 'red');

  drawVector(ctx, v2, 'blue');

}

/**
 * @param {Vector3} v1 - The first vector.
 * @param {Vector3} v2 - The second vector.
 * @return {number|null} The angle in degrees, or null if one vector has zero length.
 */
function angleBetween(v1, v2) {
  var dotProd = Vector3.dot(v1, v2);
  var mag1 = v1.magnitude();
  var mag2 = v2.magnitude();
  
  if (mag1 === 0 || mag2 === 0) {
    console.log("Cannot compute angle with zero-length vector.");
    return null;
  }
  
  var cosTheta = dotProd / (mag1 * mag2);
  // Clamp cosTheta to the range [-1, 1] to avoid numerical issues.
  cosTheta = Math.max(-1, Math.min(1, cosTheta));
  
  var angleRad = Math.acos(cosTheta);
  var angleDeg = angleRad * (180 / Math.PI);
  return angleDeg;
}

/**
 * @param {Vector3} v1 - First vector.
 * @param {Vector3} v2 - Second vector.
 * @return {number} The area of the triangle.
 */
function areaTriangle(v1, v2) {
  var crossProduct = Vector3.cross(v1, v2);
  var parallelogramArea = crossProduct.magnitude();
  return parallelogramArea / 2;
}

function handleDrawOperationEvent() {
  var canvas = document.getElementById('example');
  var ctx = canvas.getContext('2d');

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  var xVal  = parseFloat(document.getElementById('xCoord').value);
  var yVal  = parseFloat(document.getElementById('yCoord').value);
  var v1 = new Vector3([xVal, yVal, 0.0]);

  var x2Val = parseFloat(document.getElementById('x2Coord').value);
  var y2Val = parseFloat(document.getElementById('y2Coord').value);
  var v2 = new Vector3([x2Val, y2Val, 0.0]);

  drawVector(ctx, v1, "red");
  drawVector(ctx, v2, "blue");

  var op = document.getElementById('opSelect').value;

  if(op === "add" || op === "sub") {
      var v3 = new Vector3([v1.elements[0], v1.elements[1], v1.elements[2]]);
      if(op === "add") {
          v3.add(v2);
      } else {  // op === "sub"
          v3.sub(v2);
      }
      // Draw the result in green.
      drawVector(ctx, v3, "green");
  }
  else if(op === "mul" || op === "div") {
      var s = parseFloat(document.getElementById('scalar').value);
      var v3 = new Vector3([v1.elements[0], v1.elements[1], v1.elements[2]]);
      var v4 = new Vector3([v2.elements[0], v2.elements[1], v2.elements[2]]);
      if(op === "mul") {
          v3.mul(s);
          v4.mul(s);
      } else {  // op === "div"
          v3.div(s);
          v4.div(s);
      }
      drawVector(ctx, v3, "green");
      drawVector(ctx, v4, "green");
  }
  else if(op === "magnitude") {
    var mag1 = v1.magnitude();
    var mag2 = v2.magnitude();
    console.log("Magnitude of v1: " + mag1);
    console.log("Magnitude of v2: " + mag2);
  }
  else if(op === "normalize") {
    // Clone v1 and v2 before normalizing.
    var v1norm = new Vector3([v1.elements[0], v1.elements[1], v1.elements[2]]);
    var v2norm = new Vector3([v2.elements[0], v2.elements[1], v2.elements[2]]);
    v1norm.normalize();
    v2norm.normalize();

    drawVector(ctx, v1norm, "green");
    drawVector(ctx, v2norm, "green");
  }
  else if(op === "angle") {
    var angle = angleBetween(v1, v2);
    if(angle !== null) {
        console.log("Angle between v1 and v2: " + angle.toFixed(2));
    }
  }
  else if(op === "area") {
    var area = areaTriangle(v1, v2);
    console.log("Area of the triangle: " + area.toFixed(2));
  }
}



// Call main() when the window is loaded.
window.onload = main;