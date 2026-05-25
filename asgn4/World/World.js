// ColoredPoint.js (c) 2012 matsuda

// Vertex shader program
var VSHADER_SOURCE =`
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  attribute vec4 a_Position;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  // uniform float u_normalFlip;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_VertPos = u_ModelMatrix * a_Position;
    v_UV = a_UV;
    v_Normal = normalize(mat3(u_ModelMatrix) * a_Normal);
  }`;

// Fragment shader program
var FSHADER_SOURCE =`
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform int u_whichTexture;
  uniform vec3 u_lightPos;
  uniform vec3 u_lightColor;
  uniform vec3 u_cameraPos;
  uniform bool u_lightOn;
  uniform vec3 u_spotPos;
  uniform vec3 u_spotDir;
  uniform float u_spotCutoff;
  uniform bool u_spotOn;
  void main() {
    if (u_whichTexture == -3) {
      // Normal visualization — skip all lighting
      gl_FragColor = vec4((v_Normal+1.0)/2.0, 1.0);
    } else {
      // Resolve base color from texture / solid color
      vec4 baseColor;
      if (u_whichTexture == -2) {
        baseColor = u_FragColor;
      } else if (u_whichTexture == -1) {
        baseColor = vec4(v_UV, 1.0, 1.0);
      } else if (u_whichTexture == 0) {
        baseColor = texture2D(u_Sampler0, v_UV);
      } else if (u_whichTexture == 1) {
        baseColor = texture2D(u_Sampler1, v_UV);
      } else if (u_whichTexture == 2) {
        baseColor = texture2D(u_Sampler2, v_UV);
      } else {
        baseColor = vec4(1.0, 0.2, 0.2, 1.0);
      }

      vec3 N = normalize(v_Normal);
      vec3 result = vec3(baseColor);

      // ── Point light ──
      if (u_lightOn) {
        vec3 L = normalize(u_lightPos - vec3(v_VertPos));
        float nDotL = max(dot(N, L), 0.0);
        vec3 R = reflect(-L, N);
        vec3 E = normalize(u_cameraPos - vec3(v_VertPos));
        float specular = pow(max(dot(E, R), 0.0), 10.0);
        vec3 diffuse = vec3(baseColor) * nDotL * 0.7 * u_lightColor;
        vec3 ambient = vec3(baseColor) * 0.3;
        if (u_whichTexture == -2 || u_whichTexture == 0 || u_whichTexture == 1) {
          result = diffuse + ambient;
        } else {
          result = vec3(specular) + diffuse + ambient;
        }
      }

      // ── Spotlight (flashlight, follows camera) ──
      if (u_spotOn) {
        vec3 spotL    = normalize(u_spotPos - vec3(v_VertPos));
        float spotCos = dot(-spotL, normalize(u_spotDir));
        if (spotCos > u_spotCutoff) {
          float falloff    = pow(spotCos, 20.0);
          float nDotSpotL  = max(dot(N, spotL), 0.0);
          result += vec3(baseColor) * nDotSpotL * falloff;
        }
      }

      gl_FragColor = vec4(clamp(result, 0.0, 1.0), 1.0);
    }
  }`;



// Global Vars
let canvas;
let gl;
let a_Position;
let a_UV;
let a_Normal;
let u_FragColor;
let u_lightPos;
let u_lightColor;
let u_lightOn;
let u_cameraPos;
let u_spotPos;
let u_spotDir;
let u_spotCutoff;
let u_spotOn;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_whichTexture;
// let u_normalFlip;


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

  // Get the storage location of a_UV
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  // Get the storage location of a_Normal
  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal < 0) {
    console.log('Failed to get the storage location of a_Normal');
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
  if (u_whichTexture === null) {
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
  if(u_Sampler0 === null){
    console.log("Failed to get storage location of u_Sampler0");
    return false;
  }

  // Get storage of u_Sampler
  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if(u_Sampler1 === null){
    console.log("Failed to get storage location of u_Sampler1");
    return false;
  }

  // Get storage of u_Sampler
  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if(u_Sampler2 === null){
    console.log("Failed to get storage location of u_Sampler2");
    return false;
  }

  // Get storage of u_lightPos
  u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
  if(u_lightPos === null){
    console.log("Failed to get storage location of u_lightPos");
    return false;
  }
  
  // Get storage of u_cameraPos
  u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
  if(u_cameraPos === null){
    console.log("Failed to get storage location of u_cameraPos");
    return false;
  }

  // Get storage of u_lightColor
  u_lightColor = gl.getUniformLocation(gl.program, 'u_lightColor');
  if(u_lightColor === null){
    console.log("Failed to get storage location of u_lightColor");
    return false;
  }

  // Get storage of u_lightOn
  u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
  if(u_lightOn === null){
    console.log("Failed to get storage location of u_lightOn");
    return false;
  }

  // Get storage of spotlight uniforms
  u_spotPos     = gl.getUniformLocation(gl.program, 'u_spotPos');
  u_spotDir     = gl.getUniformLocation(gl.program, 'u_spotDir');
  u_spotCutoff  = gl.getUniformLocation(gl.program, 'u_spotCutoff');
  u_spotOn      = gl.getUniformLocation(gl.program, 'u_spotOn');

  // u_normalFlip = gl.getUniformLocation(gl.program, 'u_normalFlip');
  // gl.uniform1f(u_normalFlip, 1.0);

  g_vertBuf   = gl.createBuffer();
  g_uvBuf     = gl.createBuffer();
  g_normalBuf = gl.createBuffer();
  
  // Set initial value for this matrix to identity
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements)
}

function initTextures(gl, n){
  var image0 = new Image(); // Create image object
  if (!image0){
    console.log("Failed to create image 0 object")
    return false;
  }
  // Register event handler to be called on loading an image
  image0.onload = function(){sendTextureToTEXTURE0(image0);}
  // Tell browser to load an image
  image0.src = 'brick.png';
  
  var image1 = new Image(); // Create image object
  if (!image1){
    console.log("Failed to create image 1 object")
    return false;
  }
  // Register event handler to be called on loading an image
  image1.onload = function(){sendTextureToTEXTURE1(image1);}
  // Tell browser to load an image
  image1.src = 'floor.jpg';
  
  var image2 = new Image(); // Create image object
  if (!image2){
    console.log("Failed to create image 2 object")
    return false;
  }
  // Register event handler to be called on loading an image
  image2.onload = function(){sendTextureToTEXTURE2(image2);}
  // Tell browser to load an image
  image2.src = 'skybox.jpg';
  
  return true;
}

function addActionsForHtmlUI(){

  document.getElementById('legJoints').addEventListener('mousemove', function() { g_legAngle = this.value; });
  document.getElementById('tailJoints').addEventListener('mousemove', function() { g_tailAngle = this.value; });
  document.getElementById('cameraAngle').addEventListener('mousemove', function() { g_globalXAngle = this.value; });
  document.getElementById('lightSlideX').addEventListener('mousemove', function(ev) { if(ev.buttons=1){ g_lightPosAdd[0] = this.value/50; renderScene;}});
  document.getElementById('lightSlideY').addEventListener('mousemove', function(ev) { if(ev.buttons=1){ g_lightPosAdd[1] = this.value/50; renderScene;}});
  document.getElementById('lightSlideZ').addEventListener('mousemove', function(ev) { if(ev.buttons=1){ g_lightPosAdd[2] = this.value/50; renderScene;}});
  document.getElementById('animOn').onclick = function() { g_isAnimated = true; };
  document.getElementById('animOff').onclick = function() { g_isAnimated = false; };
  document.getElementById('lightAnimOn').onclick = function() { lightAnim = true; };
  document.getElementById('lightAnimOff').onclick = function() { lightAnim = false; };
  document.getElementById('lightColorR').addEventListener('input', function() { g_lightColor[0] = this.value/255; });
  document.getElementById('lightColorG').addEventListener('input', function() { g_lightColor[1] = this.value/255; });
  document.getElementById('lightColorB').addEventListener('input', function() { g_lightColor[2] = this.value/255; });
  document.getElementById('normalVizOn').onclick  = function() { g_normalViz = true; };
  document.getElementById('normalVizOff').onclick = function() { g_normalViz = false; };
  document.getElementById('lightOn').onclick  = function() { g_lightOn = true; };
  document.getElementById('lightOff').onclick = function() { g_lightOn = false; };
  document.getElementById('spotOn').onclick   = function() { g_spotOn = true; };
  document.getElementById('spotOff').onclick  = function() { g_spotOn = false; };
  
  canvas.addEventListener('mousedown', function(ev) {
    if (ev.button === 0) canvas.requestPointerLock();
  })
  document.addEventListener('pointerlockchange', function() {
    g_isDragging = (document.pointerLockElement === canvas);
  })
  canvas.addEventListener('mousemove', function(ev){
    if (!g_isDragging) return;
    g_camera.yaw(ev.movementX * 0.003);
    g_camera.pitch(-ev.movementY * 0.003);
  })
  canvas.addEventListener('mouseup', function(ev) {
    if (ev.button === 0) document.exitPointerLock();
  })
}

function sendTextureToTEXTURE0(image){
  var texture = gl.createTexture(); // create texture object
  if (!texture){
    console.log("Failed to create texture object")
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  gl.activeTexture(gl.TEXTURE0); // Enable texture unit0
  gl.bindTexture(gl.TEXTURE_2D, texture);  // Bind the texture to the target
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);  // Set texture parameters
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);  // Set the texture image
  gl.uniform1i(u_Sampler0, 0);  // Set the texture unit 0 to sampler
  
  console.log('finished loadTexture');
}

function sendTextureToTEXTURE1(image){
  var texture = gl.createTexture(); // create texture object
  if (!texture){
    console.log("Failed to create texture object")
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  gl.activeTexture(gl.TEXTURE1); // Enable texture unit1
  gl.bindTexture(gl.TEXTURE_2D, texture);  // Bind the texture to the target
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);  // Set texture parameters
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);  // Set the texture image
  gl.uniform1i(u_Sampler1, 1);  // Set the texture unit 1 to sampler
  
  console.log('finished loadTexture');
}

function sendTextureToTEXTURE2(image){
  var texture = gl.createTexture(); // create texture object
  if (!texture){
    console.log("Failed to create texture object")
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  gl.activeTexture(gl.TEXTURE2); // Enable texture unit1
  gl.bindTexture(gl.TEXTURE_2D, texture);  // Bind the texture to the target
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);  // Set texture parameters
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);  // Set the texture image
  gl.uniform1i(u_Sampler2, 2);  // Set the texture unit 1 to sampler
  
  console.log('finished loadTexture');
}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;
const RECTANGLE = 3;
let g_vertBuf, g_uvBuf, g_normalBuf;
let g_lightPos = [0,0,0];
let g_lightPosAdd = [0,0,0];
let g_lightColor = [1.0, 1.0, 1.0];
let g_lightOn = true;
let g_spotOn   = false;
let g_normalViz = false;
let g_obj = null;
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
let lightAnim = false;
let g_tailAngle = 0;
let g_isDragging = false;
let g_lastMouseX = 0;
let g_lastMouseY = 0;
let g_camera = null;
let g_sphere = null;
let g_keys = {};
var g_floorTiles = [];
var g_wallCubes  = [];

function main() {
  setupWebGL();

  connectVariablesToGLSL();

  addActionsForHtmlUI();

  document.addEventListener('keydown', function(ev) {
    if (ev.keyCode === 32) ev.preventDefault();
    g_keys[ev.keyCode] = true;
  });
  document.addEventListener('keyup', function(ev) {
    g_keys[ev.keyCode] = false;
  });

  initTextures(gl, 0);
  g_camera = new Camera();

  // Load OBJ model
  g_obj = new OBJObject();
  g_obj.color = [0.2, 0.6, 1.0, 1.0];  // sky-blue gem
  g_obj.matrix.translate(-3, 1, 2);
  g_obj.matrix.scale(0.6, 0.6, 0.6);
  g_obj.load('teapot.obj');

  renderFloor();
  renderMap();
  
  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

 

  requestAnimationFrame(tick);
}

function processKeys() {
  if (g_keys[87] || g_keys[38]) g_camera.forward();     // W / Up
  if (g_keys[83] || g_keys[40]) g_camera.backward();    // S / Down
  if (g_keys[65] || g_keys[37]) g_camera.strafeLeft();  // A / Left
  if (g_keys[68] || g_keys[39]) g_camera.strafeRight(); // D / Right
  if (g_keys[81])               g_camera.turnLeft();    // Q
  if (g_keys[69])               g_camera.turnRight();   // E
  if (g_keys[32])               g_camera.moveUp();      // Space
  if (g_keys[16])               g_camera.moveDown();    // Shift
}



function renderScene(){
  // Check time at start of this function.
  var startTime = performance.now();

  var projMat = new Matrix4();
  projMat.setPerspective(90, canvas.width/canvas.height, .1, 100)
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);
  
  var viewMat = new Matrix4();
  viewMat.setLookAt(g_camera.eye.elements[0],g_camera.eye.elements[1],g_camera.eye.elements[2], 
                    g_camera.at.elements[0], g_camera.at.elements[1], g_camera.at.elements[2], 
                    g_camera.up.elements[0], g_camera.up.elements[1], g_camera.up.elements[2], );
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);
  

  var globalRotMat = new Matrix4(); // identity — camera handles all rotation now
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);


  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  
  g_floorTiles.forEach(t => t.render());
  g_wallCubes.forEach(w => w.render());

  // draw the body cube
  renderCow();

  renderSkybox();

  

  gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  gl.uniform3f(u_lightColor, g_lightColor[0], g_lightColor[1], g_lightColor[2]);
  gl.uniform1i(u_lightOn, g_lightOn ? 1 : 0);
  gl.uniform3f(u_cameraPos, g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2]);

  // Spotlight follows the camera like a flashlight
  var forward = new Vector3(g_camera.at.elements);
  forward.sub(g_camera.eye);
  forward.normalize();
  gl.uniform3f(u_spotPos, g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2]);
  gl.uniform3f(u_spotDir, forward.elements[0], forward.elements[1], forward.elements[2]);
  gl.uniform1f(u_spotCutoff, Math.cos(20 * Math.PI / 180)); // 20-degree half-angle cone
  gl.uniform1i(u_spotOn, g_spotOn ? 1 : 0);

  var light = new Cube();
  light.color = [2,2,0,1];
  light.matrix.translate(g_lightPos[0],g_lightPos[1],g_lightPos[2]);
  light.matrix.scale(-0.3,-0.3,-0.3);
  light.textureNum = -2;
  light.render();

  g_sphere = new Sphere();
  g_sphere.matrix.translate(0, 2, 0);
  g_sphere.matrix.scale(1, 1, 1);

  if (g_sphere) g_sphere.render();

  // OBJ model
  if (g_obj) g_obj.render();

  // Check performance of this function
  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(1000/duration)/5, "numdot")
}

var g_map = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1]
]


function renderMap(){
  for(let x = -4; x <= 4; x += 1){
    for(let z = -4; z <= 4; z += 1){
      if (g_map[x+4][z+4] === 1){
        var wall = new Cube();
        wall.textureNum = 0;
        wall.matrix.translate(x, -0.15, z);
        g_wallCubes.push(wall);
      }
    }
  }
}

function renderFloor(){
  for(let x = -4; x <= 4; x += 1){
    for(let z = -4; z <= 4; z += 1){
      var tile = new Cube();
      tile.textureNum = 1;
      tile.matrix.translate(x, -1.15, z);
      g_floorTiles.push(tile);
    }
  }
}

function renderSkybox(){
  // gl.uniform1f(u_normalFlip, -1.0);
  var skybox = new Cube();
  skybox.textureNum = -2;
  skybox.color = [0.3,0.3,0.3,1];
  skybox.matrix.translate(0, 0, 0);
  skybox.matrix.scale(-15, -15, -15);
  skybox.render();
  // gl.uniform1f(u_normalFlip, 1.0);
}

function tick(){
  g_seconds=(performance.now()/1000.0)-g_startTime;

  processKeys();
  renderScene();

  updateAnimationAngles();

  requestAnimationFrame(tick);
}

function updateAnimationAngles(){
  if(lightAnim){
    // Orbit around the slider-set position
    g_lightPos[0] = Math.cos(g_seconds*3)   + g_lightPosAdd[0];
    g_lightPos[1] = (Math.cos(g_seconds)+2)*3 + g_lightPosAdd[1];
    g_lightPos[2] = Math.cos(g_seconds)*3   + g_lightPosAdd[2];
  } else {
    // Sliders directly control position
    g_lightPos[0] = g_lightPosAdd[0];
    g_lightPos[1] = g_lightPosAdd[1];
    g_lightPos[2] = g_lightPosAdd[2];
  }
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