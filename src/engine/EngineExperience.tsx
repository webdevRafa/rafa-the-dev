import { Suspense, useEffect } from "react";
import { ArrowLeft, Cpu } from "lucide-react";
import { Link } from "react-router-dom";
import EngineScene from "./EngineScene";
import "./EngineExperience.css";

function EngineLoading() {
  return (
    <div className="engine-loading" role="status" aria-live="polite">
      <span className="engine-loading__core" aria-hidden="true" />
      <span>Bringing acquisition system online</span>
    </div>
  );
}

export default function EngineExperience() {
  useEffect(() => {
    const previousTitle = document.title;

    document.title = "Acquisition Engine | Rafa the Dev";
    document.documentElement.classList.add("engine-route-active");
    document.body.classList.add("engine-route-active");

    return () => {
      document.title = previousTitle;
      document.documentElement.classList.remove("engine-route-active");
      document.body.classList.remove("engine-route-active");
    };
  }, []);

  return (
    <main className="engine-experience" id="main">
      <Suspense fallback={<EngineLoading />}>
        <EngineScene />
      </Suspense>

      <div className="engine-vignette" aria-hidden="true" />

      <section
        className="engine-title"
        aria-label="Acquisition Engine 3D experience"
      >
        <p>
          <Cpu size={14} aria-hidden="true" />
          THE ACQUISITION ENGINE
        </p>

        <h1>Build a system for predictable growth.</h1>

        <span>
          Bring discovery, trust, decision, and activation together into one
          connected path from first impression to qualified opportunity.
        </span>
      </section>

      <div className="engine-controls" aria-hidden="true">
        Drag to inspect · Scroll to move closer
      </div>

      <Link className="engine-back" to="/#top">
        <ArrowLeft size={16} aria-hidden="true" />
        Back home
      </Link>
    </main>
  );
}
