/**
 * Offline asset check. Run from the project root:
 *   node scripts/check-nocturne.mjs
 * No npm packages or changes to the assets are needed.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import assert from "node:assert/strict";

const folder = resolve(process.cwd(), "public/experience/nocturne");
let failures = 0;
for (const name of ["rafa-nocturne", "rafa-nocturne-lite"]) {
  try {
    const modelPath = resolve(folder, `${name}.glb`);
    const jsonPath = resolve(folder, `${name}.json`);
    assert(existsSync(modelPath), `Missing ${modelPath}`);
    assert(existsSync(jsonPath), `Missing ${jsonPath}`);
    const bytes = readFileSync(modelPath);
    assert(bytes.readUInt32LE(0) === 0x46546c67, "File is not a GLB");
    assert(bytes.readUInt32LE(4) === 2, "GLB must be version 2");
    assert(bytes.readUInt32LE(8) === bytes.length, "GLB length header does not match file size");
    const jsonLength = bytes.readUInt32LE(12);
    assert(bytes.readUInt32LE(16) === 0x4e4f534a, "GLB JSON chunk missing");
    const gltf = JSON.parse(bytes.subarray(20, 20 + jsonLength).toString("utf8").trim());
    const manifest = JSON.parse(readFileSync(jsonPath, "utf8"));
    assert(manifest.schemaVersion === 1, "Unexpected manifest version");
    assert(manifest.asset === `${name}.glb`, "GLB and JSON do not match");
    const nodes = new Map((gltf.nodes ?? []).map((node) => [node.name, node]));
    const clips = new Map((gltf.animations ?? []).map((clip) => [clip.name, clip]));
    for (const zone of manifest.zones) assert(nodes.has(zone), `Missing zone ${zone}`);
    for (const interaction of Object.values(manifest.interactions)) {
      assert(nodes.has(interaction.node), `Missing interaction node ${interaction.node}`);
    }
    for (const key of ["CAM_Hub_Desktop", "CAM_Hub_Mobile", "CAM_Rafa_Close"]) {
      assert(manifest.cameras[key], `Missing camera ${key}`);
    }
    for (const room of ["gallery", "workshop", "archive", "office"]) {
      const route = manifest.routes[room];
      assert(route && nodes.has(route.hinge), `Missing ${room} route or hinge`);
      for (const key of [`CAM_${room}_Desktop`, `CAM_${room}_Mobile`]) {
        assert(manifest.cameras[key], `Missing camera ${key}`);
      }
      assert(clips.has(route.doorOpenClip), `Missing ${route.doorOpenClip}`);
      assert(clips.has(route.doorCloseClip), `Missing ${route.doorCloseClip}`);
      assert(route.positions.length === route.targets.length && route.positions.length === route.knots.length,
        `Mismatched route array lengths in ${room}`);
      assert(route.knots[0] === 0 && route.knots.at(-1) === 1, `Bad route timing in ${room}`);
      for (let i = 1; i < route.knots.length; i++) assert(route.knots[i] > route.knots[i - 1]);
      const animation = clips.get(route.doorOpenClip);
      const duration = Math.max(...animation.samplers.map((sample) => gltf.accessors[sample.input].max?.[0] ?? 0));
      assert((route.crossAt - route.openAt) * route.duration >= duration,
        `Door ${room} would not finish opening before the camera approaches the threshold`);
    }
    for (const name of [...manifest.ambientClips, manifest.greetingClip]) {
      assert(clips.has(name), `Missing animation ${name}`);
    }
    assert((gltf.images ?? []).every((image) => Number.isInteger(image.bufferView)),
      "Some GLB images are external files; keep them available or re-export embedded textures");
    console.log(`PASS ${name}: ${(bytes.length / 1048576).toFixed(2)} MiB, ${nodes.size} named nodes, ${clips.size} animation clips; embedded images.`);
  } catch (error) {
    failures++;
    console.error(`FAIL ${name}: ${error.message}`);
  }
}
if (failures) {
  console.error(`\n${failures} asset set(s) failed. Fix paths/pairs before running the scene.`);
  process.exitCode = 1;
} else {
  console.log("\nBoth asset sets match the studio integration. Next: npm run build");
}
