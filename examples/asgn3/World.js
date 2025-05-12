var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;

  void main() {
    gl_Position = u_ProjectionMatrix* u_ViewMatrix* u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`


var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform int u_whichTexture;
  void main() {
    if(u_whichTexture == -2){
      gl_FragColor = u_FragColor;
    }
    else if (u_whichTexture == -1){
      gl_FragColor = vec4(v_UV, 0.0, 1.0);
    }
    else if (u_whichTexture == 0){
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    }
    else if (u_whichTexture == 1){
      gl_FragColor = texture2D(u_Sampler1, v_UV);
    }
    else {
      gl_FragColor = vec4(1,.2,.2,1);
    }
  }`;


let canvas;
let gl;
let a_position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_Sampler1;
let u_whichTexture;

let g_camera;


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

  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix){
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix){
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix){
    console.log('Failed to get the storage location of u_globalRotateMatrix');
    return;
  }

  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix){
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return false;
  }

  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1'); // << NEW
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return false;
  }

  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return false;
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

  document.getElementById('magentaSlide').addEventListener('mousemove', function() {g_magenataAngle = parseFloat(this.value); renderAllShapes(); });
  document.getElementById('yellowSlide').addEventListener('mousemove', function() {g_yellowAngle = parseFloat(this.value); renderAllShapes(); });


  document.getElementById('angleSlide').addEventListener('mousemove', function() {g_globalAngle = parseFloat(this.value); renderAllShapes(); });

}

function initTextures() {
  var skyImage = new Image();
  if (!skyImage) {
    console.log('Failed to create the sky image object');
    return false;
  }
  skyImage.onload = function(){ sendImageToTEXTURE0(skyImage); };
  skyImage.src = 'sky.jpg';

  var dirtImage = new Image();
  if (!dirtImage) {
    console.log('Failed to create the dirt image object');
    return false;
  }
  dirtImage.onload = function(){ sendImageToTEXTURE1(dirtImage); };
  dirtImage.src = 'dirt.jpg';

  return true;
}

function sendImageToTEXTURE0(image) {
  // Create a texture object
  var texture = gl.createTexture(); 
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }  

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);// Flip the image's y-axis
  // Make the texture unit active
  gl.activeTexture(gl.TEXTURE0);

  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);   

  // Set texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the image to texture
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // gl.uniform1i(u_Sampler, texUnit);   // Pass the texure unit to u_Sampler
  
  gl.uniform1i(u_Sampler0, 0);

  console.log('finished loadTexture');
}

function sendImageToTEXTURE1(image) { // For dirt.jpg
  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create the texture object for dirt');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  gl.uniform1i(u_Sampler1, 1);

  console.log('finished loadTexture for dirt.jpg on TEXTURE1');
}

function main() {
  setupWebGL();

  connectVariablesToGLSL();

  addActionsForHtmlUI();

  g_camera = new Camera(G_MAP_WIDTH, G_MAP_DEPTH);

  document.onkeydown = keydown;

  initTextures();

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

function keydown(ev){
  switch(ev.keyCode) {
    case 87: // W key
      g_camera.moveForward();
      break;
    case 83: // S key
      g_camera.moveBackward();
      break;
    case 65: // A key
      g_camera.moveLeft();
      break;
    case 68: // D key
      g_camera.moveRight();
      break;
    case 81: // Q key
      g_camera.panLeft();
      break;
    case 69: // E key
      g_camera.panRight();
      break;
    default:
      console.log("Unhandled key press: " + ev.keyCode);
      return;
  }
  renderAllShapes();
}


const G_MAP_WIDTH = 32;
const G_MAP_DEPTH = 32;
const MAX_WALL_HEIGHT = 4;

let g_map = [];
for (let z = 0; z < G_MAP_DEPTH; z++) {
  g_map[z] = [];
  for (let x = 0; x < G_MAP_WIDTH; x++) {
    if (x === 0 || x === G_MAP_WIDTH - 1 || z === 0 || z === G_MAP_DEPTH - 1) {
      g_map[z][x] = 2;
    } else {
      if (x > 5 && x < G_MAP_WIDTH - 5 && z > 5 && z < G_MAP_DEPTH - 5) {
        if (Math.random() < 0.05) { // 5% chance of a random wall
          g_map[z][x] = Math.floor(Math.random() * MAX_WALL_HEIGHT) + 1;
        } else {
          g_map[z][x] = 0;
        }
      } else {
        g_map[z][x] = 0;
      }
    }
  }
}

function renderAllShapes(){
  var startTime = performance.now();

  var projMat = new Matrix4();
  projMat.setPerspective(60, canvas.width/canvas.height, 0.1, 1000);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  var viewMat = new Matrix4();
  viewMat.setLookAt(
    g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2],
    g_camera.at.elements[0], g_camera.at.elements[1], g_camera.at.elements[2],
    g_camera.up.elements[0], g_camera.up.elements[1], g_camera.up.elements[2]
  );
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const groundColor = [0.2, 0.6, 0.2, 1.0];
  const wallColor = [0.6, 0.4, 0.2, 1.0];
  const skyColor = [0.5, 0.7, 1.0, 1.0];

  var sky = new Cube();
  sky.color = skyColor;
  sky.textureNum = 0;  //the texture
  sky.matrix.setScale(300, 300, 300);
  sky.matrix.translate(-0.5, -0.5, -0.5);
  sky.render();

  var ground = new Cube();
  ground.color = groundColor;
  ground.textureNum = -2;

  const GROUND_PLANE_WIDTH = 50;
  const GROUND_PLANE_DEPTH = 50;
  const groundThickness = 0.1;

  let groundModelMatrix = new Matrix4();
  groundModelMatrix.setTranslate(
    (G_MAP_WIDTH / 2 - 0.5) - (GROUND_PLANE_WIDTH / 2),
    -groundThickness,
    (G_MAP_DEPTH / 2 - 0.5) - (GROUND_PLANE_DEPTH / 2)
  );
  groundModelMatrix.scale(GROUND_PLANE_WIDTH, groundThickness, GROUND_PLANE_DEPTH);
  ground.matrix = groundModelMatrix;
  ground.render();

  for (let z = 0; z < G_MAP_DEPTH; z++) {
    for (let x = 0; x < G_MAP_WIDTH; x++) {
      let wallHeight = g_map[z][x];
      if (wallHeight > 0) {
        for (let y_level = 0; y_level < wallHeight; y_level++) {
          var wall = new Cube();
          wall.color = wallColor;
          wall.textureNum = 1;  //need to change to 1
          wall.matrix.setTranslate(x, y_level, z);
          wall.render();
        }
      }
    }
  }

  var duration = performance.now() - startTime;
  sendTextToHTML("ms: " + Math.floor(duration) + " fps: " + Math.floor(1000/duration), "numdot");
}

function sendTextToHTML(text, htmlID){
  var htmlElm = document.getElementById(htmlID);
  if(!htmlElm){
    console.log("Failed to get " + htmlID);
    return;
  }
  htmlElm.innerHTML = text;
}
