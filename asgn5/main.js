import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { initObstacles, updateObstacles } from './obstacles.js';
// ── Renderer ──────────────────────────────────────────────────────────────────
// The renderer is what actually draws everything onto the screen using WebGL.
// antialias: true smooths out jagged edges on geometry.
const renderer = new THREE.WebGLRenderer({ antialias: true });

// Make the canvas fill the entire browser window
renderer.setSize(window.innerWidth, window.innerHeight);

// Use the screen's native pixel density (important for sharp rendering on high-DPI screens)
renderer.setPixelRatio(window.devicePixelRatio);

// Enable shadow rendering — objects can cast and receive shadows
renderer.shadowMap.enabled = true;

// Attach the renderer's <canvas> element to the HTML page so we can see it
document.body.appendChild(renderer.domElement);

// ── Scene ─────────────────────────────────────────────────────────────────────
// The scene is a container that holds everything: geometry, lights, cameras, etc.
// Think of it like the "world" or "stage".
const scene = new THREE.Scene();

// ── Camera ────────────────────────────────────────────────────────────────────
// PerspectiveCamera mimics how human eyes see — objects farther away look smaller.
// Arguments: field-of-view (degrees), aspect ratio, near clip plane, far clip plane.
// Near/far clip planes define the range of distances the camera can see.
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Start the camera behind and above where the car will be
camera.position.set(0, 5, 28);
camera.lookAt(0, 0, 20); // look toward the car's starting position

// ── Car State ─────────────────────────────────────────────────────────────────
// The car object is null until the OBJ finishes loading asynchronously.
// Every system that touches the car must guard with: if (!car) return;
let car = null;

// Lane system: 3 fixed X positions. The car only moves left/right between these.
// This is the same approach used in endless runners like Subway Surfers.
const LANES = [-17, -8, 0, 8, 17];  // left lane, center lane, right lane
let currentLane = 2;        // start in the center (index 1)

initObstacles(scene, LANES);

// targetX is the X coordinate the car is sliding toward.
// We update it when the player presses a key, then lerp toward it each frame.
let targetX = LANES[currentLane];

// ── Keyboard Input ────────────────────────────────────────────────────────────
// keydown fires once per key press. We listen for left/right arrows to change lanes.
window.addEventListener('keydown', (e) => {
  if (( e.key === 'ArrowLeft' || e.key === 'a' ) && currentLane > 0) {
    currentLane--;              // move one lane to the left
    targetX = LANES[currentLane];
  }
  if ((e.key === 'ArrowRight' || e.key === 'd' )  && currentLane < LANES.length - 1) {
    currentLane++;              // move one lane to the right
    targetX = LANES[currentLane];
  }
});

// ── Lights ────────────────────────────────────────────────────────────────────
// Three.js objects are invisible without light (when using Phong/Lambert materials).
// We need at least three different light types for full credit.

// 1. AmbientLight — casts uniform light on every surface from every direction.
//    It has no position and creates no shadows. Good for preventing pure-black shadows.
//    Args: color (hex), intensity
const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(ambientLight);

// // 2. DirectionalLight — simulates a far-away light source like the sun.
//    All rays travel in the same direction, so it can cast hard shadows.
const dirLight = new THREE.DirectionalLight(0xffffff, .1);
dirLight.position.set(10, 20, 10); // position tells Three.js which direction light comes FROM
dirLight.castShadow = true;        // allow this light to generate shadow maps
scene.add(dirLight);

// 3. PointLight — emits light in all directions from a single point, like a light bulb.
//    Args: color, intensity, distance (how far the light reaches before fading to 0)
// distance: 0 means infinite range — light reaches everywhere with no hard cutoff square
const pointLight = new THREE.PointLight(0xff8800, 200, 200);
pointLight.position.set(0, 20, 0);
pointLight.castShadow = true;
// Point light shadows are expensive — Three.js renders 6 shadow maps (one per cube face)
// instead of the single map a DirectionalLight needs. Off by default for performance.
pointLight.castShadow = true;
scene.add(pointLight);

// ── Textures ──────────────────────────────────────────────────────────────────
// TextureLoader handles loading image files (PNG, JPG, etc.) as GPU textures.
// We create one loader instance and reuse it for every texture.
const texLoader = new THREE.TextureLoader();

// TODO: once you add an image to textures/, load it like this:
const roadTex = texLoader.load('textures/road.jpg');
roadTex.wrapS = THREE.RepeatWrapping;
roadTex.wrapT = THREE.RepeatWrapping;
roadTex.repeat.set(2, 10);
// Then pass it to a material: new THREE.MeshPhongMaterial({ map: boxTex })

// ── Primary Shapes ────────────────────────────────────────────────────────────
// In Three.js, a visible object (Mesh) is made of two parts:
//   Geometry — the shape/vertex data (BoxGeometry, SphereGeometry, etc.)
//   Material  — how the surface looks (color, texture, shininess, etc.)
// You combine them: new THREE.Mesh(geometry, material)


// --- Ground Plane ---
// PlaneGeometry(width, height) — a flat rectangle lying in the XY plane by default
const groundGeo = new THREE.PlaneGeometry(50, 2000);
const groundMat = new THREE.MeshPhongMaterial({ map: roadTex });
const ground = new THREE.Mesh(groundGeo, groundMat);
// Rotate -90° around X to make it lie flat (it starts standing upright)
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true; // allow shadows from other objects to appear on this surface
scene.add(ground);

// ── Skybox ────────────────────────────────────────────────────────────────────
// scene.background can be a solid color, a texture, or a CubeTexture (6-sided skybox).
// For now we use a placeholder sky-blue color.
// TODO: load 6 images (px, nx, py, ny, pz, nz) into textures/skybox/ then replace this with:
const cubeLoader = new THREE.CubeTextureLoader();
scene.background = cubeLoader.setPath('textures/skybox/').load(['px.png','nx.png','py.png','ny.png','pz.png','nz.png']);
// scene.background = new THREE.Color(0x87ceeb); // placeholder sky-blue


// ── 3D Model ──────────────────────────────────────────────────────────────────
const mtlLoader = new MTLLoader();
mtlLoader.load('models/Car_Obj.mtl', (materials) => {
  materials.preload(); // tell Three.js to prepare the textures
  
  const objLoader = new OBJLoader();
  objLoader.setMaterials(materials); // apply the MTL materials to the OBJ
  objLoader.load('models/Car Obj.obj', (object) => {
    // Remove any flat display planes baked into the model (common in free car assets)
    object.traverse((child) => {
      if (child.isMesh) {
        const box = new THREE.Box3().setFromObject(child);
        const size = new THREE.Vector3();
        box.getSize(size);
        if (size.y < 0.01) child.visible = false; // remove baked display plane
        child.castShadow = true;    // each mesh part casts shadows
        child.receiveShadow = true; // and receives shadows from other objects
      }
    });
    object.position.set(0, 0.320, 20);
    object.rotation.y = Math.PI;
    scene.add(object);
    car = object; // store reference so the animation loop can move it
  });
});

// ── Game State ────────────────────────────────────────────────────────────────
let gameOver = false;
let score = 0;

// Grab the HTML elements we'll update each frame
const scoreEl    = document.getElementById('score');
const gameOverEl = document.getElementById('gameover');
const finalScore = document.getElementById('finalscore');

// Time - prevFrameTime = deltaTime
var deltaTime = 0;
var time = 0;
const ROAD_SPEED = 1.5;

// ── Animation Loop ────────────────────────────────────────────────────────────
function animate(t) {
  requestAnimationFrame(animate);
  var lastTime = time;
  time = t * 0.001;
  deltaTime = Math.min(time - lastTime, .1);

  if (!gameOver) {
    // updateObstacles returns true when the car is hit
    if (updateObstacles(deltaTime, car)) {
      gameOver = true;
      // Stop the road scrolling
      // Show the game over overlay and final score
      gameOverEl.style.display = 'flex';
      finalScore.textContent = `Score: ${score}`;
    }

    // Increment score by time survived (rounded to 1 decimal)
    score += deltaTime;
    scoreEl.textContent = `Score: ${Math.floor(score)}`;
  }
  


  // ── Car movement ────────────────────────────────────────────────────────────
  if (car) {
    // lerp(current, target, t) moves 'current' a fraction 't' closer to 'target' each frame.
    // 0.1 means we close 10% of the remaining gap every frame — gives a smooth slide feel.
    car.position.x = THREE.MathUtils.lerp(car.position.x, targetX, 0.2);
    car.position.y = 0.320 + Math.sin(time * 20) * .05;

    // ── Follow camera ──────────────────────────────────────────────────────────
    // Keep the camera a fixed offset behind and above the car.
    // Lerp the camera X slightly slower than the car so it lags a little — feels more natural.
    const camX = THREE.MathUtils.lerp(camera.position.x, car.position.x, .25);
    const camY = THREE.MathUtils.lerp(camera.position.y, car.position.y, .01);
    camera.position.set(camX, camY + .1, car.position.z + 8);
    camera.lookAt(car.position.x, car.position.y + 1, car.position.z - 5);
  }

  // ── Road movement — stops when game is over ──────────────────────────────────
  if (ground && !gameOver){
    roadTex.offset.y += ROAD_SPEED * deltaTime;
  }
  renderer.render(scene, camera);
}
requestAnimationFrame(animate); // kick off the loop

// ── Resize Handler ────────────────────────────────────────────────────────────
// If the user resizes the browser window we need to update the camera's aspect
// ratio and the renderer's output size, otherwise everything looks stretched.
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix(); // must call this after changing camera properties
  renderer.setSize(window.innerWidth, window.innerHeight);
});
