// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =`
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`;

// Fragment shader program
var FSHADER_SOURCE =`
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`;



// Global Vars
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;


function setupWebGL(){
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl160');
  
  // Get the rendering context for WebGL
  // gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

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
  
  // Get the storage location of u_FragColor
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  // Set initial value for this matrix to identity
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements)
}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;
const RECTANGLE = 3;
var g_shapeList = [];
let g_selectedType = TRIANGLE;
let g_rectangleStart = null;
let g_globalAngle = 0;

function main() {
  setupWebGL();

  connectVariablesToGLSL();

  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  
  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  
  renderAllShapes();
}

function  addActionsForHtmlUI(){
  document.getElementById('clearButton').onclick = function() { g_shapeList=[]; renderAllShapes(); }; 
  document.getElementById('pointButton').onclick = function() { g_selectedType=POINT;}; 
  document.getElementById('triangleButton').onclick = function() { g_selectedType=TRIANGLE; }; 
  document.getElementById('circleButton').onclick = function() { g_selectedType=CIRCLE; }; 
  document.getElementById('rectangleButton').onclick = function() { g_selectedType=RECTANGLE; };
  document.getElementById('pictureButton').onclick = function() { drawPicture(); };

  document.getElementById('cameraAngle').addEventListener('mousemove', function() { g_globalAngle = this.value; renderAllShapes();});
}

function click(ev) {
  
  [x,y] = clickCoordinatesCoversion(ev);

  if (g_selectedType === RECTANGLE) {
    if (g_rectangleStart === null) {
      g_rectangleStart = [x, y];
    } else {
      let rect = new Rectangle();
      rect.position = [g_rectangleStart[0], g_rectangleStart[1], x, y];
      [r, g, b] = getDocumentData();
      rect.color = [r, g, b, 1.0];
      rect.size = document.getElementById('s').value;
      g_shapeList.push(rect);
      g_rectangleStart = null;
      renderAllShapes();
    }
  } else {
    let point;
    if (g_selectedType == POINT){
      point = new Point();
    } else if (g_selectedType == TRIANGLE){
      point = new Triangle();
    } else {
      point = new Circle();
      point.segments = document.getElementById('seg').value;
    }

    // Store the coordinates to g_points array
    point.position = [x, y, 0.0];

    [r, g, b] = getDocumentData();
    point.color = [r, g, b, 1.0];

    var s = document.getElementById('s').value;
    point.size = s;
    // Clear <canvas>
    g_shapeList.push(point);
    
    renderAllShapes();
  }
}

function getDocumentData(){
  var r = document.getElementById('r').value;
  var g = document.getElementById('g').value;
  var b = document.getElementById('b').value;

  return [r, g, b]
}

function renderAllShapes(){
  // Check time at start of this function.
  var startTime = performance.now();

  // Pass the matrix to u_ModelMatrix attribute
  var globalRotMat = new Matrix4().rotate(g_globalAngle,0,1,0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);


  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
  

  drawTriangle3D([-1.0,0.0,0.0,  -0.5,-1.0,0.0,  0.0,0.0,0.0]);

  // draw the body cube
  var body = new Cube();
  body.color = [1.0,0.0,0.0,1.0];
  body.matrix.translate(-.25, -.5,0.0)
  body.matrix.scale(0.5,1.0,0.5)
  body.render();

  // draw the left arm
  var leftArm = new Cube();
  leftArm.color = [1,1,0,1];
  leftArm.matrix.translate(0.7,0.0,0.0);
  leftArm.matrix.rotate(45.0,0.0,0.0,1.0);
  leftArm.matrix.scale(0.25, 0.7, 0.5);
  leftArm.render();

  // Check performance of this function
  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(1000/duration)/5, "numdot")
}

function clickCoordinatesCoversion(ev){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return [x,y];
  
}
function sendTextToHTML(text, htmlID){
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return
  }
  htmlElm.innerHTML = text;
}
