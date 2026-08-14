import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Check,
  CircleCheck,
  Clock3,
  Database,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import AmbientVectorField from './AmbientVectorField'
import { formatPackagePrice, getServicePackage, servicePackages } from './packageCatalog'
import './PackagePage.css'

function PackagePage() {
  const { packageSlug } = useParams()
  const servicePackage = getServicePackage(packageSlug)
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    if (!servicePackage) return
    document.title = `${servicePackage.name} | Rafa the Dev`
    return () => { document.title = 'Rafa the Dev' }
  }, [servicePackage])

  const selectedAddOns = useMemo(
    () => servicePackage?.addOns.filter((addOn) => selectedAddOnIds.includes(addOn.id)) ?? [],
    [selectedAddOnIds, servicePackage],
  )
  const addOnTotal = selectedAddOns.reduce((total, addOn) => total + addOn.price, 0)
  const estimatedTotal = (servicePackage?.price ?? 0) + addOnTotal

  if (!servicePackage) return <Navigate to="/#packages" replace />

  const toggleAddOn = (addOnId: string) => {
    setSelectedAddOnIds((current) => (
      current.includes(addOnId)
        ? current.filter((currentId) => currentId !== addOnId)
        : [...current, addOnId]
    ))
  }

  const submitRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return

    const form = new FormData(event.currentTarget)
    const value = (field: string) => String(form.get(field) ?? '')
    setIsSubmitting(true)
    setSubmitError('')

    try {
      const { submitPackageInquiry } = await import('./firebase/submissions')
      await submitPackageInquiry({
        name: value('name'),
        email: value('email'),
        business: value('business'),
        phone: value('phone'),
        timing: value('timing'),
        message: value('message'),
        packageId: servicePackage.id,
        packageName: servicePackage.name,
        packageRoute: `/packages/${servicePackage.slug}`,
        selectedAddOns: selectedAddOns.map((addOn) => `${addOn.name} (+${formatPackagePrice(addOn.price)})`),
        basePrice: servicePackage.price,
        addOnTotal,
        estimatedTotal,
      })
      setIsSubmitted(true)
    } catch (error) {
      console.error('Unable to submit package inquiry.', error)
      setSubmitError('Your request could not be sent right now. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentIndex = servicePackages.findIndex((item) => item.id === servicePackage.id)
  const nextPackage = servicePackages[(currentIndex + 1) % servicePackages.length]

  return (
    <div className={`package-detail-shell is-${servicePackage.accent}`}>
      <AmbientVectorField />
      <main id="main">
        <section className="package-detail-hero page-frame" data-ambient-scene="0">
          <Link className="package-back-link" to="/#packages"><ArrowLeft size={16} /> All packages</Link>
          <div className="package-detail-hero-grid">
            <div className="package-detail-copy">
              <p className="section-kicker">{servicePackage.architecture}</p>
              <h1>{servicePackage.name}</h1>
              <p>{servicePackage.note}</p>
              <div className="package-detail-actions">
                <a className="button button-primary" href="#configure">Build your estimate <ArrowDown size={17} /></a>
                <a className="text-link" href="#included">See what is included <ArrowDown size={16} /></a>
              </div>
            </div>
            <aside className="package-snapshot" aria-label={`${servicePackage.name} overview`}>
              <span>STARTING AT</span>
              <strong>{formatPackagePrice(servicePackage.price)}</strong>
              <p>Friendly base pricing for the focused version. Add only the capabilities your project actually needs.</p>
              <dl>
                <div><dt><Clock3 size={15} /> Typical timing</dt><dd>{servicePackage.timeline}</dd></div>
                <div><dt><Database size={15} /> Data level</dt><dd>{servicePackage.architecture}</dd></div>
              </dl>
            </aside>
          </div>
        </section>

        <section className="package-included page-frame" id="included" data-ambient-scene="1">
          <header className="package-section-heading">
            <div><p className="section-kicker">THE FOCUSED VERSION</p><h2>Enough to launch something useful.</h2></div>
            <p>{servicePackage.idealFor}</p>
          </header>
          <div className="package-included-grid">
            {servicePackage.includes.map((item, index) => (
              <article key={item.title}>
                <span>0{index + 1}</span>
                <Check size={19} />
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="package-configure page-frame" id="configure" data-ambient-scene="2">
          <header className="package-section-heading">
            <div><p className="section-kicker">MAKE IT YOURS</p><h2>Start lean. Add what earns its place.</h2></div>
            <p>Choose the extras that sound useful. This creates a planning estimate—not a surprise checkout or binding quote.</p>
          </header>
          <div className="package-configure-layout">
            <fieldset className="package-addons">
              <legend className="package-sr-only">Optional package add-ons</legend>
              {servicePackage.addOns.map((addOn) => {
                const selected = selectedAddOnIds.includes(addOn.id)
                return (
                  <label className={selected ? 'is-selected' : ''} key={addOn.id}>
                    <input type="checkbox" checked={selected} onChange={() => toggleAddOn(addOn.id)} />
                    <span className="package-addon-check" aria-hidden="true">{selected && <Check size={15} />}</span>
                    <span className="package-addon-copy"><strong>{addOn.name}</strong><small>{addOn.description}</small></span>
                    <b>+{formatPackagePrice(addOn.price)}</b>
                  </label>
                )
              })}
            </fieldset>

            <aside className="package-estimate" aria-live="polite">
              <div className="package-estimate-heading"><Sparkles size={18} /><span>PLANNING ESTIMATE</span></div>
              <div className="package-estimate-line"><span>{servicePackage.shortName}</span><strong>{formatPackagePrice(servicePackage.price)}</strong></div>
              {selectedAddOns.map((addOn) => (
                <div className="package-estimate-line is-addon" key={addOn.id}><span>{addOn.name}</span><strong>+{formatPackagePrice(addOn.price)}</strong></div>
              ))}
              {selectedAddOns.length === 0 && <p className="package-estimate-empty">No extras selected. The focused base package may be all you need.</p>}
              <div className="package-estimate-total"><span>ESTIMATED START</span><strong>{formatPackagePrice(estimatedTotal)}</strong></div>
              <p>Final pricing is confirmed after I review the content, workflow, and technical requirements with you.</p>
              <a className="button button-primary" href="#request">Request this build <ArrowRight size={17} /></a>
            </aside>
          </div>
        </section>

        <section className="package-request page-frame" id="request" data-ambient-scene="3">
          <div className="package-request-copy">
            <p className="section-kicker">SEND THE CONFIGURATION</p>
            <h2>Let&apos;s see if this is the right starting point.</h2>
            <p>I will review your goals and selected options, then follow up with questions and a clear recommendation.</p>
            <div className="package-request-trust"><ShieldCheck size={19} /><span>No payment is collected here. Your estimate is simply attached to the inquiry.</span></div>
          </div>

          <div className="package-request-panel">
            {isSubmitted ? (
              <div className="package-request-success" role="status">
                <CircleCheck size={44} />
                <p className="section-kicker">REQUEST RECEIVED</p>
                <h2>Your package is in my inbox.</h2>
                <p>I sent a confirmation email and will review the configuration before following up.</p>
                <div className="package-success-actions">
                  <Link className="button button-secondary" to="/">Back to the website</Link>
                  <Link className="text-link" to={`/packages/${nextPackage.slug}`}>Explore {nextPackage.shortName} <ArrowRight size={16} /></Link>
                </div>
              </div>
            ) : (
              <form onSubmit={submitRequest}>
                <div className="package-form-summary">
                  <span>{servicePackage.name}</span>
                  <strong>{formatPackagePrice(estimatedTotal)} estimated start</strong>
                </div>
                <div className="form-row">
                  <label>Your name <span>*</span><input name="name" autoComplete="name" required /></label>
                  <label>Email address <span>*</span><input type="email" name="email" autoComplete="email" required /></label>
                </div>
                <div className="form-row">
                  <label>Business or organization<input name="business" autoComplete="organization" /></label>
                  <label>Phone number<input type="tel" name="phone" autoComplete="tel" /></label>
                </div>
                <label>When would you like to begin?
                  <select name="timing" defaultValue="">
                    <option value="">Select timing</option>
                    <option>As soon as possible</option>
                    <option>Within 30 days</option>
                    <option>Within 2–3 months</option>
                    <option>I am still planning</option>
                  </select>
                </label>
                <label>Tell me what you want this project to accomplish <span>*</span>
                  <textarea name="message" required placeholder="What does the business do, what is not working today, and what would a good outcome look like?" />
                </label>
                {submitError && <p className="form-error" role="alert">{submitError}</p>}
                <button className="button button-primary package-submit" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending request...' : 'Send package request'} <ArrowRight size={17} />
                </button>
                <p className="form-disclaimer">Planning estimate only. Final scope, timeline, and price are confirmed in writing before work begins.</p>
              </form>
            )}
          </div>
        </section>
      </main>

      <footer className="package-page-footer page-frame">
        <Link to="/" className="brand"><span className="brand-mark">R</span><span className="brand-copy"><strong>RAFA / THE DEV</strong></span></Link>
        <Link to="/#packages">Compare all packages</Link>
      </footer>
    </div>
  )
}

export default PackagePage
