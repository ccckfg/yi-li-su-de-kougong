// Bake the S14 grain spill with cannon-es (deterministic). Units: centimetres internally, metres in output.
// node tools_bake_grains.mjs  ->  public/data/grains_s14.json
import * as CANNON from "cannon-es";
import { writeFileSync, mkdirSync } from "node:fs";

const FPS = 24;
const DUR = 3.2; // seconds of simulation recorded (spill start = t0)
const SUB = 16; // substeps per frame
const N = 260;

// mouth of the tipped envelope (metres, world) and outflow direction (front-right into the lamp pool)
const MOUTH = [-0.168, 0.012, 0.104];
const DIR = [0.48, 0, 0.88];

let seed = 1234567;
const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -981, 0) });
world.broadphase = new CANNON.SAPBroadphase(world);
world.allowSleep = true;
world.solver.iterations = 14;

const grainMat = new CANNON.Material("grain");
const woodMat = new CANNON.Material("wood");
world.addContactMaterial(new CANNON.ContactMaterial(grainMat, woodMat, { friction: 0.3, restitution: 0.3 }));
world.addContactMaterial(new CANNON.ContactMaterial(grainMat, grainMat, { friction: 0.3, restitution: 0.15 }));

const ground = new CANNON.Body({ mass: 0, material: woodMat, shape: new CANNON.Plane() });
ground.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
world.addBody(ground);

// the lying envelope itself is a low box the grains can rest against / roll off
const env = new CANNON.Body({ mass: 0, material: woodMat, shape: new CANNON.Box(new CANNON.Vec3(5.7, 1.1, 8.0)) });
env.position.set(-25 - 0.48 * 7.4, 1.1, -4 - 0.88 * 7.4);
env.quaternion.setFromEuler(0, Math.atan2(DIR[0], DIR[2]), 0);
world.addBody(env);

// convex ellipsoid (icosphere, 1 subdivision) so grains settle lying flat like real hulled millet
function ellipsoidShape(a, b, c) {
  const t = (1 + Math.sqrt(5)) / 2;
  let v = [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]];
  let f = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];
  const mid = new Map();
  const key = (i, j) => (i < j ? `${i}_${j}` : `${j}_${i}`);
  const m = (i, j) => {
    const k = key(i, j);
    if (!mid.has(k)) { const p = v[i].map((x, d) => (x + v[j][d]) / 2); v.push(p); mid.set(k, v.length - 1); }
    return mid.get(k);
  };
  const nf = [];
  for (const [i, j, k] of f) { const a1 = m(i, j), b1 = m(j, k), c1 = m(k, i); nf.push([i, a1, c1], [j, b1, a1], [k, c1, b1], [a1, b1, c1]); }
  f = nf;
  const verts = v.map((p) => { const l = Math.hypot(...p); return new CANNON.Vec3((p[0] / l) * a, (p[1] / l) * b, (p[2] / l) * c); });
  return new CANNON.ConvexPolyhedron({ vertices: verts, faces: f });
}
const GRAIN_R = [0.105, 0.084, 0.066]; // cm half-axes: ~2.1 x 1.7 x 1.3 mm

const grains = [];
const spawnT = [];
for (let i = 0; i < N; i++) {
  // the flow is front-loaded: a gush, then a trickle
  const u = rnd();
  spawnT.push(0.05 + Math.pow(u, 1.8) * 0.75);
}
spawnT.sort((a, b) => a - b);

const frames = [];
const nFrames = Math.round(DUR * FPS);
const dt = 1 / FPS / SUB;
let t = 0;
let next = 0;
for (let f = 0; f <= nFrames; f++) {
  const rec = new Float32Array(N * 7);
  for (let s = 0; s < SUB; s++) {
    while (next < N && spawnT[next] <= t) {
      // two overlapping spheres along local x: cheap, and settles with the long axis horizontal like a real grain
      const b = new CANNON.Body({ mass: 1, material: grainMat, linearDamping: 0.08, angularDamping: 0.12, allowSleep: true, sleepSpeedLimit: 0.6, sleepTimeLimit: 0.4 });
      b.addShape(new CANNON.Sphere(0.072), new CANNON.Vec3(0.032, 0, 0));
      b.addShape(new CANNON.Sphere(0.072), new CANNON.Vec3(-0.032, 0, 0));
      const side = (rnd() - 0.5) * 2.4; // across the mouth width (cm)
      const lift = rnd() * 0.9;
      b.position.set(MOUTH[0] * 100 + DIR[2] * side, MOUTH[1] * 100 + 0.25 + lift, MOUTH[2] * 100 - DIR[0] * side);
      const sp = 14 + rnd() * 38 * (1 - (next / N) * 0.5);
      const spread = (rnd() - 0.5) * 1.3;
      const dx = DIR[0] * Math.cos(spread) + DIR[2] * Math.sin(spread);
      const dz = DIR[2] * Math.cos(spread) - DIR[0] * Math.sin(spread);
      b.velocity.set(dx * sp, -4 - rnd() * 6, dz * sp);
      b.angularVelocity.set((rnd() - 0.5) * 40, (rnd() - 0.5) * 40, (rnd() - 0.5) * 40);
      b.quaternion.setFromEuler(rnd() * 6.28, rnd() * 6.28, rnd() * 6.28);
      world.addBody(b);
      grains[next] = b;
      next++;
    }
    world.step(dt);
    t += dt;
  }
  for (let i = 0; i < N; i++) {
    const b = grains[i];
    if (!b) {
      rec.set([MOUTH[0], -1, MOUTH[2], 0, 0, 0, 1], i * 7); // not spawned yet: parked below the desk
      continue;
    }
    rec.set([b.position.x / 100, b.position.y / 100, b.position.z / 100, b.quaternion.x, b.quaternion.y, b.quaternion.z, b.quaternion.w], i * 7);
  }
  frames.push(Array.from(rec, (v) => Math.round(v * 1e5) / 1e5));
}

// hero grain: settled, inside the lamp pool, not touching neighbours too closely
const last = frames[frames.length - 1];
let best = -1;
let bestScore = 1e9;
for (let i = 0; i < N; i++) {
  const x = last[i * 7];
  const z = last[i * 7 + 2];
  if (last[i * 7 + 1] < 0) continue;
  let near = 1e9;
  for (let j = 0; j < N; j++) {
    if (j === i || last[j * 7 + 1] < 0) continue;
    near = Math.min(near, Math.hypot(last[j * 7] - x, last[j * 7 + 2] - z));
  }
  const target = Math.hypot(x - -0.05, z - 0.2);
  const score = target + (near < 0.012 ? 1 : 0);
  if (score < bestScore) {
    bestScore = score;
    best = i;
  }
}
mkdirSync("public/data", { recursive: true });
writeFileSync("public/data/grains_s14.json", JSON.stringify({ fps: FPS, n: N, hero: best, radii: GRAIN_R.map((r) => r / 100), frames }));
console.log("frames", frames.length, "hero", best, "at", last.slice(best * 7, best * 7 + 3));
