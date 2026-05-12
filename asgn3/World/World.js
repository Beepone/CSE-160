// ColoredPoint.js (c) 2012 matsuda

// Vertex shader program
var VSHADER_SOURCE =`
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`;

// Fragment shader program
var FSHADER_SOURCE =`
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform int u_whichTexture;
  void main() {
    if (u_whichTexture == -2){
      gl_FragColor = u_FragColor;
    } else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV,1.0,1.0);
    } else if (u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    } else {
      gl_FragColor = vec4(1,.2,.2,1);  
    }
  }`;



// Global Vars
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;
let u_Sampler0;
let u_whichTexture;


function setupWebGL(){
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');
  
  // Get the rendering context for WebGL
  // gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);

}

function connectVariablesToGLSL() {
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

  // Get the storage location of A_UV
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

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Get the storage location of u_ModelMatrix
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  // Get the storage location of u_ModelMatrix
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }
  
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return;
  }
  
  // Get the storage location of u_FragColor
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  // Get storage of u_Sampler
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if(!u_Sampler0){
    console.log("Failed to get storage location of u_Sampler0");
    return false;
  }

  
  // Set initial value for this matrix to identity
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements)
}

function initTextures(gl, n){
  var image = new Image(); // Create image object
  if (!image){
    console.log("Failed to create image object")
    return false;
  }
  
  // Register event handler to be called on loading an image
  image.onload = function(){sendTextureToTEXTURE0(image);}
  // Tell browser to load an image
  image.src = 'brick.png';

  return true;
}

function sendTextureToTEXTURE0(image){
  var texture = gl.createTexture(); // create texture object
  if (!texture){
    console.log("Failed to create texture object")
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE0);
  // Bind the texture to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Set the texture unit 0 to sampler
  gl.uniform1i(u_Sampler0, 0);

  console.log('finished loadTexture');
}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;
const RECTANGLE = 3;
var g_shapeList = [];
let g_selectedType = TRIANGLE;
let g_rectangleStart = null;
let g_globalAngle = 0;
let g_globalXAngle = 0;
let g_globalYAngle = 0;
let g_legAngle = 0;
let g_startTime = performance.now()/1000.0;
let g_seconds = performance.now()/1000.0-g_startTime;
let g_isAnimated = false;
let g_tailAngle = 0;
let g_isDragging = false;
let g_lastMouseX = 0;
let g_lastMouseY = 0;

function main() {
  setupWebGL();

  connectVariablesToGLSL();

  addActionsForHtmlUI();

  document.onkeydown = keydown;

  initTextures(gl, 0);

  
  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  
  // renderScene();
  requestAnimationFrame(tick)
}

function keydown(ev){
  var eye = new Vector3([g_eye[0],g_eye[1],g_eye[2]]);
  var at = new Vector3([g_at[0],g_at[1],g_at[2]]);
  var forward = new Vector3(at.elements).sub(eye);
  var forwardLen = forward.magnitude();
  if (forwardLen > 0.001) {
    forward.div(forwardLen);
  } else {
    forward = new Vector3([0,0,-1]);
  }

  var up = new Vector3(g_up);
  var right = Vector3.cross(forward, up);
  var rightLen = right.magnitude();
  if (rightLen > 0.001) {
    right.div(rightLen);
  } else {
    right = new Vector3([1,0,0]);
  }

  var speed = 0.25;
  if (ev.keyCode == 37 || ev.keyCode == 65){ // LEFT or A
    var delta = new Vector3(right.elements).mul(-speed);
    eye.add(delta);
    at.add(delta);
  }
  else if (ev.keyCode == 39 || ev.keyCode == 68){ // RIGHT or D
    var delta = new Vector3(right.elements).mul(speed);
    eye.add(delta);
    at.add(delta);
  }
  else if (ev.keyCode == 38 || ev.keyCode == 87){ // FORWARD or W
    var delta = new Vector3(forward.elements).mul(speed);
    eye.add(delta);
    at.add(delta);
  }
  else if (ev.keyCode == 40 || ev.keyCode == 83){ // BACKWARD or S
    var delta = new Vector3(forward.elements).mul(-speed);
    eye.add(delta);
    at.add(delta);
  }

  g_eye = eye.elements;
  g_at = at.elements;
  document.getElementById('legJoints').addEventListener('mousemove', function() { g_legAngle = this.value; });
  document.getElementById('tailJoints').addEventListener('mousemove', function() { g_tailAngle = this.value; });
  document.getElementById('cameraAngle').addEventListener('mousemove', function() { g_globalXAngle = this.value; });
  document.getElementById('animOn').onclick = function() { g_isAnimated = true; };
  document.getElementById('animOff').onclick = function() { g_isAnimated = false; };

  canvas.addEventListener('mousedown', function(ev) {
    g_isDragging = true;
    g_lastMouseX = ev.clientX;
    g_lastMouseY = ev.clientY;
  })
  canvas.addEventListener('mousemove', function(ev){
    if (!g_isDragging) return;

    var deltaX = ev.clientX - g_lastMouseX;
    var deltaY = g_lastMouseY - ev.clientY;
    g_globalXAngle -= deltaX *.5
    g_globalYAngle -= deltaY *.5
    g_lastMouseX = ev.clientX;
    g_lastMouseY = ev.clientY;
  })
  canvas.addEventListener('mouseup', function(ev) {
    g_isDragging = false;
  })
  canvas.addEventListener('mouseleave', function(ev) {
    g_isDragging = false;
  })
}

var g_eye = [0,0,5];
var g_at=[0,0,0];
var g_up=[0,1,0]


function renderScene(){
  // Check time at start of this function.
  var startTime = performance.now();

  var projMat = new Matrix4();
  projMat.setPerspective(90, canvas.width/canvas.height, .1, 100)
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);
  
  var viewMat = new Matrix4();
  viewMat.setLookAt(g_eye[0],g_eye[1],g_eye[2], g_at[0],g_at[1],g_at[2], g_up[0],g_up[1],g_up[2]);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);
  

  // Pass the matrix to u_ModelMatrix attribute
  var globalRotMat = new Matrix4().rotate(g_globalXAngle,0,1,0);
  globalRotMat.rotate(g_globalYAngle,1,0,0); 
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);


  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // draw the body cube
  renderCow();

  // Check performance of this function
  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(1000/duration)/5, "numdot")
}

function tick(){
  g_seconds=(performance.now()/1000.0)-g_startTime;
  // console.log(g_seconds);

  renderScene();

  requestAnimationFrame(tick);
}

// This is to see FPS
function sendTextToHTML(text, htmlID){
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return
  }
  htmlElm.innerHTML = text;
}