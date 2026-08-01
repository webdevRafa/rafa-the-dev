import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import type { Timestamp } from 'firebase/firestore'
import {
  ArrowLeft,
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
  CircleUserRound,
  Gift,
  Inbox,
  LogOut,
  Mail,
  Search,
  ShieldCheck,
  UserPlus,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { auth, db } from '../firebase/firebaseConfig'
import './AdminPage.css'

type AccessState = 'checking' | 'signed-out' | 'authorized' | 'forbidden'
type DashboardView = 'submissions' | 'leads'
type SubmissionFilter = 'all' | 'project_inquiry' | 'free_website_application'
type LeadStage = 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost'

type Contact = {
  name: string
  email: string
  business: string
  phone: string
  location: string
  instagram: string
}

type SubmissionSource = {
  site: string
  route: string
  formId: string
  campaignId: string
}

type Submission = {
  id: string
  schemaVersion: number
  submissionType: 'project_inquiry' | 'free_website_application'
  status: string
  submittedAt?: Timestamp
  updatedAt?: Timestamp
  leadId?: string
  contact: Contact
  source: SubmissionSource
  payload: Record<string, unknown>
}

type Lead = {
  id: string
  submissionId: string
  submissionType: Submission['submissionType']
  stage: LeadStage
  contact: Contact
  source: SubmissionSource
  notes: string
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

const leadStages: Array<{ value: LeadStage; label: string }> = [
  { value: 'new', label: 'New lead' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'proposal', label: 'Proposal sent' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
]

function formatDate(value?: Timestamp) {
  if (!value) return 'Saving date...'

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value.toDate())
}

function formatLabel(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/^./, (character) => character.toUpperCase())
}

function formatValue(value: unknown) {
  if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : 'Not provided'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (value === null || value === undefined || value === '') return 'Not provided'
  return String(value)
}

function submissionTypeLabel(type: Submission['submissionType']) {
  return type === 'project_inquiry' ? 'Project inquiry' : 'Free website application'
}

function ContactLinks({ contact }: { contact: Contact }) {
  return (
    <div className="admin-contact-links">
      <a href={`mailto:${contact.email}`}>
        <Mail size={15} />
        {contact.email}
      </a>
      {contact.phone && <a href={`tel:${contact.phone}`}>{contact.phone}</a>}
      {contact.instagram && <span>{contact.instagram}</span>}
    </div>
  )
}

function SubmissionPayload({ payload }: { payload: Record<string, unknown> }) {
  const entries = Object.entries(payload)

  return (
    <dl className="admin-payload-grid">
      {entries.map(([key, value]) => (
        <div key={key}>
          <dt>{formatLabel(key)}</dt>
          <dd>{formatValue(value)}</dd>
        </div>
      ))}
    </dl>
  )
}

function AdminPage() {
  const [accessState, setAccessState] = useState<AccessState>('checking')
  const [adminEmail, setAdminEmail] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginNotice, setLoginNotice] = useState('')
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [view, setView] = useState<DashboardView>('submissions')
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [dataError, setDataError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [submissionFilter, setSubmissionFilter] = useState<SubmissionFilter>('all')
  const [busyRecordId, setBusyRecordId] = useState('')

  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Admin Dashboard | Rafa the Dev'
    return () => {
      document.title = previousTitle
    }
  }, [])

  useEffect(() => {
    let active = true
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      void (async () => {
        if (!active) return

        if (!user) {
          setAdminEmail('')
          setAccessState('signed-out')
          return
        }

        setAccessState('checking')

        try {
          const token = await user.getIdTokenResult(true)
          if (!active) return

          if (token.claims.admin === true) {
            setAdminEmail(user.email ?? '')
            setAccessState('authorized')
          } else {
            setAdminEmail(user.email ?? '')
            setAccessState('forbidden')
          }
        } catch {
          if (active) setAccessState('forbidden')
        }
      })()
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (accessState !== 'authorized') return

    const submissionsQuery = query(
      collection(db, 'submissions'),
      orderBy('submittedAt', 'desc'),
      limit(250),
    )
    const leadsQuery = query(collection(db, 'leads'), orderBy('createdAt', 'desc'), limit(250))

    let submissionsLoaded = false
    let leadsLoaded = false
    const updateLoadingState = () => setIsLoadingData(!(submissionsLoaded && leadsLoaded))

    const unsubscribeSubmissions = onSnapshot(
      submissionsQuery,
      (snapshot) => {
        setSubmissions(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Submission))
        submissionsLoaded = true
        updateLoadingState()
      },
      (error) => {
        console.error('Unable to load submissions.', error)
        setDataError('Submissions could not be loaded. Confirm that the latest Firestore rules are deployed.')
        submissionsLoaded = true
        updateLoadingState()
      },
    )

    const unsubscribeLeads = onSnapshot(
      leadsQuery,
      (snapshot) => {
        setLeads(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Lead))
        leadsLoaded = true
        updateLoadingState()
      },
      (error) => {
        console.error('Unable to load leads.', error)
        setDataError('Leads could not be loaded. Confirm that the latest Firestore rules are deployed.')
        leadsLoaded = true
        updateLoadingState()
      },
    )

    return () => {
      unsubscribeSubmissions()
      unsubscribeLeads()
    }
  }, [accessState])

  const leadIds = useMemo(() => new Set(leads.map((lead) => lead.submissionId)), [leads])

  const filteredSubmissions = useMemo(() => {
    const search = searchTerm.trim().toLowerCase()

    return submissions.filter((submission) => {
      if (submissionFilter !== 'all' && submission.submissionType !== submissionFilter) return false
      if (!search) return true

      const searchable = [
        submission.contact.name,
        submission.contact.email,
        submission.contact.business,
        submission.contact.phone,
        submission.contact.location,
        submission.contact.instagram,
        ...Object.values(submission.payload).map(formatValue),
      ].join(' ').toLowerCase()

      return searchable.includes(search)
    })
  }, [searchTerm, submissionFilter, submissions])

  const filteredLeads = useMemo(() => {
    const search = searchTerm.trim().toLowerCase()
    if (!search) return leads

    return leads.filter((lead) => (
      [lead.contact.name, lead.contact.email, lead.contact.business, lead.stage]
        .join(' ')
        .toLowerCase()
        .includes(search)
    ))
  }, [leads, searchTerm])

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSigningIn) return

    setIsSigningIn(true)
    setLoginError('')
    setLoginNotice('')

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
      setPassword('')
    } catch (error) {
      console.error('Admin sign-in failed.', error)
      setLoginError('Sign-in failed. Check your email, password, and admin access, then try again.')
    } finally {
      setIsSigningIn(false)
    }
  }

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      setLoginError('Enter your admin email first, then request a password reset.')
      return
    }

    setLoginError('')
    try {
      await sendPasswordResetEmail(auth, email.trim())
      setLoginNotice('If that address is registered, a password reset email is on the way.')
    } catch (error) {
      console.error('Password reset request failed.', error)
      setLoginError('The reset email could not be requested right now. Please try again.')
    }
  }

  const handleSignOut = async () => {
    await signOut(auth)
    setSubmissions([])
    setLeads([])
    setIsLoadingData(true)
    setDataError('')
  }

  const addSubmissionAsLead = async (submission: Submission) => {
    const currentUser = auth.currentUser
    if (!currentUser || busyRecordId) return

    setBusyRecordId(submission.id)
    setDataError('')

    try {
      const leadReference = doc(db, 'leads', submission.id)
      const submissionReference = doc(db, 'submissions', submission.id)

      await runTransaction(db, async (transaction) => {
        const existingLead = await transaction.get(leadReference)

        if (!existingLead.exists()) {
          transaction.set(leadReference, {
            schemaVersion: 1,
            submissionId: submission.id,
            submissionType: submission.submissionType,
            stage: 'new',
            contact: submission.contact,
            source: submission.source,
            notes: '',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdBy: currentUser.uid,
            updatedBy: currentUser.uid,
          })
        }

        transaction.update(submissionReference, {
          status: 'lead',
          leadId: submission.id,
          updatedAt: serverTimestamp(),
          updatedBy: currentUser.uid,
        })
      })
    } catch (error) {
      console.error('Unable to add lead.', error)
      setDataError('That submission could not be added as a lead. Please try again.')
    } finally {
      setBusyRecordId('')
    }
  }

  const changeLeadStage = async (leadId: string, stage: LeadStage) => {
    const currentUser = auth.currentUser
    if (!currentUser || busyRecordId) return

    setBusyRecordId(leadId)
    setDataError('')

    try {
      await updateDoc(doc(db, 'leads', leadId), {
        stage,
        updatedAt: serverTimestamp(),
        updatedBy: currentUser.uid,
      })
    } catch (error) {
      console.error('Unable to update lead stage.', error)
      setDataError('The lead stage could not be updated. Please try again.')
    } finally {
      setBusyRecordId('')
    }
  }

  if (accessState === 'checking') {
    return (
      <main className="admin-auth-shell" id="main">
        <div className="admin-auth-card admin-auth-status" aria-live="polite">
          <ShieldCheck size={30} />
          <p>Verifying admin access...</p>
        </div>
      </main>
    )
  }

  if (accessState === 'signed-out') {
    return (
      <main className="admin-auth-shell" id="main">
        <section className="admin-auth-card">
          <Link className="admin-back-link" to="/">
            <ArrowLeft size={16} />
            Back to website
          </Link>
          <div className="admin-auth-mark"><ShieldCheck size={27} /></div>
          <p className="admin-eyebrow">PRIVATE WORKSPACE</p>
          <h1>Admin sign in</h1>
          <p className="admin-auth-intro">
            Review project inquiries, manage promotion applications, and move qualified contacts into your lead pipeline.
          </p>
          <form className="admin-login-form" onSubmit={handleLogin}>
            <label>
              Email address
              <input
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>
            {loginError && <p className="admin-form-message is-error" role="alert">{loginError}</p>}
            {loginNotice && <p className="admin-form-message is-success" role="status">{loginNotice}</p>}
            <button className="admin-primary-button" type="submit" disabled={isSigningIn}>
              {isSigningIn ? 'Signing in...' : 'Open dashboard'}
              <ArrowUpRight size={18} />
            </button>
            <button className="admin-text-button" type="button" onClick={handlePasswordReset}>
              Send a password reset email
            </button>
          </form>
        </section>
      </main>
    )
  }

  if (accessState === 'forbidden') {
    return (
      <main className="admin-auth-shell" id="main">
        <section className="admin-auth-card admin-auth-status">
          <CircleUserRound size={34} />
          <p className="admin-eyebrow">ACCESS NOT GRANTED</p>
          <h1>Admin claim required</h1>
          <p>
            {adminEmail || 'This account'} is authenticated, but its token does not include the required admin claim.
            Run the seed script, then sign in again.
          </p>
          <button className="admin-primary-button" type="button" onClick={handleSignOut}>
            Return to sign in
          </button>
        </section>
      </main>
    )
  }

  const newSubmissionCount = submissions.filter((submission) => submission.status === 'new').length
  const promotionCount = submissions.filter(
    (submission) => submission.submissionType === 'free_website_application',
  ).length

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div>
          <Link className="admin-brand" to="/">RAFA THE DEV</Link>
          <span>ADMIN WORKSPACE</span>
        </div>
        <div className="admin-account">
          <span>{adminEmail}</span>
          <button type="button" onClick={handleSignOut}>
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </header>

      <main className="admin-main" id="main">
        <section className="admin-heading">
          <div>
            <p className="admin-eyebrow">CLIENT PIPELINE</p>
            <h1>Opportunity dashboard</h1>
          </div>
          <p>Review every form submission, identify the strongest opportunities, and keep each lead moving.</p>
        </section>

        <section className="admin-stats" aria-label="Dashboard overview">
          <article>
            <Inbox size={20} />
            <span>New submissions</span>
            <strong>{newSubmissionCount}</strong>
          </article>
          <article>
            <Users size={20} />
            <span>Active leads</span>
            <strong>{leads.filter((lead) => !['won', 'lost'].includes(lead.stage)).length}</strong>
          </article>
          <article>
            <Gift size={20} />
            <span>Promotion entries</span>
            <strong>{promotionCount}</strong>
          </article>
          <article>
            <Check size={20} />
            <span>Won opportunities</span>
            <strong>{leads.filter((lead) => lead.stage === 'won').length}</strong>
          </article>
        </section>

        <div className="admin-workspace">
          <nav className="admin-tabs" aria-label="Dashboard sections">
            <button
              className={view === 'submissions' ? 'is-active' : ''}
              type="button"
              onClick={() => setView('submissions')}
            >
              <Inbox size={17} />
              Submissions
              <span>{submissions.length}</span>
            </button>
            <button
              className={view === 'leads' ? 'is-active' : ''}
              type="button"
              onClick={() => setView('leads')}
            >
              <BriefcaseBusiness size={17} />
              Leads
              <span>{leads.length}</span>
            </button>
          </nav>

          <div className="admin-controls">
            <label className="admin-search">
              <Search size={17} />
              <input
                type="search"
                placeholder={view === 'submissions' ? 'Search submissions' : 'Search leads'}
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </label>
            {view === 'submissions' && (
              <select
                aria-label="Filter submissions"
                value={submissionFilter}
                onChange={(event) => setSubmissionFilter(event.target.value as SubmissionFilter)}
              >
                <option value="all">All submission types</option>
                <option value="project_inquiry">Project inquiries</option>
                <option value="free_website_application">Free website applications</option>
              </select>
            )}
          </div>

          {dataError && <p className="admin-data-message is-error" role="alert">{dataError}</p>}
          {isLoadingData && <p className="admin-data-message">Loading your workspace...</p>}

          {!isLoadingData && view === 'submissions' && (
            <section className="admin-card-list" aria-label="Client submissions">
              {filteredSubmissions.length === 0 && (
                <div className="admin-empty-state">
                  <Inbox size={28} />
                  <h2>No submissions found</h2>
                  <p>New project inquiries and promotion applications will appear here.</p>
                </div>
              )}
              {filteredSubmissions.map((submission) => {
                const isLead = leadIds.has(submission.id) || Boolean(submission.leadId)
                return (
                  <article className="admin-record-card" key={submission.id}>
                    <div className="admin-record-topline">
                      <span className={`admin-type-badge is-${submission.submissionType}`}>
                        {submissionTypeLabel(submission.submissionType)}
                      </span>
                      <span className="admin-record-date">{formatDate(submission.submittedAt)}</span>
                    </div>
                    <div className="admin-record-heading">
                      <div>
                        <h2>{submission.contact.business || submission.contact.name}</h2>
                        <p>{submission.contact.name}</p>
                      </div>
                      <span className={`admin-status-badge is-${submission.status}`}>{submission.status}</span>
                    </div>
                    <ContactLinks contact={submission.contact} />
                    <details className="admin-details">
                      <summary>Review full submission</summary>
                      <SubmissionPayload payload={submission.payload} />
                    </details>
                    <div className="admin-record-actions">
                      <a className="admin-secondary-button" href={`mailto:${submission.contact.email}`}>
                        <Mail size={16} />
                        Email client
                      </a>
                      <button
                        className="admin-primary-button"
                        type="button"
                        disabled={isLead || busyRecordId === submission.id}
                        onClick={() => addSubmissionAsLead(submission)}
                      >
                        {isLead ? <Check size={17} /> : <UserPlus size={17} />}
                        {isLead ? 'Added to leads' : busyRecordId === submission.id ? 'Adding...' : 'Add to leads'}
                      </button>
                    </div>
                  </article>
                )
              })}
            </section>
          )}

          {!isLoadingData && view === 'leads' && (
            <section className="admin-card-list" aria-label="Lead pipeline">
              {filteredLeads.length === 0 && (
                <div className="admin-empty-state">
                  <BriefcaseBusiness size={28} />
                  <h2>No leads found</h2>
                  <p>Add a qualified submission to begin building your pipeline.</p>
                </div>
              )}
              {filteredLeads.map((lead) => (
                <article className="admin-record-card admin-lead-card" key={lead.id}>
                  <div className="admin-record-topline">
                    <span className={`admin-type-badge is-${lead.submissionType}`}>
                      {submissionTypeLabel(lead.submissionType)}
                    </span>
                    <span className="admin-record-date">Added {formatDate(lead.createdAt)}</span>
                  </div>
                  <div className="admin-record-heading">
                    <div>
                      <h2>{lead.contact.business || lead.contact.name}</h2>
                      <p>{lead.contact.name}</p>
                    </div>
                    <label className="admin-stage-select">
                      <span>Pipeline stage</span>
                      <select
                        value={lead.stage}
                        disabled={busyRecordId === lead.id}
                        onChange={(event) => changeLeadStage(lead.id, event.target.value as LeadStage)}
                      >
                        {leadStages.map((stage) => (
                          <option key={stage.value} value={stage.value}>{stage.label}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <ContactLinks contact={lead.contact} />
                  <div className="admin-lead-meta">
                    <span>Submission: {lead.submissionId}</span>
                    {lead.source.campaignId && <span>Campaign: {lead.source.campaignId}</span>}
                    <span>Updated: {formatDate(lead.updatedAt)}</span>
                  </div>
                  <div className="admin-record-actions">
                    <a className="admin-primary-button" href={`mailto:${lead.contact.email}`}>
                      <Mail size={16} />
                      Contact lead
                    </a>
                  </div>
                </article>
              ))}
            </section>
          )}
        </div>
      </main>
    </div>
  )
}

export default AdminPage
