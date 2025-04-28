// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;

  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`;


// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`;


let canvas;
let gl;
let a_position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

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

  gl.enable(gl.DEPTH_TEST);
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

  // u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  // if (!u_Size) {
  //   console.log('Failed to get the storage location of u_Size');
  //   return;
  // }

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix){
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix){
    console.log('Failed to get the storage location of u_globalRotateMatrix');
    return;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
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
var g_globalAngle=0;
var g_yellowAngle=0;
var g_magenataAngle=0;
var g_yellowAnimation = false;
var g_MagentaAnimation = false;


function addActionsForHtmlUI(){
  document.getElementById('animationYellowOnButton').onclick= function(){g_yellowAnimation = true;};
  document.getElementById('animationYellowOffButton').onclick= function(){g_yellowAnimation = false;};

  document.getElementById('animationMagentaOnButton').onclick= function(){g_MagentaAnimation = true;};
  document.getElementById('animationMagentaOffButton').onclick= function(){g_MagentaAnimation = false;};

  // document.getElementById('green').onclick = function() {g_selectedColor = [0.0,1.0,0.0,1.0];};
  // document.getElementById('red').onclick = function() {g_selectedColor = [1.0,0.,0.0,1.0];};
  // document.getElementById('clearButton').onclick = function() {
  //   g_shapesList = []; 
  //   renderAllShapes(); 
  // }
  // document.getElementById('recurseButton').onclick = function() {
  //   g_shapesList = []; // Clear current shapes
  //   recurseStructs.generate(
  //       g_shapesList,           
  //       g_slectedType,          
  //       g_selectedColor.slice(),
  //       g_SelectedSize,         
  //       g_segments,             
  //       100                     
  //   );
  //   renderAllShapes();
  // }

  // document.getElementById('pointButton').onclick = function() {g_slectedType=POINT};
  // document.getElementById('triButton').onclick = function() {g_slectedType=TRIANGLE};
  // document.getElementById('circleButton').onclick = function() {g_slectedType=CIRCLE};

  // document.getElementById('redSlide').addEventListener('mouseup', function() {g_selectedColor[0] = this.value/100; });
  document.getElementById('magentaSlide').addEventListener('mousemove', function() {g_magenataAngle = parseFloat(this.value); renderAllShapes(); });
  document.getElementById('yellowSlide').addEventListener('mousemove', function() {g_yellowAngle = parseFloat(this.value); renderAllShapes(); });

  // document.getElementById('sizeSlide').addEventListener('mouseup', function() {g_SelectedSize = parseFloat(this.value); });
  // document.getElementById('segSlide').addEventListener('mouseup', function() {g_segments = parseInt(this.value); });


  document.getElementById('angleSlide').addEventListener('mousemove', function() {g_globalAngle = parseFloat(this.value); renderAllShapes(); });

}

function main() {
  setupWebGL();

  connectVariablesToGLSL();

  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) {if(ev.buttons == 1) {click(ev)}};


  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);


  requestAnimationFrame(tick);
}

var g_startTime=performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

function tick(){
  g_seconds = performance.now()/1000.0 - g_startTime;
  //console.log(g_seconds);

  updateAnimationAngles();
  renderAllShapes();
  requestAnimationFrame(tick);
}

function updateAnimationAngles(){
  if (g_yellowAnimation){
    g_yellowAngle = (45*Math.sin(g_seconds));
  }
  if (g_MagentaAnimation){
    g_magenataAngle = (45*Math.sin(3*g_seconds));
  }
}

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

  var globalRotMat=new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  var body = new Cube();
  body.color = [1.0,0.0,0.0,1.0];
  body.matrix.translate(-.25, -.75, 0.0);
  body.matrix.rotate(-5, 1, 0, 0);
  body.matrix.scale(0.5, .3, .5);
  body.render();

  var yellow = new Cube();
  yellow.color = [1,1,0.0,1];
  yellow.matrix.setTranslate(0, -.5, 0.0);
  yellow.matrix.rotate(-5,1,0,1);

  // if ( g_yellowAnimation){
  //   yellow.matrix.rotate(45*Math.sin(g_seconds),0,0,1);
  // }else{
  //   yellow.matrix.rotate(-g_yellowAngle,0,0,1);
  // }
  yellow.matrix.rotate(-g_yellowAngle,0,0,1);
  // yellow.matrix.rotate(45*Math.sin(g_seconds),0,0,1);
  var yellowCoordinatesMat = new Matrix4(yellow.matrix);
  yellow.matrix.scale(0.25, .7, .5);
  yellow.matrix.translate(-.5, 0.0, 0.0);
  yellow.render();

  var box = new Cube();
  box.color = [1,0,1,1];
  box.matrix = yellowCoordinatesMat;
  box.matrix.translate(0, .65, 0.0);
  box.matrix.rotate(g_magenataAngle,0,0,1);
  box.matrix.scale(.3, .3, .3);
  box.matrix.translate(-.5, 0, -0.001);
  // box.matrix = leftArm.matrix;
  // box.matrix.translate(-.1, .1, 0.0, 0.0);
  // box.matrix.rotate(-30,1,0,0);
  // box.matrix.scale(.2, .4, .2);
  box.render();

  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(1000/duration), "numdot");
}

function sendTextToHTML(text, htmlID){
  var htmlElm = document.getElementById(htmlID);
  if(!htmlElm){
    console.log("Failed to get " + htmlID);
    return;
  }
  htmlElm.innerHTML = text;
}