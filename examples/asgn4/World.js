var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;

  attribute vec3 a_Normal;
  varying vec3 v_Normal;
  varying vec4 v_VertPos_World;

  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  uniform mat4 u_NormalMatrix;   // Changed to mat4

  void main() {
    v_VertPos_World = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * v_VertPos_World;
    v_UV = a_UV;
    v_Normal = normalize(mat3(u_NormalMatrix) * a_Normal); // Cast to mat3 here
  }`;


var FSHADER_SOURCE = `
  precision mediump float;

  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos_World;

  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform int u_whichTexture;
  uniform int u_NormalVisualization;

  uniform vec3 u_LightPos;
  uniform vec3 u_CameraPos;
  uniform vec3 u_LightColor;
  uniform bool u_LightingOn;

  // Spotlight Uniforms
  uniform vec3 u_SpotDirection;
  uniform float u_SpotCutoffCos;
  uniform float u_SpotExponent;
  uniform bool u_SpotlightActive;

  void main() {
    if (u_NormalVisualization == 1) {
      gl_FragColor = vec4((v_Normal + 1.0) / 2.0, 1.0);
    } else {
      vec4 materialBaseColor;
       if(u_whichTexture == -2){
        materialBaseColor = u_FragColor;
      } else if (u_whichTexture == -1){
        materialBaseColor = vec4(v_UV, 0.0, 1.0);
      } else if (u_whichTexture == 0){
        materialBaseColor = texture2D(u_Sampler0, v_UV);
      } else if (u_whichTexture == 1){
        materialBaseColor = texture2D(u_Sampler1, v_UV);
      } else {
        materialBaseColor = vec4(1.0, 0.2, 0.2, 1.0);
      }

      if (u_LightingOn) {
        vec3 normal = normalize(v_Normal);
        vec3 worldPos = v_VertPos_World.xyz;
        vec3 lightDir = normalize(u_LightPos - worldPos); // From fragment TO light
        vec3 viewDir = normalize(u_CameraPos - worldPos);

        float spotEffect = 1.0; // Default to 1.0 (omni-directional)

        if (u_SpotlightActive) {
          vec3 lightToFragDir = normalize(worldPos - u_LightPos);
          float lightToFragDotSpotDir = dot(lightToFragDir, normalize(u_SpotDirection));

          if (lightToFragDotSpotDir > u_SpotCutoffCos) {
            spotEffect = pow(lightToFragDotSpotDir, u_SpotExponent);
          } else {
            spotEffect = 0.0;
          }
          spotEffect = max(spotEffect, 0.0);
        }

        float ambientStrength = 0.2;
        vec3 ambient = ambientStrength * u_LightColor * materialBaseColor.rgb;

        float diff = max(dot(normal, lightDir), 0.0);
        vec3 diffuse = diff * u_LightColor * materialBaseColor.rgb * spotEffect;

        float specularStrength = 0.8;
        float shininess = 32.0;
        vec3 reflectDir = reflect(-lightDir, normal);
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
        vec3 specular = specularStrength * spec * u_LightColor * spotEffect;

        vec3 finalColor = ambient + diffuse + specular;
        gl_FragColor = vec4(finalColor, materialBaseColor.a);

      } else {
        gl_FragColor = materialBaseColor;
      }
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

let u_NormalVisualization;
let g_normalVisualizationActive = false;

let g_lightPos = new Vector3([2, 2, -1]);
let u_LightPos;

let u_NormalMatrix;

let u_CameraPos;

let g_lightColor = [1.0, 1.0, 1.0];
let u_LightColor;



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

  a_Normal = gl. getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal<0) {
    console.log('Failed to get the storage location of a_Normal');
    return false;
  }

  u_NormalVisualization = gl.getUniformLocation(gl.program, 'u_NormalVisualization');
  if (!u_NormalVisualization) {
    console.log('Failed to get the storage location of u_NormalVisualization');
    return false;
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

  u_LightPos = gl.getUniformLocation(gl.program, 'u_LightPos');
  if (!u_LightPos) {
    console.log('Failed to get the storage location of u_LightPos');
    return false;
  }

  u_CameraPos = gl.getUniformLocation(gl.program, 'u_CameraPos');
  if(!u_CameraPos){
    console.log('Failed to get the storage location of u_CameraPos');
    return false;
  }

  u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  if (!u_NormalMatrix) {
    console.log('Failed to get the storage location of u_NormalMatrix');
    return false;
  }

  u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
  if (!u_LightColor) {
    console.log('Failed to get the storage location of u_LightColor');
    return false;
  }

  u_LightingOn = gl.getUniformLocation(gl.program, 'u_LightingOn');
  if (!u_LightingOn) {
    console.log('Failed to get the storage location of u_LightingOn');
    return false;
  }

  u_SpotlightActive = gl.getUniformLocation(gl.program, 'u_SpotlightActive');
  if (!u_SpotlightActive) {
    console.log('Failed to get the storage location of u_SpotlightActive');
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

let g_isDragging = false;
let g_lastMouseX = -1;
let g_lastMouseY = -1;

let g_lightAngle = 0;
let g_lightSliderX = g_lightPos.elements[0];

let g_lightingOn = true;
let u_LightingOn;

let g_spotlightActive = false;
let u_SpotlightActive;

let g_spotDirection = new Vector3([0, -1, 0]);
let g_spotCutoffAngle = 30.0;
let g_spotExponent = 10.0;

let u_SpotDirection;
let u_SpotCutoffCos;
let u_SpotExponent;


function addActionsForHtmlUI(){
  document.getElementById('normalOn').onclick = function() {
    g_normalVisualizationActive = true;
    renderAllShapes();
  };
  document.getElementById('normalOff').onclick = function() {
    g_normalVisualizationActive = false;
    renderAllShapes();
  };

  document.getElementById('angleSlide').addEventListener('mousemove', function() {g_globalAngle = parseFloat(this.value); renderAllShapes(); });

  document.getElementById('lightSliderX').addEventListener('input', function() {
    g_lightSliderX = parseFloat(this.value);
    g_lightPos.elements[0] = g_lightSliderX;
    // renderAllShapes();  // good for immediate feedback if tick rate is low.
  });

  document.getElementById('lightSliderX').value = g_lightSliderX;

  document.getElementById('lightColorR').addEventListener('input', function() {
    g_lightColor[0] = parseFloat(this.value);
  });
  document.getElementById('lightColorG').addEventListener('input', function() {
    g_lightColor[1] = parseFloat(this.value);
  });
  document.getElementById('lightColorB').addEventListener('input', function() {
    g_lightColor[2] = parseFloat(this.value);
  });

  document.getElementById('lightingOnButton').onclick = function() {
    g_lightingOn = true;
    // renderAllShapes(); // here for immediate effect
  };
  document.getElementById('lightingOffButton').onclick = function() {
    g_lightingOn = false;
    // renderAllShapes();
  };

  document.getElementById('spotlightOnButton').onclick = function() {
    g_spotlightActive = true;
  };
  document.getElementById('spotlightOffButton').onclick = function() {
    g_spotlightActive = false;
  };

  canvas.onmousedown = function(ev) {
    let x = ev.clientX, y = ev.clientY;
    let rect = ev.target.getBoundingClientRect();
    if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
      g_lastMouseX = x;
      g_lastMouseY = y;
      g_isDragging = true;
    }
  };

  canvas.onmouseup = function(ev) {
    g_isDragging = false;
  };

  canvas.onmouseleave = function(ev) {
    g_isDragging = false;
  };

  canvas.onmousemove = function(ev) {
    if (g_isDragging) {
      let x = ev.clientX;
      let y = ev.clientY;

      let deltaX = x - g_lastMouseX;
      let deltaY = y - g_lastMouseY;

      g_lastMouseX = x;
      g_lastMouseY = y;

      if (g_camera) {
        g_camera.pan(-deltaX * g_camera.mouseSensitivity);
        g_camera.tilt(-deltaY * g_camera.mouseSensitivity);

        renderAllShapes();
      }
    }
  };

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

  const G_MAP_WIDTH = 32;
  const G_MAP_DEPTH = 32;
  g_camera = new Camera(G_MAP_WIDTH, G_MAP_DEPTH);

  addActionsForHtmlUI();

  document.onkeydown = keydown;

  initTextures();

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);


  requestAnimationFrame(tick);
}

var g_startTime=performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

function tick(){
  g_seconds = performance.now() / 1000.0 - g_startTime;

  updateAnimationAngles();

  const animationSpeed = 0.5;
  g_lightAngle += animationSpeed * (g_seconds - (performance.now() / 1000.0 - g_startTime));

  const lightAnimationSpeedFactor = 30; // Degrees per second
  g_lightAngle = g_seconds * lightAnimationSpeedFactor;

  g_lightPos.elements[0] = g_lightSliderX;
  g_lightPos.elements[1] = 1.5 + Math.sin(g_lightAngle * Math.PI / 180) * 1.0;
  g_lightPos.elements[2] = 0 + Math.cos(g_lightAngle * Math.PI / 180) * 2.5;


  let lightXValueSpan = document.getElementById('lightXValue');
  if (lightXValueSpan) {
      lightXValueSpan.textContent = g_lightSliderX.toFixed(1);
  }


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



const groundColor = [0.2, 0.6, 0.2, 1.0];
const wallColor = [0.6, 0.4, 0.2, 1.0];
const skyColor = [0.5, 0.7, 1.0, 1.0];
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

  // --- Pass Light and Camera Positions to Shaders ---
  gl.uniform3f(u_LightPos, g_lightPos.elements[0], g_lightPos.elements[1], g_lightPos.elements[2]);
  gl.uniform3f(u_CameraPos, g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2]);
  gl.uniform3f(u_LightColor, g_lightColor[0], g_lightColor[1], g_lightColor[2]);
  gl.uniform1i(u_LightingOn, g_lightingOn ? 1 : 0);

  // Spotlight Uniforms
  let spotDirNormalized = new Vector3(g_spotDirection.elements).normalize();
  gl.uniform3f(u_SpotDirection, spotDirNormalized.elements[0], spotDirNormalized.elements[1], spotDirNormalized.elements[2]);
  let cutoffRadians = g_spotCutoffAngle * Math.PI / 180.0;
  gl.uniform1f(u_SpotCutoffCos, Math.cos(cutoffRadians));
  gl.uniform1f(u_SpotExponent, g_spotExponent);
  gl.uniform1i(u_SpotlightActive, g_spotlightActive ? 1 : 0);

  gl.uniform1i(u_NormalVisualization, g_normalVisualizationActive ? 1 : 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  function setNormalMatrix(modelMatrix, globalRotationMatrix) {
      let normalMatrix = new Matrix4();
      normalMatrix.setInverseOf(new Matrix4(globalRotationMatrix).multiply(modelMatrix));
      normalMatrix.transpose();
      gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  }

  var lightCube = new Cube();
  lightCube.color = [1,1,0,1];
  lightCube.textureNum = -2;
  lightCube.matrix.setTranslate(g_lightPos.elements[0], g_lightPos.elements[1], g_lightPos.elements[2]);
  lightCube.matrix.scale(0.1, 0.1, 0.1);
  setNormalMatrix(lightCube.matrix, globalRotMat);
  lightCube.render();


  var sky = new Cube();
  sky.color = skyColor;
  sky.textureNum = 0;
  sky.matrix.setScale(-300, -300, -300);  
  sky.matrix.translate(-0.5, -0.5, -0.5);
  setNormalMatrix(sky.matrix, globalRotMat);
  sky.render();

  var ground = new Cube();
  ground.color = groundColor;
  ground.textureNum = -2;

  const GROUND_PLANE_WIDTH = 50;
  const GROUND_PLANE_DEPTH = 50;
  const groundThickness = 0.1;

  let groundModelMatrix = new Matrix4();
  groundModelMatrix.setTranslate(
    (32 / 2 - 0.5) - (GROUND_PLANE_WIDTH / 2),
    -groundThickness,
    (32 / 2 - 0.5) - (GROUND_PLANE_DEPTH / 2)
  );
  groundModelMatrix.scale(GROUND_PLANE_WIDTH, groundThickness, GROUND_PLANE_DEPTH);
  ground.matrix = groundModelMatrix;
  setNormalMatrix(ground.matrix, globalRotMat);
  ground.render();


  var wall = new Cube();
  wall.color = wallColor;
  ground.textureNum = 0;  //1 for texture
  wall.matrix.setTranslate(0, 0, 0);
  setNormalMatrix(wall.matrix, globalRotMat);
  wall.render();

  var mySphere = new Sphere();
  mySphere.color = [0.3, 0.5, 0.8, 1.0];
  mySphere.matrix.translate(2, 2, 2);
  mySphere.matrix.scale(0.5, 0.5, 0.5);
  // mySphere.segments = 20; //override default segments
  setNormalMatrix(mySphere.matrix, globalRotMat);
  mySphere.render();

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
