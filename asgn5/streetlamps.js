import * as THREE from 'three';
import { OBSTACLE_SPEED } from './obstacles.js';

let _scene;
const lamps = []; // active lamp groups in the scene

const LAMP_X_LEFT  = -30; // just outside the left edge of the road
const LAMP_X_RIGHT =  30; // just outside the right edge of the road
const LAMP_SPAWN_Z   = -500; // matches obstacle spawn distance
const LAMP_DESPAWN_Z =   50; // matches obstacle despawn distance
const LAMP_INTERVAL  =    2; // seconds between each pair of lamps
let lampTimer = 0;

export function initLamps(scene) {
  _scene = scene;
}

// Builds one street lamp group (pole + arm + head + point light) at (x, z)
function createLamp(x, z) {
  const group = new THREE.Group();

  // ── Pole — tall thin cylinder ──────────────────────────────────────────────
  const poleGeo = new THREE.CylinderGeometry(0.2, 0.3, 10, 8);
  const poleMat = new THREE.MeshPhongMaterial({ color: 0x666666 });
  const pole    = new THREE.Mesh(poleGeo, poleMat);
  pole.position.y = 5; // center at y=5 so the base sits on the ground
  pole.castShadow = true;
  group.add(pole);

  // ── Arm — short horizontal cylinder angled toward the road ─────────────────
  const armGeo = new THREE.CylinderGeometry(0.1, 0.1, 3, 8);
  const arm     = new THREE.Mesh(armGeo, poleMat);
  arm.rotation.z = Math.PI / 2; // rotate so cylinder points sideways
  // position arm at top of pole, extending inward toward road center
  arm.position.set(x < 0 ? 1.5 : -1.5, 10, 0);
  arm.castShadow = true;
  group.add(arm);

  // ── Lamp head — flat box at the end of the arm ─────────────────────────────
  // emissive makes it glow slightly even without direct light hitting it
  const headGeo = new THREE.BoxGeometry(1.2, 0.5, 1.2);
  const headMat = new THREE.MeshPhongMaterial({
    color: 0xffffaa,
    emissive: 0xffdd44,
    emissiveIntensity: 0.8,
  });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.set(x < 0 ? 3 : -3, 10, 0);
  group.add(head);

  // ── Point light — warm glow cast downward from the lamp head ───────────────
  // castShadow is off here — one shadow-casting light per lamp would be very expensive
  const light = new THREE.PointLight(0xffdd88, 80, 25);
  light.position.set(x < 0 ? 3 : -3, 10, 0);
  group.add(light);

  group.position.set(x, 0, z);
  _scene.add(group);
  lamps.push(group);
}

// Call every frame — spawns new lamp pairs and moves existing ones toward camera
export function updateLamps(delta) {
  lampTimer += delta;

  const lampOp = Math.floor(Math.random()*3);

  if (lampTimer >= LAMP_INTERVAL) {
    if (lampOp == 0){
      createLamp(LAMP_X_LEFT,  LAMP_SPAWN_Z);
    } else if (lampOp == 1) {
      createLamp(LAMP_X_RIGHT, LAMP_SPAWN_Z);
    }
    else{
      createLamp(LAMP_X_LEFT, LAMP_SPAWN_Z);
      createLamp(LAMP_X_RIGHT, LAMP_SPAWN_Z);
    }
    lampTimer = 0;
  }

  for (let i = lamps.length - 1; i >= 0; i--) {
    // Move at the same speed as obstacles so they feel tied to the road
    lamps[i].position.z += OBSTACLE_SPEED * delta;

    if (lamps[i].position.z > LAMP_DESPAWN_Z) {
      _scene.remove(lamps[i]);
      lamps.splice(i, 1);
    }
  }
}
