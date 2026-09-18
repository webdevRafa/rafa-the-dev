import type { RoomId, StudioManifest, ZoneId } from "./studio-controller";

const ROOMS: RoomId[] = ["gallery", "workshop", "archive", "office"];
const ZONES: ZoneId[] = ["Hub", "Gallery", "Workshop", "Archive", "Office"];

function record(value: unknown, name: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Invalid studio manifest: ${name} must be an object.`);
  }
  return value as Record<string, unknown>;
}
function vec3(value: unknown): boolean {
  return Array.isArray(value) && value.length === 3 &&
    value.every((n) => typeof n === "number" && Number.isFinite(n));
}
function finite(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}
function fail(detail: string): never {
  throw new Error(`Invalid studio manifest: ${detail}. Use the JSON exported beside this GLB.`);
}

/** Validate the actual downloaded JSON before any camera or door uses it. */
export function parseStudioManifest(value: unknown, expectedAsset: string): StudioManifest {
  const data = record(value, "root");
  if (data.schemaVersion !== 1) fail("unsupported schema version");
  if (data.asset !== expectedAsset) fail(`asset must be ${expectedAsset}`);
  if (!Array.isArray(data.zones) || !ZONES.every((z) => (data.zones as unknown[]).includes(z))) {
    fail("missing room roots");
  }
  const cameras = record(data.cameras, "cameras");
  const requiredCameras = ["CAM_Hub_Desktop", "CAM_Hub_Mobile", "CAM_Rafa_Close"];
  for (const room of ROOMS) requiredCameras.push(`CAM_${room}_Desktop`, `CAM_${room}_Mobile`);
  for (const name of requiredCameras) if (!cameras[name]) fail(`missing ${name}`);
  for (const [name, raw] of Object.entries(cameras)) {
    const c = record(raw, name);
    if (!vec3(c.position) || !vec3(c.target) || !finite(c.verticalFovDegrees) ||
        c.verticalFovDegrees < 10 || c.verticalFovDegrees > 110) fail(`bad camera ${name}`);
  }
  const routes = record(data.routes, "routes");
  for (const room of ROOMS) {
    const r = record(routes[room], `routes.${room}`);
    if (!Array.isArray(r.positions) || r.positions.length < 2 || !r.positions.every(vec3) ||
        !Array.isArray(r.targets) || r.targets.length !== r.positions.length || !r.targets.every(vec3) ||
        !Array.isArray(r.knots) || r.knots.length !== r.positions.length || !r.knots.every(finite)) {
      fail(`bad route arrays for ${room}`);
    }
    const knots = r.knots as number[];
    if (knots[0] !== 0 || knots[knots.length - 1] !== 1 ||
        knots.some((n, i) => i > 0 && n <= knots[i - 1])) fail(`bad route timing for ${room}`);
    for (const field of ["title", "hinge", "doorOpenClip", "doorCloseClip", "contentAnchor"]) {
      if (typeof r[field] !== "string" || !r[field]) fail(`missing ${field} for ${room}`);
    }
    if (!ZONES.includes(r.roomRoot as ZoneId) || !finite(r.duration) || r.duration <= 0 ||
        !finite(r.openAt) || !finite(r.crossAt) || r.openAt < 0 || r.crossAt > 1 || r.openAt >= r.crossAt) {
      fail(`bad route settings for ${room}`);
    }
  }
  const interactions = record(data.interactions, "interactions");
  for (const [name, raw] of Object.entries(interactions)) {
    const item = record(raw, name);
    if (item.node !== name || typeof item.kind !== "string" || typeof item.label !== "string") {
      fail(`bad interaction ${name}`);
    }
    if (item.room !== undefined && !ROOMS.includes(item.room as RoomId)) fail(`unknown room in ${name}`);
  }
  if (!Array.isArray(data.ambientClips) || !data.ambientClips.every((x) => typeof x === "string") ||
      typeof data.greetingClip !== "string") fail("bad animation names");
  return data as unknown as StudioManifest;
}
