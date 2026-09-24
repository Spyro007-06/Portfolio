// Run: node world/timeline.check.ts — fails loudly if the film's edit is inconsistent.
import assert from "node:assert/strict";
import { MOUNT as MOUNT_CHECK, PROJECT_SPANS, WORLD_TIMELINE, progressBetween, sceneAt, sceneProgress } from "./timeline.ts";

const scenes = Object.values(WORLD_TIMELINE);
assert.equal(scenes[0].start, 0);
assert.equal(scenes.at(-1)!.end, 1);
scenes.slice(1).forEach((s, i) => assert.equal(s.start, scenes[i].end, `gap before scene ${i + 1}`));

assert.equal(PROJECT_SPANS[0].start, WORLD_TIMELINE.projects.start);
assert.ok(Math.abs(PROJECT_SPANS.at(-1)!.end - WORLD_TIMELINE.projects.end) < 1e-9);

assert.equal(progressBetween(0.5, 0.4, 0.6), 0.5);
assert.equal(progressBetween(-1, 0, 1), 0);
assert.ok(Math.abs(sceneProgress(0.165, "gate") - 0.5) < 1e-9);
assert.equal(sceneAt(0.6), "projects");
assert.equal(sceneAt(1), "transmission");
console.log("timeline ok");

// camera keyframes must be strictly increasing and span the whole film
const { SHOTS } = await import("./camera/path.ts");
SHOTS.slice(1).forEach((s, i) => assert.ok(s[0] > SHOTS[i][0], `shot ${i + 1} (t=${s[0]}) is not after t=${SHOTS[i][0]}`));
assert.equal(SHOTS[0][0], 0);
assert.equal(SHOTS.at(-1)![0], 1);
console.log(`camera ok (${SHOTS.length} shots)`);

// scroll sensitivity assertions (Section 16)
const { responsiveScrollProgress, scrollFromFilmProgress } = await import("../components/film/scroll.ts");
assert.equal(responsiveScrollProgress(0), 0);
assert.equal(responsiveScrollProgress(1), 1);
assert.ok(responsiveScrollProgress(0.15) > 0.15, "0–15% scroll must have higher world movement per scroll input");
assert.ok(Math.abs(responsiveScrollProgress(0.15) - 0.19) < 1e-6, "0.15 scroll must smoothly reach Gate at p=0.19");

// strictly monotonic check
for (let s = 0; s < 1.0; s += 0.005) {
  assert.ok(responsiveScrollProgress(s + 0.005) > responsiveScrollProgress(s), `scroll mapping not strictly monotonic at s=${s}`);
}

// inverse convergence check for chapter navigation
for (let p = 0; p <= 1.0; p += 0.02) {
  const s = scrollFromFilmProgress(p);
  const pRecovered = responsiveScrollProgress(s);
  assert.ok(Math.abs(pRecovered - p) < 1e-4, `inverse failed at p=${p}: got s=${s}, pRecovered=${pRecovered}`);
}
console.log("scroll responsiveness ok");

// cinematic lighting system assertions (Section 11)
const { CINEMATIC_LIGHTING, createLightingState, sampleCinematicLighting } = await import("./lighting.ts");
const lightState = createLightingState();
const prevLightState = createLightingState();

for (let t = 0; t <= 1.0; t += 0.01) {
  sampleCinematicLighting(t, lightState);
  assert.ok(!Number.isNaN(lightState.ambientIntensity), `NaN ambient intensity at t=${t}`);
  assert.ok(!Number.isNaN(lightState.keyIntensity), `NaN key intensity at t=${t}`);
  assert.ok(!Number.isNaN(lightState.rimIntensity), `NaN rim intensity at t=${t}`);
  assert.ok(!Number.isNaN(lightState.emissiveIntensity), `NaN emissive intensity at t=${t}`);
  assert.ok(!Number.isNaN(lightState.fogDensity), `NaN fog density at t=${t}`);

  // Visual balance check (Section 19): Base background must remain dark/neutral
  assert.ok(lightState.bg.r < 0.15 && lightState.bg.g < 0.15 && lightState.bg.b < 0.15, `Background too bright at t=${t}`);
  // Ambient fill is controlled (approx 20% of lighting budget)
  assert.ok(lightState.ambientIntensity <= 0.35, `Ambient fill too strong at t=${t}`);
}

// Section 18: Continuous atmospheric mixing across scene boundaries (no hard color cut)
for (let t = 0.005; t <= 1.0; t += 0.005) {
  sampleCinematicLighting(t - 0.005, prevLightState);
  sampleCinematicLighting(t, lightState);
  const colorDelta = Math.abs(lightState.keyColor.r - prevLightState.keyColor.r) +
                     Math.abs(lightState.keyColor.g - prevLightState.keyColor.g) +
                     Math.abs(lightState.keyColor.b - prevLightState.keyColor.b);
  assert.ok(colorDelta < 0.35, `Hard color cut detected at t=${t} (delta=${colorDelta})`);
}

// Section 18 keyframes check: Transitional lighting keyframes exist before major scene entries
const keyframeTimes = CINEMATIC_LIGHTING.map((k) => k.t);
assert.ok(keyframeTimes.includes(0.36), "Archive exit transitional amber keyframe (t=0.36) missing");
assert.ok(keyframeTimes.includes(0.49), "Workshop portal transitional violet keyframe (t=0.49) missing");
assert.ok(keyframeTimes.includes(0.71), "Project exit corridor transitional green keyframe (t=0.71) missing");
assert.ok(keyframeTimes.includes(0.83), "Lab exit transitional warm light keyframe (t=0.83) missing");
assert.ok(keyframeTimes.includes(0.94), "Observation exit transitional keyframe (t=0.94) missing");

// Section 13: Compressed scroll timeline allocations
assert.equal(WORLD_TIMELINE.signal.end, 0.02, "Signal must end at 2%");
assert.equal(WORLD_TIMELINE.signalField.end, 0.10, "Signal field must end at 10%");
assert.equal(WORLD_TIMELINE.gate.end, 0.23, "The gate must end at 23%");
assert.equal(WORLD_TIMELINE.archive.end, 0.37, "Archive must end at 37%");
assert.equal(WORLD_TIMELINE.workshop.end, 0.50, "Workshop must end at 50%");
assert.equal(WORLD_TIMELINE.projects.end, 0.72, "Projects must end at 72%");
assert.equal(WORLD_TIMELINE.lab.end, 0.84, "Lab must end at 84%");
assert.equal(WORLD_TIMELINE.observation.end, 0.94, "Observation must end at 94%");
assert.equal(WORLD_TIMELINE.transmission.end, 1.0, "Transmission must end at 100%");

// Section 17 & Mount intervals: Verify all scenes mount before start and unmount after end
const { MOUNT } = await import("./timeline.ts");
for (const [key, span] of Object.entries(WORLD_TIMELINE)) {
  const mountSpan = MOUNT[key as keyof typeof MOUNT];
  assert.ok(mountSpan, `Mount span missing for scene ${key}`);
  assert.ok(mountSpan.start <= span.start, `Scene ${key} mounts too late: mount ${mountSpan.start} > scene start ${span.start}`);
  assert.ok(mountSpan.end >= span.end, `Scene ${key} unmounts too early: mount ${mountSpan.end} < scene end ${span.end}`);
}

// Section 5 & 12: Material library exports and physical responses
const { M, glow } = await import("./materials.ts");
assert.ok(M.concrete && M.darkConcrete, "Concrete materials missing");
assert.ok(M.brushedMetal, "Brushed metal material missing");
assert.ok(M.darkReflective, "Dark reflective material missing");
assert.ok(M.paper, "Paper material missing");
assert.ok(M.translucentPlastic, "Translucent plastic material missing");
assert.ok(M.screen, "Screen / glass material missing");
assert.ok(glow("#ff8833", 2), "Glow caching function failed");

// Section 5: Verify distinct physical material responses (standard material roughness, metalness, transparency)
assert.equal(M.screen.type, "MeshStandardMaterial", "Screen must have physical PBR response");
assert.equal(M.translucentPlastic.type, "MeshStandardMaterial", "Translucent plastic must have physical PBR response");
assert.ok(M.screen.transparent && M.screen.roughness < 0.3, "Screen must be specular glass");
assert.ok(M.translucentPlastic.transparent && M.translucentPlastic.roughness > 0.3, "Plastic must have diffuse plastic sheen");

// Section 2: Verify t=0.0 lighting conditions (deep navy key, dark background, tiny rim)
sampleCinematicLighting(0.0, lightState);
assert.ok(lightState.bg.r < 0.05 && lightState.bg.g < 0.05 && lightState.bg.b < 0.05, "t=0 background must be near-black");
assert.equal(lightState.keyColor.getHexString(), "182d4a", "t=0 key light must be deep navy (#182d4a)");

// verify freeze to black at t=1.0 (Section 10)
sampleCinematicLighting(1.0, lightState);
assert.equal(lightState.keyIntensity, 0);
assert.equal(lightState.ambientIntensity, 0);
assert.equal(lightState.emissiveIntensity, 0);
console.log("cinematic lighting, materials & visual hierarchy ok");


// anything visible in the opening shot must be mounted at frame zero (the gate doors hide the interior)
assert.equal(MOUNT_CHECK.gate.start, 0, "gate must be mounted from 0 or the interior shows through the wall");
console.log("mount windows ok");
