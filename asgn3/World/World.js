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
    gl_Position = u_GlobalRotateMatrix * u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
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
  if (ev.keyCode == 39){
    g_eye[0] += 0.2
  }
  else if (ev.keyCode == 37){
    g_eye[0] -= 0.2
  }
}

function addActionsForHtmlUI(){
  document.getElementById('legJoints').addEventListener('mousemove', function() { g_legAngle = this.value; });
  document.getElementById('tailJoints').addEventListener('mousemove', function() { g_tailAngle = this.value; });
  document.getElementById('cameraAngle').addEventListener('mousemove', function() { g_globalAngle = this.value; });
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

var g_eye = [0,0,3];
var g_at=[0,0,1];
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
  var globalRotMat = new Matrix4().rotate(g_globalAngle,0,1,0);
  // globalRotMat.rotate(g_globalYAngle,0,0,-1); 
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);


  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // draw the body cube
  var cowBody = new Cube();
  cowBody.color = [0.549, 0.463, 0.282,1];
  cowBody.matrix.setTranslate(0,0,0);
  var bodyPassMat = new Matrix4(cowBody.matrix);
  cowBody.matrix.scale(1,.5,.5);
  cowBody.render();

  // draw the back left leg cube
  var backLeftLegMatrix = new Matrix4(bodyPassMat);
  backLeftLegMatrix.translate(-.3, -.3, .2);
  var backLeftLegColor = [0.549, 0.463, 0.282,1];
  Leg(backLeftLegMatrix, backLeftLegColor, -1);

  // draw the back right leg cube
  var backRightLegyMatrix = new Matrix4(bodyPassMat);
  backRightLegyMatrix.translate(-.3, -.3, -.2);
  var backRightLegColor = [0.549, 0.463, 0.282,1];
  Leg(backRightLegyMatrix, backRightLegColor, 1);

  // draw the front left leg cube
  var frontLeftLegMatrix = new Matrix4(bodyPassMat);
  frontLeftLegMatrix.translate(.3, -.3, .2);
  var frontLeftLegColor = [0.549, 0.463, 0.282,1];
  Leg(frontLeftLegMatrix, frontLeftLegColor, 1);

  // draw the front right leg cube
  var frontRightLegyMatrix = new Matrix4(bodyPassMat);
  frontRightLegyMatrix.translate(.3, -.3, -.2);
  var frontRightLegColor = [0.549, 0.463, 0.282,1];
  Leg(frontRightLegyMatrix, frontRightLegColor, -1);

  var tailMatrix = new Matrix4();
  var tailColor = [0.486, 0.4, 0.219,1];
  Tail(tailMatrix, tailColor, 1);

  // draw the head cube
  var headMatrix = new Matrix4(); 
  var headColor = [0.486, 0.4, 0.219,1];
  Head(headMatrix, headColor);

  // Check performance of this function
  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(1000/duration)/5, "numdot")
}

function Tail(matrix, color, dir){
  var tailJoint1 = new Cube();
  tailJoint1.color = color;
  tailJoint1.matrix.translate(-.55,.1,0);
  if (g_isAnimated){
    tailJoint1.matrix.rotate(-15,dir*100*(Math.sin(g_seconds*4))*2,0,100);
  } else {
    tailJoint1.matrix.rotate(-15,-g_tailAngle,0,1)
  }
  var jointPass1 = new Matrix4(tailJoint1.matrix);
  tailJoint1.matrix.translate(0,-.1,0);
  tailJoint1.matrix.scale(.1,.3,.1);
  tailJoint1.render();

  var tailJoint2 = new Cube();
  tailJoint2.color = [color[0]*.9,color[1]*.9,color[2]*.9,color[3]];
  tailJoint2.matrix = new Matrix4(jointPass1);
  var jointPass2 = tailJoint2.matrix;
  tailJoint2.matrix.translate(0, -.2, 0);
  if (g_isAnimated){
    tailJoint2.matrix.rotate(15,dir*-35*(Math.sin(g_seconds*4)*5),0,100);
  } else {
    tailJoint2.matrix.rotate(15,g_tailAngle,0,1)
  }
  tailJoint2.matrix.translate(0, -.15, 0);
  tailJoint2.matrix.scale(.08, .25, .08);
  tailJoint2.render(); 
}

function Head(matrix, color) {
  //draw main part of head cube
  var cowHead = new Cube();
  cowHead.textureNum = 0;
  cowHead.matrix = new Matrix4(matrix)
  cowHead.color = color;
  cowHead.matrix.translate(.6, .2, 0);
  var cowHeadMat = new Matrix4(cowHead.matrix);
  cowHead.matrix.scale(.3, .35, .35);
  cowHead.render();

  // draw the left horn snout cube
  var cowHornL = new Cube();
  cowHornL.color = [0.5, 0.5, 0.5, 1];
  cowHornL.matrix = new Matrix4(cowHeadMat);
  cowHornL.matrix.translate(.15, .1, -0.225);
  cowHornL.matrix.scale(.25, .1, .1);
  cowHornL.render();

  // draw the right horn snout cube
  var cowHornR = new Cube();
  cowHornR.color = [0.5, 0.5, 0.5, 1];
  cowHornR.matrix = new Matrix4(cowHeadMat);
  cowHornR.matrix.translate(.15, .1, 0.225);
  cowHornR.matrix.scale(.25, .1, .1);
  cowHornR.render();

  // draw the front snout cube
  var cowSnout = new Cube();
  cowSnout.color = color;
  cowSnout.matrix.translate(.75, .1, 0);
  cowSnout.matrix.scale(.15, .15, .25);
  cowSnout.render();
}

function Leg(matrix, color, dir) {
  var cowLegJoint1 = new Cube();
  cowLegJoint1.color = color;
  cowLegJoint1.matrix = new Matrix4(matrix);
  if (g_isAnimated){
    cowLegJoint1.matrix.rotate(15*(dir*Math.sin(g_seconds*4)), 0, 0);
  } else {
    cowLegJoint1.matrix.rotate((g_legAngle)*dir, 0, 0);
  }
  cowLegJoint1.matrix.translate(0,.05,0)
  var jointPass1 = new Matrix4(cowLegJoint1.matrix)
  cowLegJoint1.matrix.scale(.2, .2, .2);
  cowLegJoint1.render();

  var cowLegJoint2 = new Cube();
  cowLegJoint2.color = [color[0]*.9,color[1]*.9,color[2]*.9,color[3]];
  cowLegJoint2.matrix = jointPass1;
  if (g_isAnimated){
    cowLegJoint2.matrix.rotate(30*(dir*Math.sin(g_seconds*4)), 0, 0);
  } else {
    cowLegJoint2.matrix.rotate((g_legAngle)*dir, 0, 0);
  }
  cowLegJoint2.matrix.translate(0, -.2, .0);
  var jointPass2 = new Matrix4(cowLegJoint2.matrix)
  cowLegJoint2.matrix.scale(.175, .3, .175);
  cowLegJoint2.render();

  var cowLegJoint3 = new Cube();
  cowLegJoint3.color = [color[0]*.8,color[1]*.8,color[2]*.8,color[3]];
  cowLegJoint3.matrix = jointPass2;
  if (g_isAnimated){
    cowLegJoint2.matrix.rotate(30*(dir*Math.sin(g_seconds*4)), 0, 0);
  } else {
    cowLegJoint2.matrix.rotate((15+g_legAngle)*dir, 0, 0);
  }
  cowLegJoint3.matrix.translate(0.05,-0.15,0);
  cowLegJoint3.matrix.scale(.3,.1,.2);
  cowLegJoint3.render();

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