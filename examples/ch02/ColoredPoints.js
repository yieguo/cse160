// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform float u_Size;\n' +
  'void main() {\n' +
  '  gl_Position = a_Position;\n' +
  '  //gl_PointSize = 20.0;\n' +
  '  gl_PointSize = u_Size;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +  // uniform変数
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';

let canvas;
let gl;
let a_position;
let u_FragColor;
let u_Size;

function setupWebGL(){
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
}

function connectVariablesToGLSL(){
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;
const GENERATION_DELAY = 50;
let g_selectedColor = [1.0,1.0,1.0,1.0];
let g_SelectedSize=5;
let g_slectedType=POINT;
let g_segments=10;
var g_shapesList = [];

function addActionsForHtmlUI(){
  document.getElementById('green').onclick = function() {g_selectedColor = [0.0,1.0,0.0,1.0];};
  document.getElementById('red').onclick = function() {g_selectedColor = [1.0,0.,0.0,1.0];};
  document.getElementById('clearButton').onclick = function() {
    g_shapesList = []; 
    renderAllShapes(); 
  }
  document.getElementById('recurseButton').onclick = function() {
    g_shapesList = []; // Clear current shapes
    recurseStructs.generate(
        g_shapesList,           
        g_slectedType,          
        g_selectedColor.slice(),
        g_SelectedSize,         
        g_segments,             
        100                     
    );
    renderAllShapes();
  }

  document.getElementById('pointButton').onclick = function() {g_slectedType=POINT};
  document.getElementById('triButton').onclick = function() {g_slectedType=TRIANGLE};
  document.getElementById('circleButton').onclick = function() {g_slectedType=CIRCLE};

  document.getElementById('redSlide').addEventListener('mouseup', function() {g_selectedColor[0] = this.value/100; });
  document.getElementById('greenSlide').addEventListener('mouseup', function() {g_selectedColor[1] = this.value/100; });
  document.getElementById('blueSlide').addEventListener('mouseup', function() {g_selectedColor[2] = this.value/100; });

  document.getElementById('sizeSlide').addEventListener('mouseup', function() {g_SelectedSize = parseFloat(this.value); });
  document.getElementById('segSlide').addEventListener('mouseup', function() {g_segments = parseInt(this.value); });

}

function main() {
  setupWebGL();

  connectVariablesToGLSL();

  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  // canvas.onmousedown = click;
  // canvas.onmousemove = function(ev) {if(ev.buttons == 1) {click(ev)}};
  canvas.onmousedown = function(ev) {
    // Prevent drawing while recursion is happening
    if (!recurseStructs.generationInProgress) {
        click(ev);
    } else {
        console.log("Generation in progress, click ignored.");
    }
  }
  canvas.onmousemove = function(ev) {
      // Prevent drawing while recursion is happening
      if (ev.buttons === 1 && !recurseStructs.generationInProgress) {
          click(ev);
      }
  }

  // addActionsForHtmlUI();

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

// var g_points = [];  // The array for the position of a mouse press
// var g_colors = [];  // The array to store the color of a point
// var g_sizes = [];

var g_shapesList=[];
function click(ev) {
  let [x,y] = convertCoordinatesEventToGL(ev);

  let point;
  if (g_slectedType==POINT){
    point = new Point();
  } else if(g_slectedType==TRIANGLE){
    point = new Triangle();
  }else{
    point = new Circle(g_segments);
  }
  point.position=[x,y];
  point.color=g_selectedColor.slice();
  point.size=g_SelectedSize;
  g_shapesList.push(point);

  // Store the coordinates to g_points array
  //g_points.push([x,y]);
  
  // Store the coordinates to g_points array
  // g_colors.push(g_selectedColor.slice());

  //g_sizes.push(g_SelectedSize);
  // if (x >= 0.0 && y >= 0.0) {      // First quadrant
  //   g_colors.push([1.0, 0.0, 0.0, 1.0]);  // Red
  // } else if (x < 0.0 && y < 0.0) { // Third quadrant
  //   g_colors.push([0.0, 1.0, 0.0, 1.0]);  // Green
  // } else {                         // Others
  //   g_colors.push([1.0, 1.0, 1.0, 1.0]);  // White
  // }

  renderAllShapes();
}

function convertCoordinatesEventToGL(ev){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x,y]);
}

function renderAllShapes(){
  var startTime = performance.now();

  gl.clear(gl.COLOR_BUFFER_BIT);

  var len = g_shapesList.length;
  for(var i = 0; i <len; i++){
    g_shapesList[i].render();
  }

  var duration = performance.now() - startTime;
  sendTextToHTML("numdot: " + len + " ms: " + Math.floor(duration) + " fps: " + Math.floor(1000/duration), "numdot");
}
function sendTextToHTML(text, htmlID){
  var htmlElm = document.getElementById(htmlID);
  if(!htmlElm){
    console.log("Failed to get " + htmlID);
    return;
  }
  htmlElm.innerHTML = text;
}