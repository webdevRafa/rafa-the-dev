/**
 * Nocturne Studio — framework-independent Three.js navigation controller.
 * Use with the generated GLB + matching JSON. Mount the GLB at world origin,
 * rotation [0,0,0], scale 1. The file already uses glTF Y-up coordinates.
 *
 * Integration contract, not a replacement for App.tsx or the Firebase form.
 * No runtime dependency beyond the `three` package your project already uses.
 */
import {
  AnimationMixer, LoopOnce, LoopRepeat, MathUtils, Mesh, PerspectiveCamera,
  Raycaster, Vector2, Vector3, Light, SpotLight, DirectionalLight,
} from "three";
import type { AnimationAction, AnimationClip, Object3D } from "three";

export type RoomId = "gallery" | "workshop" | "archive" | "office";
export type ZoneId = "Hub" | "Gallery" | "Workshop" | "Archive" | "Office";
type Vec3 = [number, number, number];
type Pose = { position: Vector3; target: Vector3; fov: number };
export type Interaction = {
  kind: string; node: string; label: string; room?: RoomId;
  projectId?: string; zone?: string;
};
type Route = {
  roomRoot: ZoneId; title: string; hinge: string;
  doorOpenClip: string; doorCloseClip: string;
  positions: Vec3[]; targets: Vec3[]; knots: number[];
  duration: number; openAt: number; crossAt: number; contentAnchor: string;
};
export type StudioManifest = {
  schemaVersion: number; asset: string; zones: ZoneId[];
  cameras: Record<string, { position: Vec3; target: Vec3; verticalFovDegrees: number }>;
  routes: Record<RoomId, Route>; interactions: Record<string, Interaction>;
  ambientClips: string[]; greetingClip: string;
  render?: {
    exposure?: number; background?: string; ambientIntensity?: number;
    desktopMaxDpr?: number; mobileMaxDpr?: number;
  };
};
export type StudioContent = { kind: string; id: string; anchor?: string };
export type StudioOptions = {
  mobile?: boolean; reducedMotion?: boolean;
  onBusy?: (busy: boolean) => void;
  onZone?: (zone: ZoneId) => void;
  /** null closes the current HTML panel. Leave long text/forms in the DOM. */
  onContent?: (content: StudioContent | null) => void;
};
type Journey = {
  points: Vector3[]; looks: Vector3[]; knots: number[];
  fovStart: number; fovEnd: number; elapsed: number; duration: number;
  room?: RoomId; direction?: "enter" | "exit"; doorStarted: boolean;
  onComplete: () => void;
};

export class StudioController {
  readonly model: Object3D;
  readonly camera: PerspectiveCamera;
  readonly manifest: StudioManifest;
  readonly mixer: AnimationMixer;
  private options: StudioOptions;
  private actions = new Map<string, AnimationAction>();
  private zones = new Map<ZoneId, Object3D>();
  private clickables: Object3D[] = [];
  private raycaster = new Raycaster();
  private pointer = new Vector2();
  private look = new Vector3();
  private direction = new Vector3();
  private zone: ZoneId = "Hub";
  private room: RoomId | null = null;
  private journey: Journey | null = null;
  private focused = false;
  private focusReturn: Pose | null = null;
  private idlePose: Pose;
  private yaw = 0;
  private pitch = 0;
  private age = 0;
  private fire: Light | null = null;
  private fireBase = 0;
  private disposed = false;
  private up = new Vector3(0, 1, 0);

  constructor(model: Object3D, camera: PerspectiveCamera, clips: AnimationClip[], manifest: StudioManifest, options: StudioOptions = {}) {
    if (manifest.schemaVersion !== 1) throw new Error("Unsupported studio manifest version.");
    this.model = model;
    this.camera = camera;
    this.manifest = manifest;
    this.options = options;
    this.mixer = new AnimationMixer(model);
    for (const clip of clips) this.actions.set(clip.name, this.mixer.clipAction(clip));
    for (const name of manifest.zones) this.zones.set(name, this.requireNode(name));
    for (const value of Object.values(manifest.interactions)) this.clickables.push(this.requireNode(value.node));
    model.traverse((object) => {
      if (object instanceof Light && object.name.toLowerCase().includes("fire")) this.fire = object;
    });
    this.fireBase = this.fire?.intensity ?? 0;
    // Fail during loading, not after a visitor has already entered a door.
    for (const room of Object.values(manifest.routes)) {
      this.requireNode(room.hinge);
      for (const clip of [room.doorOpenClip, room.doorCloseClip]) {
        if (!this.actions.has(clip)) throw new Error(`Studio GLB is missing animation: ${clip}`);
      }
    }
    this.idlePose = this.readPose(this.hubCameraName());
    this.applyPose(this.idlePose);
    this.showZones("Hub");
    this.startAmbient();
    this.model.updateMatrixWorld(true);
  }

  get busy(): boolean { return this.journey !== null; }
  get currentZone(): ZoneId { return this.zone; }
  get isFocused(): boolean { return this.focused; }

  private requireNode(name: string): Object3D {
    const node = this.model.getObjectByName(name);
    if (!node) throw new Error(`Studio model is missing required node: ${name}`);
    return node;
  }
  private hubCameraName(): string { return this.options.mobile ? "CAM_Hub_Mobile" : "CAM_Hub_Desktop"; }
  private roomCameraName(room: RoomId): string { return `CAM_${room}_${this.options.mobile ? "Mobile" : "Desktop"}`; }
  private readPose(name: string): Pose {
    const p = this.manifest.cameras[name];
    if (!p) throw new Error(`Studio manifest is missing camera: ${name}`);
    return { position: new Vector3(...p.position), target: new Vector3(...p.target), fov: p.verticalFovDegrees };
  }
  private snapshot(): Pose {
    return { position: this.camera.position.clone(), target: this.look.clone(), fov: this.camera.fov };
  }
  private applyPose(p: Pose): void {
    this.camera.position.copy(p.position);
    this.look.copy(p.target);
    this.camera.lookAt(this.look);
    this.camera.fov = p.fov;
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();
  }
  private showZones(...visible: ZoneId[]): void {
    for (const [name, object] of this.zones) object.visible = visible.includes(name);
  }
  private startAmbient(): void {
    for (const name of this.manifest.ambientClips) {
      const action = this.actions.get(name);
      if (!action) continue;
      if (this.options.reducedMotion) action.stop();
      else if (!action.isRunning()) action.reset().setLoop(LoopRepeat, Infinity).play();
    }
  }
  private playDoor(room: RoomId, opening: boolean): void {
    const r = this.manifest.routes[room];
    this.actions.get(opening ? r.doorCloseClip : r.doorOpenClip)?.stop();
    const a = this.actions.get(opening ? r.doorOpenClip : r.doorCloseClip);
    if (!a) throw new Error(`Missing door animation: ${room}`);
    a.reset().setLoop(LoopOnce, 1);
    a.clampWhenFinished = true;
    a.enabled = true;
    a.play();
  }
  private setDoor(room: RoomId, opening: boolean): void {
    const r = this.manifest.routes[room];
    this.actions.get(r.doorOpenClip)?.stop();
    this.actions.get(r.doorCloseClip)?.stop();
    const hinge = this.requireNode(r.hinge);
    const angle = Number(hinge.userData.openRadians ?? (108 * Math.PI / 180));
    hinge.quaternion.setFromAxisAngle(new Vector3(0, 1, 0), opening ? angle : 0);
  }
  private begin(j: Journey): void {
    this.journey = j;
    this.yaw = this.pitch = 0;
    this.options.onContent?.(null);
    this.options.onBusy?.(true);
  }

  /** Same entry point for a mesh click, a mobile menu button, or keyboard UI. */
  enter(room: RoomId): boolean {
    if (this.disposed || this.busy || this.zone !== "Hub" || this.focused) return false;
    const r = this.manifest.routes[room];
    if (!r) return false;
    const landing = this.readPose(this.roomCameraName(room));
    this.showZones("Hub", r.roomRoot);
    const finish = () => {
      this.room = room; this.zone = r.roomRoot; this.idlePose = landing;
      this.applyPose(landing); this.showZones(r.roomRoot);
      this.options.onZone?.(this.zone);
      this.options.onContent?.({ kind: "room", id: room, anchor: r.contentAnchor });
    };
    if (this.options.reducedMotion) { this.setDoor(room, true); finish(); return true; }
    const points = r.positions.map((p) => new Vector3(...p));
    const looks = r.targets.map((p) => new Vector3(...p));
    points[0].copy(this.camera.position); looks[0].copy(this.look);
    points[points.length - 1].copy(landing.position); looks[looks.length - 1].copy(landing.target);
    this.begin({ points, looks, knots: [...r.knots], elapsed: 0, duration: r.duration,
      fovStart: this.camera.fov, fovEnd: landing.fov, room, direction: "enter", doorStarted: false, onComplete: finish });
    return true;
  }

  /** Back first closes a close-up; a second Back returns to the central room. */
  exit(): boolean {
    if (this.disposed || this.busy) return false;
    if (this.focused) return this.returnFromFocus();
    if (!this.room) return false;
    const room = this.room, r = this.manifest.routes[room];
    const landing = this.readPose(this.hubCameraName());
    this.showZones("Hub", r.roomRoot);
    this.setDoor(room, true);
    const finish = () => {
      this.room = null; this.zone = "Hub"; this.idlePose = landing;
      this.applyPose(landing); this.showZones("Hub");
      if (this.options.reducedMotion) this.setDoor(room, false);
      else this.playDoor(room, false);
      this.options.onZone?.("Hub"); this.options.onContent?.(null);
    };
    if (this.options.reducedMotion) { finish(); return true; }
    const points = [...r.positions].reverse().map((p) => new Vector3(...p));
    const looks = [...r.targets].reverse().map((p) => new Vector3(...p));
    const knots = [...r.knots].reverse().map((n) => 1 - n);
    points[0].copy(this.camera.position); looks[0].copy(this.look);
    points[points.length - 1].copy(landing.position); looks[looks.length - 1].copy(landing.target);
    this.begin({ points, looks, knots, elapsed: 0, duration: r.duration,
      fovStart: this.camera.fov, fovEnd: landing.fov, room, direction: "exit", doorStarted: true, onComplete: finish });
    return true;
  }

  private travelTo(p: Pose, complete: () => void): void {
    if (this.options.reducedMotion) { this.applyPose(p); complete(); return; }
    this.begin({ points: [this.camera.position.clone(), p.position], looks: [this.look.clone(), p.target],
      knots: [0, 1], elapsed: 0, duration: 1.15, fovStart: this.camera.fov, fovEnd: p.fov,
      doorStarted: true, onComplete: complete });
  }
  private focusCamera(name: string, kind: string, id: string): boolean {
    if (this.busy || this.focused) return false;
    this.options.onContent?.(null);
    this.yaw = this.pitch = 0;
    this.focusReturn = this.snapshot(); this.focused = true;
    const p = this.readPose(name);
    this.travelTo(p, () => {
      this.idlePose = p;
      this.options.onContent?.({ kind, id });
    });
    return true;
  }
  returnFromFocus(): boolean {
    if (this.busy || !this.focusReturn) return false;
    const p = this.focusReturn;
    this.options.onContent?.(null);
    this.yaw = this.pitch = 0;
    this.travelTo(p, () => {
      this.focused = false; this.focusReturn = null; this.idlePose = p;
      this.options.onContent?.(this.room ? { kind: "room", id: this.room } : null);
    });
    return true;
  }
  interact(nodeName: string): boolean {
    if (this.busy || this.disposed) return false;
    const hit = this.manifest.interactions[nodeName];
    if (!hit) return false;
    const node = this.model.getObjectByName(nodeName);
    if (!node || !this.effectivelyVisible(node)) return false;
    if (hit.kind === "door" && hit.room) return this.enter(hit.room);
    if (hit.kind === "exit") return this.exit();
    if (hit.kind === "intro") {
      if (this.focused) return false;
      const a = this.actions.get(this.manifest.greetingClip);
      if (a && !this.options.reducedMotion) {
        a.reset().setLoop(LoopOnce, 1); a.clampWhenFinished = false; a.play();
      }
      return this.focusCamera("CAM_Rafa_Close", "intro", "rafa");
    }
    if (hit.kind === "project" && hit.projectId) return this.focusCamera(`CAM_Project_${hit.projectId}`, "project", hit.projectId);
    this.options.onContent?.({ kind: hit.kind, id: hit.projectId ?? hit.node });
    return true;
  }
  private effectivelyVisible(node: Object3D): boolean {
    let n: Object3D | null = node;
    while (n) { if (!n.visible) return false; n = n.parent; }
    return true;
  }
  /** Call only on click/tap release, not while dragging. No window listeners. */
  pick(clientX: number, clientY: number, rect: DOMRect): boolean {
    if (this.busy || rect.width <= 0 || rect.height <= 0) return false;
    this.pointer.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    this.camera.updateMatrixWorld(); this.model.updateMatrixWorld(true);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const targets = this.clickables.filter((o) => this.effectivelyVisible(o));
    const hits = this.raycaster.intersectObjects(targets, false);
    return hits.length > 0 ? this.interact(hits[0].object.name) : false;
  }
  /** Optional bounded look. Map desktop pointer or touch drag into [-1,+1]. */
  lookAround(x: number, y: number): void {
    if (this.busy || this.focused || this.options.reducedMotion) return;
    this.yaw = -MathUtils.clamp(x, -1, 1) * (this.options.mobile ? 0.61 : 0.20);
    this.pitch = MathUtils.clamp(y, -1, 1) * 0.10;
  }
  setPresentation(mobile: boolean, reducedMotion: boolean): void {
    if (this.options.mobile === mobile && this.options.reducedMotion === reducedMotion) return;
    this.options.mobile = mobile; this.options.reducedMotion = reducedMotion;
    this.yaw = this.pitch = 0;
    this.startAmbient();
    if (!this.busy && !this.focused) {
      this.idlePose = this.readPose(this.room ? this.roomCameraName(this.room) : this.hubCameraName());
      this.applyPose(this.idlePose);
    }
  }
  /** Re-open the current room's panel without changing the camera. */
  showRoomContent(): void {
    if (this.busy) return;
    if (this.room) this.options.onContent?.({ kind: "room", id: this.room });
    else this.options.onContent?.({ kind: "intro", id: "rafa" });
  }

  /** Call once per useFrame. Do not additionally play all actions with useAnimations. */
  update(delta: number): void {
    if (this.disposed) return;
    const dt = MathUtils.clamp(delta, 0, 0.05);
    this.age += dt;
    // Leave ambient clocks paused when the hub is hidden.
    for (const n of this.manifest.ambientClips) {
      const a = this.actions.get(n);
      if (a) a.paused = this.options.reducedMotion === true || !this.zones.get("Hub")?.visible;
    }
    this.mixer.update(dt);
    const j = this.journey;
    if (j) {
      j.elapsed += dt;
      const p = MathUtils.clamp(j.elapsed / j.duration, 0, 1);
      if (j.room && j.direction === "enter" && !j.doorStarted && p >= this.manifest.routes[j.room].openAt) {
        this.playDoor(j.room, true); j.doorStarted = true;
      }
      let i = 0;
      while (i < j.knots.length - 2 && p > j.knots[i + 1]) i++;
      const t = MathUtils.smoothstep(p, j.knots[i], j.knots[i + 1]);
      this.camera.position.lerpVectors(j.points[i], j.points[i + 1], t);
      this.look.lerpVectors(j.looks[i], j.looks[i + 1], t);
      this.camera.lookAt(this.look);
      this.camera.fov = MathUtils.lerp(j.fovStart, j.fovEnd, MathUtils.smoothstep(p, 0, 1));
      this.camera.updateProjectionMatrix();
      if (p === 1) { this.journey = null; j.onComplete(); this.options.onBusy?.(false); }
    } else if (!this.options.reducedMotion && !this.focused) {
      this.direction.subVectors(this.idlePose.target, this.idlePose.position);
      this.direction.applyAxisAngle(this.up, this.yaw);
      this.direction.y += Math.sin(this.pitch) * this.direction.length();
      const target = this.direction.add(this.camera.position);
      this.look.lerp(target, 1 - Math.exp(-5 * dt)); this.camera.lookAt(this.look);
    }
    if (this.fire) {
      this.fire.intensity = this.fireBase * (this.options.reducedMotion ? 1 : 1 + .035 * Math.sin(this.age * 8.1) + .020 * Math.sin(this.age * 13.7));
    }
  }
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true; this.journey = null;
    this.mixer.stopAllAction(); this.mixer.uncacheRoot(this.model);
    if (this.fire) this.fire.intensity = this.fireBase;
    // Shared useGLTF textures/geometries belong to the loader, not this controller.
  }
}

/**
 * Clone scene nodes, but keep cached textures/geometry shared with useGLTF.
 * Rebind target-based lights to the corresponding cloned target nodes.
 */
export function cloneStudioScene(source: Object3D): Object3D {
  const model = source.clone(true);
  const pairs = new Map<Object3D, Object3D>();
  const visit = (original: Object3D, clone: Object3D): void => {
    pairs.set(original, clone);
    original.children.forEach((child, index) => visit(child, clone.children[index]));
  };
  visit(source, model);
  pairs.forEach((clone, original) => {
    if ((original instanceof SpotLight && clone instanceof SpotLight) ||
        (original instanceof DirectionalLight && clone instanceof DirectionalLight)) {
      const target = pairs.get(original.target);
      if (target) clone.target = target;
    }
  });
  return model;
}

/** One key shadow per room; transparent hit targets never cast a shadow. */
export function configureStudioShadows(model: Object3D, enabled: boolean): void {
  const keys = ["Light_Hub_Key", "Light_Archive_Key", "Light_Workshop_Key", "Light_Office_Key"];
  model.traverse((object) => {
    if (object instanceof Mesh) {
      const hit = object.name.startsWith("Hit_");
      object.castShadow = enabled && !hit;
      object.receiveShadow = enabled && !hit;
    }
    if (object instanceof SpotLight || object instanceof DirectionalLight) {
      object.castShadow = enabled && keys.includes(object.name);
      object.shadow.mapSize.set(1024, 1024);
      object.shadow.bias = -0.0003;
      object.shadow.normalBias = 0.025;
      object.shadow.camera.near = 0.1;
      object.shadow.camera.far = 24;
    }
  });
}
