import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { initObstacles, updateObstacles } from './obstacles.js';
import { initLamps, updateLamps } from './streetlamps.js';
// ── Renderer ──────────────────────────────────────────────────────────────────
// The renderer is what actually draws everything onto the screen using WebGL.
// antialias: true smooths out jagged edges on geometry.
const renderer = new THREE.WebGLRenderer({ antialias: true });

// Make the canvas fill the entire browser window
renderer.setSize(window.innerWidth, window.innerHeight);

// Use the screen's native pixel density (important for sharp rendering on high-DPI screens)
renderer.setPixelRatio(window.devicePixelRatio/2);

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
initLamps(scene);

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
// Deep blue-purple tint to match the night skybox
const ambientLight = new THREE.AmbientLight(0x2a1a4a, .4);
scene.add(ambientLight);

// Moonlight — cool blue-white directional light coming from above-left
const dirLight = new THREE.DirectionalLight(0x4466aa, 1);
dirLight.position.set(10, 20, 10);
dirLight.castShadow = true;
scene.add(dirLight);


// ── Textures ──────────────────────────────────────────────────────────────────
// TextureLoader handles loading image files (PNG, JPG, etc.) as GPU textures.
// We create one loader instance and reuse it for every texture.
const texLoader = new THREE.TextureLoader();

// TODO: once you add an image to textures/, load it like this:
const roadTex = texLoader.load('textures/road.jpg');
roadTex.wrapS = THREE.RepeatWrapping;
roadTex.wrapT = THREE.RepeatWrapping;
roadTex.repeat.set(2, 40);
// Then pass it to a material: new THREE.MeshPhongMaterial({ map: boxTex })

// ── Primary Shapes ────────────────────────────────────────────────────────────
// In Three.js, a visible object (Mesh) is made of two parts:
//   Geometry — the shape/vertex data (BoxGeometry, SphereGeometry, etc.)
//   Material  — how the surface looks (color, texture, shininess, etc.)
// You combine them: new THREE.Mesh(geometry, material)
const sidewalkGeoR = new THREE.BoxGeometry(5, 2, 2000);
const sidewalkMatR = new THREE.MeshPhongMaterial({ color: 0x4466aa });
const sidewalkR = new THREE.Mesh(sidewalkGeoR, sidewalkMatR);
sidewalkR.position.x = 28;
scene.add(sidewalkR);

const sidewalkGeoL = new THREE.BoxGeometry(5, 2, 2000);
const sidewalkMatL = new THREE.MeshPhongMaterial({ color: 0x4466aa });
const sidewalkL = new THREE.Mesh(sidewalkGeoL, sidewalkMatL);
sidewalkL.position.x = -28;
scene.add(sidewalkL);

// --- Road Plane ---
// PlaneGeometry(width, height) — a flat rectangle lying in the XY plane by default
const roadGeo = new THREE.PlaneGeometry(50, 2000);
const roadMat = new THREE.MeshPhongMaterial({ map: roadTex });
const road = new THREE.Mesh(roadGeo, roadMat);
// Rotate -90° around X to make it lie flat (it starts standing upright)
road.rotation.x = -Math.PI / 2;
road.receiveShadow = true; // allow shadows from other objects to appear on this surface
scene.add(road);

// --- Grass Plane ---
// PlaneGeometry(width, height) — a flat rectangle lying in the XY plane by default
const grassGeo = new THREE.PlaneGeometry(1000, 2000);
const grassMat = new THREE.MeshPhongMaterial({ color: 0x44aa88 });
const grassR = new THREE.Mesh(grassGeo, grassMat);
// Rotate -90° around X to make it lie flat (it starts standing upright)
grassR.position.y = .5
grassR.position.x = 530;
grassR.rotation.x = -Math.PI / 2;
grassR.receiveShadow = true; // allow shadows from other objects to appear on this surface
scene.add(grassR);

const grassL = new THREE.Mesh(grassGeo, grassMat);
// Rotate -90° around X to make it lie flat (it starts standing upright)
grassL.position.y = .5
grassL.position.x = -530;
grassL.rotation.x = -Math.PI / 2;
grassL.receiveShadow = true; // allow shadows from other objects to appear on this surface
scene.add(grassL);

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

    // ── Headlights ─────────────────────────────────────────────────────────────
    // SpotLights added as CHILDREN of the car so they move with it automatically.
    // car.rotation.y = Math.PI means local +Z = world -Z (forward direction).
    // So a child at local (x, y, +Z) appears in front of the car in world space.
    function makeHeadlight(localX) {
      const light = new THREE.SpotLight(0xffeedd, 200, 80, Math.PI / 10, 0.5);
      light.position.set(localX, 0.8, 2); // above the hood, front of car

      // Target defines where the beam points — far ahead (+Z) and angled down (-Y)
      const target = new THREE.Object3D();
      target.position.set(localX, -2, 30);
      object.add(target);       // must be in the scene graph for matrixWorld to update
      light.target = target;

      object.add(light);
    }

    makeHeadlight(-1); // left headlight
    makeHeadlight( 1); // right headlight

    scene.add(object);
    car = object; // store reference so the animation loop can move it
  });
});

// ── Orbit Controls (active only on game over so the player can look around) ───
const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enabled = false;     // disabled during gameplay
orbitControls.enableDamping = true;

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
var speedMult = .1;

// ── Animation Loop ────────────────────────────────────────────────────────────
function animate(t) {
  requestAnimationFrame(animate);
  var lastTime = time;
  time = t * 0.001;
  deltaTime = Math.min(time - lastTime, .1);

  if (!gameOver) {
    // updateObstacles returns true when the car is hit
    updateLamps(deltaTime*speedMult);
    if (updateObstacles(deltaTime*speedMult, car)) {
      gameOver = true;
      gameOverEl.style.display = 'flex';
      finalScore.textContent = `Score: ${Math.floor(score)}`;
      // Enable orbit controls so the player can look around the frozen scene
      orbitControls.enabled = true;
    }

    // Increment score by time survived (rounded to 1 decimal)
    score += deltaTime;
    scoreEl.textContent = `Score: ${Math.floor(score)}`;
    if (score >= 10) speedMult = 1 + (score/100);
    else speedMult = .1 + (score/10);
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
  if (road && !gameOver){
    roadTex.offset.y += ROAD_SPEED * deltaTime * speedMult;
  }

  // OrbitControls requires update() each frame when damping is enabled
  if (gameOver) orbitControls.update();

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
