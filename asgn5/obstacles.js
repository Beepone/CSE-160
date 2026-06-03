import * as THREE from 'three';

// These are set once by initObstacles() and reused by all functions in this file
let _scene;
let _lanes;

export const obstacles = []; // active obstacle meshes currently in the scene

// Constants — tune these to change game feel
export const SPAWN_Z = -200;       // Z where obstacles appear (far ahead of car)
export const DESPAWN_Z = 100;     // Z where obstacles are removed (behind camera)
export const OBSTACLE_SPEED = 150; // units per second
export const SPAWN_INTERVAL = .2; // seconds between spawns
export let spawnTimer = 0;

// Call this once at startup to give this module access to the scene and lane data
export function initObstacles(scene, lanes) {
  _scene = scene;
  _lanes = lanes;
}

// Creates one obstacle in a random lane and adds it to the scene
export function spawnObstacle() {
  // 1. Pick a random lane
  const randLane = Math.floor(Math.random()*_lanes.length);

  const lane = _lanes[randLane];

  // 2. Pick a random geometry type
  const type = Math.floor(Math.random()*3);
  let geo;
  if (type === 0)      geo = new THREE.BoxGeometry(2, 2, 2);
  else if (type === 1) geo = new THREE.SphereGeometry(1, 32, 32);
  else                 geo = new THREE.CylinderGeometry(.7, .7, 3, 32);

  // 3. Pick a random color
  const colors = [0x44aa88, 0xcc4444, 0x4488cc];
  const mat = new THREE.MeshPhongMaterial({ color: colors[Math.floor(Math.random()*colors.length)] });

  // 4. Build mesh, place it, add to scene and tracking array
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(lane, getY(type), SPAWN_Z);
  mesh.castShadow = true;
  _scene.add(mesh);
  obstacles.push(mesh);
}

function getY(type){
  if (type === 0) return 2;
  if (type === 1) return 1;
  else return 1.5;
}

// Call this every frame — moves obstacles, despawns old ones, checks collisions
// Returns true if the car was hit, false otherwise
export function updateObstacles(delta, car) {
  spawnTimer += delta;

  if (spawnTimer >= SPAWN_INTERVAL) {
    spawnObstacle();
    spawnTimer = 0;
  }

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];

    // Move toward the player
    obs.position.z += OBSTACLE_SPEED * delta;

    // Despawn if it passed behind the camera
    if (obs.position.z > DESPAWN_Z) {
      _scene.remove(obs);
      obstacles.splice(i, 1); // remove from array without leaving a gap
      continue;
    }

    // Collision check against the car
    if (car) {
      const carBox = new THREE.Box3().setFromCenterAndSize(
        car.position,
      new THREE.Vector3(4,4,4));
      const obsBox = new THREE.Box3().setFromObject(obstacles[i]);
      if (carBox.intersectsBox(obsBox)) {
        return true; // hit!
      }
    }
  }

  return false; // no collision
}
