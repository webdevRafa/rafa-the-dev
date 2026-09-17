import { useState } from "react";
import type { FormEvent } from "react";
import { submitProjectInquiry } from "./firebase/submissions";
import "./App.css";
import PortraitHero from "./hero/PortraitHero";

type FormStatus = "idle" | "sending" | "success" | "error";

function App() {
  const [status, setStatus] = useState<FormStatus>("idle");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    setStatus("sending");

    try {
      await submitProjectInquiry({
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        business: "",
        message: String(form.get("message") ?? ""),
        timing: "",
        budget: "",
      });

      formElement.reset();
      setStatus("success");
    } catch (error) {
      console.error("Unable to submit project inquiry.", error);
      setStatus("error");
    }
  };

  return (
    <main className="home">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">RAFA THE DEV</p>

          <h1>
            Creative developer building
            <span> interactive experiences.</span>
          </h1>

          <p className="hero-description">
            I build modern websites, digital products, and interactive
            experiences with React, TypeScript, Three.js, and Blender.
          </p>

          <a className="primary-button" href="#contact">
            Work with me
          </a>
        </div>

        <div className="hero-visual">
          <PortraitHero />
        </div>
      </section>

      <section className="contact" id="contact">
        <div className="contact-copy">
          <p className="eyebrow">GET IN TOUCH</p>
          <h2>Have something you want to build?</h2>
          <p>Tell me what you're working on and I'll get back to you.</p>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <label>
            Name
            <input name="name" type="text" autoComplete="name" required />
          </label>

          <label>
            Email
            <input name="email" type="email" autoComplete="email" required />
          </label>

          <label>
            What are you working on?
            <textarea name="message" rows={6} required />
          </label>

          <button type="submit" disabled={status === "sending"}>
            {status === "sending" ? "Sending..." : "Send message"}
          </button>

          {status === "success" && (
            <p className="form-success">Message received. I'll be in touch.</p>
          )}

          {status === "error" && (
            <p className="form-error">
              Something went wrong. Please try again.
            </p>
          )}
        </form>
      </section>
    </main>
  );
}

export default App;
