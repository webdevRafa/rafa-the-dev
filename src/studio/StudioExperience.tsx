import {
  Component,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ErrorInfo, ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { WebGPURenderer } from "three/webgpu";
import { useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import StudioScene from "./StudioScene";
import { parseStudioManifest } from "./studio-manifest";
import type {
  RoomId,
  StudioContent,
  StudioController,
  StudioManifest,
  StudioOptions,
  ZoneId,
} from "./studio-controller";
import "./StudioExperience.css";

type Quality = "balanced" | "lite";
const ROOT = "/experience/nocturne/";
const ROOMS: { id: RoomId; title: string; caption: string }[] = [
  { id: "gallery", title: "The Gallery", caption: "Selected projects" },
  { id: "workshop", title: "The Workshop", caption: "Tools & process" },
  { id: "archive", title: "The Archive", caption: "About & resume" },
  { id: "office", title: "The Office", caption: "Get in touch" },
];
const PROJECTS: Record<string, { name: string; repo: string }> = {
  satx: { name: "SATX Ink", repo: "https://github.com/webdevRafa/satxink" },
  roofzeus: {
    name: "Roof Zeus",
    repo: "https://github.com/webdevRafa/roofzeus",
  },
  rancho: {
    name: "Rancho de Paloma Blanca",
    repo: "https://github.com/webdevRafa/rancho-de-paloma-blanca",
  },
};

function useCompact(): boolean {
  const [compact, setCompact] = useState(
    () => window.matchMedia("(max-width: 850px)").matches
  );
  useEffect(() => {
    const media = window.matchMedia("(max-width: 850px)");
    const update = () => setCompact(media.matches);
    media.addEventListener("change", update);
    update();
    return () => media.removeEventListener("change", update);
  }, []);
  return compact;
}
function initialQuality(): Quality {
  return window.matchMedia("(max-width: 850px), (pointer: coarse)").matches
    ? "lite"
    : "balanced";
}

class StudioErrorBoundary extends Component<
  { children: ReactNode; fallback: (message: string) => ReactNode },
  { error: string | null }
> {
  state: { error: string | null } = { error: null };
  static getDerivedStateFromError(error: unknown) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to load the 3D studio.",
    };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Nocturne Studio:", error, info.componentStack);
  }
  render() {
    return this.state.error
      ? this.props.fallback(this.state.error)
      : this.props.children;
  }
}

/**
 * Keep exactly one async renderer initialization per canvas.
 *
 * R3F 9 can call an async `gl` factory more than once if the owner
 * re-renders while WebGPU is still initializing. Reusing the same promise
 * prevents two renderers from fighting over one canvas.
 */
const rendererByCanvas = new WeakMap<HTMLCanvasElement, Promise<any>>();

function createStudioRenderer(props: any) {
  const canvas = props.canvas as HTMLCanvasElement | undefined;

  if (canvas) {
    const existing = rendererByCanvas.get(canvas);
    if (existing) return existing;
  }

  const pending = (async () => {
    const renderer = new WebGPURenderer({
      canvas,
      antialias: true,
      alpha: false,
    });

    await renderer.init();
    return renderer as any;
  })();

  if (canvas) rendererByCanvas.set(canvas, pending);
  return pending;
}

type PanelProps = {
  content: StudioContent;
  busy: boolean;
  focused: boolean;
  interact: (name: string) => void;
};
function ContentPanel({ content, busy, focused, interact }: PanelProps) {
  if (content.kind === "project") {
    const project = PROJECTS[content.id];
    if (!project) return <h2 id="nct-panel-heading">Project</h2>;
    return (
      <>
        <p className="nct-kicker">Selected project</p>
        <h2 id="nct-panel-heading">{project.name}</h2>
        <p>
          This display is connected to the project below. Case-study text can be
          added here without changing the 3D model.
        </p>
        <a
          className="nct-link"
          href={project.repo}
          target="_blank"
          rel="noopener noreferrer"
        >
          View repository <span aria-hidden="true">↗</span>
        </a>
      </>
    );
  }
  if (content.kind === "intro" || content.kind === "about") {
    return (
      <>
        <p className="nct-kicker">Meet the developer</p>
        <h2 id="nct-panel-heading">Hi, I’m Rafa.</h2>
        <p>
          I build websites, digital products, and interactive web experiences.
        </p>
        <p>
          The Gallery holds my projects. The Workshop is about how I build. The
          Office takes you to my contact form.
        </p>
        <Link className="nct-link" to="/#contact">
          Work with me <span aria-hidden="true">↗</span>
        </Link>
      </>
    );
  }
  if (
    content.kind === "contact" ||
    (content.kind === "room" && content.id === "office")
  ) {
    return (
      <>
        <p className="nct-kicker">The Office</p>
        <h2 id="nct-panel-heading">Let’s build something.</h2>
        <p>Tell me what you’re working on through the existing contact form.</p>
        <Link className="nct-link" to="/#contact">
          Open contact form <span aria-hidden="true">↗</span>
        </Link>
        <p className="nct-note">
          This test page does not create a second form or change the Firebase
          submission flow.
        </p>
      </>
    );
  }
  if (content.kind === "resume") {
    return (
      <>
        <p className="nct-kicker">The Archive</p>
        <h2 id="nct-panel-heading">Resume</h2>
        <p>
          The book interaction is connected. A resume download has not been
          attached to this test yet.
        </p>
        <Link className="nct-link" to="/#contact">
          Contact Rafa <span aria-hidden="true">↗</span>
        </Link>
      </>
    );
  }
  if (content.id === "gallery")
    return (
      <>
        <p className="nct-kicker">The Gallery</p>
        <h2 id="nct-panel-heading">Selected work.</h2>
        <p>Choose a framed project in the room or use a button below.</p>
        <div className="nct-panel-actions">
          {Object.entries(PROJECTS).map(([id, project]) => (
            <button
              key={id}
              type="button"
              disabled={busy || focused}
              onClick={() => interact(`Hit_Project_${id}`)}
            >
              {project.name}
            </button>
          ))}
        </div>
      </>
    );
  if (content.id === "workshop")
    return (
      <>
        <p className="nct-kicker">The Workshop</p>
        <h2 id="nct-panel-heading">From idea to interface.</h2>
        <p>A space for the tools and processes behind my projects.</p>
        <p className="nct-tech">
          React · TypeScript · Firebase · Three.js · Blender
        </p>
        <p className="nct-note">
          Detailed process write-ups can be added here later.
        </p>
      </>
    );
  if (content.id === "archive")
    return (
      <>
        <p className="nct-kicker">The Archive</p>
        <h2 id="nct-panel-heading">The person behind the work.</h2>
        <p>
          Explore the About and Resume books on the desk, or use these controls.
        </p>
        <div className="nct-panel-actions">
          <button
            type="button"
            disabled={busy}
            onClick={() => interact("Book_ABOUT")}
          >
            About Rafa
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => interact("Book_RESUME")}
          >
            Resume
          </button>
        </div>
      </>
    );
  return <h2 id="nct-panel-heading">Explore the studio.</h2>;
}

export default function StudioExperience() {
  const compact = useCompact();
  const prefersReduced = useReducedMotion() === true;
  const [lessMotion, setLessMotion] = useState(false);
  const reducedMotion = prefersReduced || lessMotion;
  const [quality, setQuality] = useState<Quality>(initialQuality);
  const [manifest, setManifest] = useState<StudioManifest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [zone, setZone] = useState<ZoneId>("Hub");
  const [focused, setFocused] = useState(false);
  const [content, setContent] = useState<StudioContent | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [exposure, setExposure] = useState(1.1);
  const [retry, setRetry] = useState(0);
  const [pageVisible, setPageVisible] = useState(() => !document.hidden);
  const controller = useRef<StudioController | null>(null);
  const asset = `rafa-nocturne${quality === "lite" ? "-lite" : ""}`;
  const url = `${ROOT}${asset}.glb`;
  const sessionKey = `${quality}-${retry}`;

  const onReady = useCallback((active: StudioController | null) => {
    controller.current = active;
    setReady(active !== null);
    setBusy(false);
    setFocused(false);
    if (active) setZone(active.currentZone);
  }, []);
  const onError = useCallback((message: string) => {
    setError(message);
    setReady(false);
    setBusy(false);
  }, []);
  const callbacks = useMemo<StudioOptions>(
    () => ({
      onBusy: (value) => {
        setBusy(value);
        setFocused(controller.current?.isFocused ?? false);
      },
      onZone: (value) => {
        setZone(value);
        setFocused(false);
      },
      onContent: (value) => {
        setContent(value);
        setPanelOpen(value !== null);
        setFocused(controller.current?.isFocused ?? false);
      },
    }),
    []
  );

  useEffect(() => {
    const abort = new AbortController();
    setManifest(null);
    setError(null);
    setReady(false);
    setBusy(false);
    setContent(null);
    setPanelOpen(false);
    setZone("Hub");
    setFocused(false);
    const load = async () => {
      const response = await fetch(`${ROOT}${asset}.json`, {
        signal: abort.signal,
      });
      if (!response.ok)
        throw new Error(
          `Cannot load ${asset}.json (HTTP ${response.status}). Check public/experience/nocturne/.`
        );
      const text = await response.text();
      if (text.trimStart().startsWith("<")) {
        throw new Error(
          `${asset}.json returned an HTML page. The JSON is missing from public/experience/nocturne/.`
        );
      }
      let data: unknown;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`${asset}.json is not valid JSON.`);
      }
      const parsed = parseStudioManifest(data, `${asset}.glb`);
      if (!abort.signal.aborted) setManifest(parsed);
    };
    void load().catch((failure: unknown) => {
      if (!abort.signal.aborted)
        onError(
          failure instanceof Error
            ? failure.message
            : "Failed to load the studio manifest."
        );
    });
    return () => abort.abort();
  }, [asset, retry, onError]);

  useEffect(() => {
    const visibility = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", visibility);
    return () => document.removeEventListener("visibilitychange", visibility);
  }, []);

  const run = useCallback(
    (action: (active: StudioController) => void) => {
      const active = controller.current;
      if (!active || active.busy) return;
      try {
        action(active);
        setFocused(active.isFocused);
      } catch (failure) {
        onError(
          failure instanceof Error
            ? failure.message
            : "The studio interaction failed."
        );
      }
    },
    [onError]
  );
  const enter = (room: RoomId) =>
    run((active) => {
      active.enter(room);
    });
  const interact = (name: string) =>
    run((active) => {
      active.interact(name);
    });
  const goBack = useCallback(
    () =>
      run((active) => {
        setPanelOpen(false);
        active.exit();
      }),
    [run]
  );

  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (
        event.target instanceof HTMLElement &&
        event.target.closest("input, textarea, select, [contenteditable]")
      )
        return;
      if (settingsOpen) {
        setSettingsOpen(false);
        return;
      }
      goBack();
    };
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, [settingsOpen, goBack]);

  const failure = (message: string) => (
    <div className="nct-message nct-error" role="alert">
      <p className="nct-kicker">Studio could not open</p>
      <h1>Let’s keep the homepage available.</h1>
      <p>{message}</p>
      <p className="nct-note">
        The GLB and its matching JSON must both be in{" "}
        <code>public/experience/nocturne/</code>.
      </p>
      <div className="nct-panel-actions">
        <button
          type="button"
          onClick={() => {
            window.location.reload();
          }}
        >
          Reload page
        </button>
        <button
          type="button"
          onClick={() => {
            setQuality("lite");
            setRetry((value) => value + 1);
          }}
        >
          Try lightweight scene
        </button>
        <Link to="/">Return to homepage</Link>
      </div>
    </div>
  );

  return (
    <main className="nct-page" aria-label="Rafa’s interactive studio">
      <div className="nct-viewport">
        {error ? (
          failure(error)
        ) : (
          <StudioErrorBoundary key={sessionKey} fallback={failure}>
            {manifest && (
              <Canvas
                key={sessionKey}
                camera={{
                  position: [0, 1.82, 5.9],
                  fov: 62,
                  near: 0.045,
                  far: 65,
                }}
                gl={createStudioRenderer}
                dpr={[1, compact || quality === "lite" ? 1 : 1.5]}
                shadows={!compact && quality === "balanced"}
                frameloop={pageVisible ? "always" : "never"}
                fallback={<span>Interactive 3D studio unavailable.</span>}
              >
                <Suspense fallback={null}>
                  <StudioScene
                    url={url}
                    manifest={manifest}
                    compact={compact}
                    reducedMotion={reducedMotion}
                    shadows={!compact && quality === "balanced"}
                    exposure={exposure}
                    callbacks={callbacks}
                    onReady={onReady}
                    onError={onError}
                  />
                </Suspense>
              </Canvas>
            )}
            {!ready && (
              <div className="nct-loading" role="status">
                <span className="nct-loading-dot" aria-hidden="true" />
                <strong>Opening the studio</strong>
                <span>
                  Loading the {quality === "lite" ? "lightweight" : "detailed"}{" "}
                  scene…
                </span>
                <Link to="/">Back to homepage</Link>
              </div>
            )}
          </StudioErrorBoundary>
        )}
      </div>

      <header className="nct-header">
        <Link className="nct-brand" to="/">
          RAFA THE DEV <span>NOCTURNE STUDIO</span>
        </Link>
        <div className="nct-header-actions">
          {ready && (zone !== "Hub" || focused) && (
            <button type="button" disabled={busy} onClick={goBack}>
              ← {focused ? "Back to room" : "Main room"}
            </button>
          )}
          <button
            type="button"
            aria-expanded={settingsOpen}
            aria-controls="nct-settings"
            onClick={() => setSettingsOpen((value) => !value)}
          >
            Settings
          </button>
          <Link to="/">Exit studio</Link>
        </div>
      </header>

      {settingsOpen && (
        <section
          className="nct-settings"
          id="nct-settings"
          aria-label="Studio settings"
        >
          <h2>Studio settings</h2>
          <label>
            Graphics
            <select
              value={quality}
              disabled={busy}
              onChange={(event) => setQuality(event.target.value as Quality)}
            >
              <option value="balanced">Detailed</option>
              <option value="lite">Lightweight</option>
            </select>
          </label>
          <p className="nct-note">
            Changing graphics reloads the scene and returns to the main room.
          </p>
          <label>
            Brightness <span>{exposure.toFixed(1)}</span>
            <input
              aria-label="Scene brightness"
              type="range"
              min="0.7"
              max="2.2"
              step="0.1"
              value={exposure}
              onChange={(event) => setExposure(Number(event.target.value))}
            />
          </label>
          <label className="nct-check">
            <input
              type="checkbox"
              checked={reducedMotion}
              disabled={prefersReduced || busy}
              onChange={(event) => setLessMotion(event.target.checked)}
            />
            Reduced motion
          </label>
          <p className="nct-note">
            {prefersReduced
              ? "Your device’s reduced-motion preference is enabled."
              : "Pauses ambient motion and skips animated camera travel."}
          </p>
          <button type="button" onClick={() => setSettingsOpen(false)}>
            Close settings
          </button>
        </section>
      )}

      {ready && (
        <>
          <div className="nct-location" role="status" aria-live="polite">
            <span>
              {busy
                ? "Moving through the studio…"
                : zone === "Hub"
                ? "The main room"
                : `The ${zone.toLowerCase()}`}
            </span>
            <small>
              {compact
                ? "Tap a door or use the menu. Drag to look."
                : "Click a door or choose a room below."}
            </small>
          </div>

          {panelOpen && content && !busy && (
            <section className="nct-panel" aria-labelledby="nct-panel-heading">
              <button
                className="nct-panel-close"
                type="button"
                aria-label="Hide information panel"
                onClick={() => setPanelOpen(false)}
              >
                ×
              </button>
              <ContentPanel
                content={content}
                busy={busy}
                focused={focused}
                interact={interact}
              />
            </section>
          )}

          <nav className="nct-nav" aria-label="Studio navigation">
            {zone === "Hub" && !focused ? (
              <>
                <button
                  type="button"
                  disabled={busy}
                  className="nct-meet"
                  onClick={() => interact("Hit_Rafa")}
                >
                  Meet Rafa
                </button>
                {ROOMS.map((room) => (
                  <button
                    key={room.id}
                    type="button"
                    disabled={busy}
                    onClick={() => enter(room.id)}
                  >
                    <strong>{room.title}</strong>
                    <small>{room.caption}</small>
                  </button>
                ))}
              </>
            ) : (
              <>
                <button type="button" disabled={busy} onClick={goBack}>
                  ← {focused ? "Back to room" : "Return to main room"}
                </button>
                {content && !panelOpen && !busy && (
                  <button type="button" onClick={() => setPanelOpen(true)}>
                    Show information
                  </button>
                )}
                {zone !== "Hub" && !focused && !busy && (
                  <button
                    type="button"
                    onClick={() => run((active) => active.showRoomContent())}
                  >
                    Room overview
                  </button>
                )}
              </>
            )}
          </nav>
        </>
      )}
    </main>
  );
}
