import './UndergroundSection.css'

export default function UndergroundSection() {
  return (
    <section className="underground-section" id="beneath-the-interface" aria-labelledby="underground-heading">
      <picture className="underground-art" aria-hidden="true">
        <source media="(max-aspect-ratio: 1/1)" srcSet="/scenes/underground-mobile.webp" />
        <img
          src="/scenes/underground-desktop.webp"
          alt=""
          width="1672"
          height="941"
          loading="lazy"
          decoding="async"
        />
      </picture>
      <div className="underground-copy">
        <p className="underground-eyebrow">Beneath the interface</p>
        <h2 id="underground-heading">
          <span>The details you don’t see</span>
          <span>are the ones that make it work.</span>
        </h2>
        <p className="underground-description">
          Clean components, thoughtful state, responsive layouts, performance,
          and interactions built to hold everything together.
        </p>
      </div>
    </section>
  )
}
