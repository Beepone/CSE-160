import * as THREE from 'three';
// OrbitControls lets the user rotate/zoom/pan the camera with the mouse
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// GLTFLoader lets us load external 3D model files (.glb / .gltf)
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
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

// Move the camera back and up so it isn't inside the objects at the origin
camera.position.set(0, 10, 30);

// ── Controls ──────────────────────────────────────────────────────────────────
// OrbitControls binds mouse input to the camera:
//   Left-drag  → rotate around the target point
//   Scroll     → zoom in/out
//   Right-drag → pan
const controls = new OrbitControls(camera, renderer.domElement);

// enableDamping adds a smooth inertia effect when you stop moving the mouse
controls.enableDamping = true;

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
// const boxTex = texLoader.load('textures/crate.png');
// Then pass it to a material: new THREE.MeshPhongMaterial({ map: boxTex })

// ── Primary Shapes ────────────────────────────────────────────────────────────
// In Three.js, a visible object (Mesh) is made of two parts:
//   Geometry — the shape/vertex data (BoxGeometry, SphereGeometry, etc.)
//   Material  — how the surface looks (color, texture, shininess, etc.)
// You combine them: new THREE.Mesh(geometry, material)

const shapes = []; // we'll store animated meshes here so the animation loop can access them

// --- Cube ---
// BoxGeometry(width, height, depth)
const cubeGeo = new THREE.BoxGeometry(2, 2, 2);
// MeshPhongMaterial supports shininess and reacts to light sources
const cubeMat = new THREE.MeshPhongMaterial({ color: 0x44aa88 });
const cube = new THREE.Mesh(cubeGeo, cubeMat);
cube.position.set(0, 2, 0); // lift it above the ground (y = half its height)
cube.castShadow = true;      // this mesh will cast a shadow on other surfaces
scene.add(cube);
shapes.push(cube);

// --- Sphere ---
// SphereGeometry(radius, widthSegments, heightSegments)
// More segments = smoother sphere, but heavier on the GPU
const sphereGeo = new THREE.SphereGeometry(1, 32, 32);
const sphereMat = new THREE.MeshPhongMaterial({ color: 0xcc4444 });
const sphere = new THREE.Mesh(sphereGeo, sphereMat);
sphere.position.set(4, 1, 0);
sphere.castShadow = true;
scene.add(sphere);
shapes.push(sphere);

// --- Cylinder ---
// CylinderGeometry(radiusTop, radiusBottom, height, radialSegments)
// Setting both radii equal makes a straight cylinder; different values make a cone/frustum
const cylGeo = new THREE.CylinderGeometry(0.7, 0.7, 3, 32);
const cylMat = new THREE.MeshPhongMaterial({ color: 0x4488cc });
const cyl = new THREE.Mesh(cylGeo, cylMat);
cyl.position.set(-4, 1.5, 0); // y = half height so the bottom sits on the ground
cyl.castShadow = true;
scene.add(cyl);
shapes.push(cyl);

// --- Ground Plane ---
// PlaneGeometry(width, height) — a flat rectangle lying in the XY plane by default
const groundGeo = new THREE.PlaneGeometry(100, 100);
const groundMat = new THREE.MeshPhongMaterial({ color: 0x888888 });
const ground = new THREE.Mesh(groundGeo, groundMat);
// Rotate -90° around X to make it lie flat (it starts standing upright)
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true; // allow shadows from other objects to appear on this surface
scene.add(ground);

// ── Skybox ────────────────────────────────────────────────────────────────────
// scene.background can be a solid color, a texture, or a CubeTexture (6-sided skybox).
// For now we use a placeholder sky-blue color.
// TODO: load 6 images (px, nx, py, ny, pz, nz) into textures/skybox/ then replace this with:
//   const cubeLoader = new THREE.CubeTextureLoader();
//   scene.background = cubeLoader.setPath('textures/skybox/').load(['px.jpg','nx.jpg','py.jpg','ny.jpg','pz.jpg','nz.jpg']);
scene.background = new THREE.Color(0x87ceeb); // placeholder sky-blue

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
    object.position.y = .320;
    object.position.z = 20;
    object.rotation.y = Math.PI;
    scene.add(object);
  });
});

// ── Animation Loop ────────────────────────────────────────────────────────────
// requestAnimationFrame calls our function before the next screen repaint (~60 fps).
// Three.js passes the elapsed time in milliseconds as the argument 't'.
function animate(t) {
  requestAnimationFrame(animate); // schedule the next frame

  const time = t * 0.001; // convert ms → seconds for easier math

  // Rotate the cube continuously — incrementing rotation each frame
  cube.rotation.x = time;       // one full rotation every ~6 seconds
  cube.rotation.y = time * 0.7; // slightly slower on Y so it looks interesting

  // Bob the sphere up and down using a sine wave
  // sin() oscillates between -1 and 1, so this moves the sphere ±0.8 units
  sphere.position.y = 2 + Math.sin(time * 2) * 0.8;

  controls.update(); // required every frame when enableDamping is true
  renderer.render(scene, camera); // draw the current frame
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
