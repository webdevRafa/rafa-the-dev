import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import {
  collection,
  deleteField,
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
  ExternalLink,
  Eye,
  EyeOff,
  Globe2,
  Inbox,
  LogOut,
  Mail,
  Pencil,
  Search,
  ShieldCheck,
  Trophy,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { auth, db } from '../firebase/firebaseConfig'
import './AdminPage.css'

type AccessState = 'checking' | 'signed-out' | 'authorized' | 'forbidden'
type DashboardView = 'submissions' | 'leads' | 'clients'
type SubmissionFilter = 'all' | 'project_inquiry' | 'free_website_application'
type LeadStage = 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost'
type ClientStatus = 'active' | 'completed' | 'archived'

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
  promotionOutcome?: 'winner'
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

type Client = {
  id: string
  schemaVersion: number
  leadId: string
  submissionId: string
  submissionType: Submission['submissionType']
  status: ClientStatus
  websiteUrl: string
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

const clientStatuses: Array<{ value: ClientStatus; label: string }> = [
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
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

function submissionStatusLabel(submission: Submission) {
  if (submission.promotionOutcome === 'winner') return 'Winner'
  return formatLabel(submission.status)
}

function normalizeWebsiteUrl(value: string) {
  const trimmedValue = value.trim()
  if (!trimmedValue) return ''

  const url = new URL(/^https?:\/\//i.test(trimmedValue) ? trimmedValue : `https://${trimmedValue}`)
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Unsupported website protocol')
  return url.toString()
}

function websiteLabel(value: string) {
  if (!value) return 'Website not added'

  try {
    return new URL(value).hostname.replace(/^www\./, '')
  } catch {
    return value
  }
}

function TabCount({ value }: { value: number }) {
  return <span className={value === 0 ? 'is-empty' : ''}>{value}</span>
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

function SubmissionModal({
  submission,
  isLead,
  isBusy,
  onClose,
  onAddLead,
  onToggleWinner,
}: {
  submission: Submission
  isLead: boolean
  isBusy: boolean
  onClose: () => void
  onAddLead: (submission: Submission) => void
  onToggleWinner: (submission: Submission) => void
}) {
  const closeButtonReference = useRef<HTMLButtonElement>(null)
  const isWinner = submission.promotionOutcome === 'winner'

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleEscape)
    closeButtonReference.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  return (
    <div
      className="admin-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        className="admin-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="submission-modal-title"
      >
        <header className="admin-modal-header">
          <div>
            <span className={`admin-type-badge is-${submission.submissionType}`}>
              {submissionTypeLabel(submission.submissionType)}
            </span>
            <span className="admin-record-date">{formatDate(submission.submittedAt)}</span>
          </div>
          <button
            ref={closeButtonReference}
            className="admin-icon-button"
            type="button"
            aria-label="Close submission"
            onClick={onClose}
          >
            <X size={19} />
          </button>
        </header>

        <div className="admin-modal-body">
          <div className="admin-modal-title-row">
            <div>
              <p className="admin-modal-person">{submission.contact.name}</p>
              <h2 id="submission-modal-title">
                {submission.contact.business || submission.contact.name}
              </h2>
            </div>
            <span className={`admin-status-badge is-${isWinner ? 'winner' : submission.status}`}>
              {submissionStatusLabel(submission)}
            </span>
          </div>

          <ContactLinks contact={submission.contact} />
          <SubmissionPayload payload={submission.payload} />
        </div>

        <footer
          className={`admin-modal-actions ${
            submission.submissionType === 'free_website_application' ? 'has-winner-action' : ''
          }`}
        >
          <a className="admin-secondary-button" href={`mailto:${submission.contact.email}`}>
            <Mail size={16} />
            Email
          </a>
          {submission.submissionType === 'free_website_application' && (
            <button
              className={`admin-secondary-button ${isWinner ? 'is-winner' : ''}`}
              type="button"
              disabled={isBusy}
              onClick={() => onToggleWinner(submission)}
            >
              <Trophy size={16} />
              {isWinner ? 'Remove winner' : 'Mark winner'}
            </button>
          )}
          <button
            className="admin-primary-button"
            type="button"
            disabled={isLead || isBusy}
            onClick={() => onAddLead(submission)}
          >
            {isLead ? <Check size={17} /> : <UserPlus size={17} />}
            {isLead ? 'Added to leads' : isBusy ? 'Adding...' : 'Add to leads'}
          </button>
        </footer>
      </section>
    </div>
  )
}

function ClientWebsiteModal({
  client,
  isBusy,
  onClose,
  onSave,
}: {
  client: Client
  isBusy: boolean
  onClose: () => void
  onSave: (clientId: string, websiteUrl: string) => Promise<boolean>
}) {
  const closeButtonReference = useRef<HTMLButtonElement>(null)
  const [websiteUrl, setWebsiteUrl] = useState(client.websiteUrl ?? '')
  const [websiteError, setWebsiteError] = useState('')

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isBusy) onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleEscape)
    closeButtonReference.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isBusy, onClose])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isBusy) return

    setWebsiteError('')

    try {
      const normalizedUrl = normalizeWebsiteUrl(websiteUrl)
      const wasSaved = await onSave(client.id, normalizedUrl)
      if (wasSaved) onClose()
    } catch {
      setWebsiteError('Enter a valid website address, such as example.com.')
    }
  }

  return (
    <div
      className="admin-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isBusy) onClose()
      }}
    >
      <section
        className="admin-modal admin-website-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="website-modal-title"
      >
        <header className="admin-modal-header">
          <div>
            <span className="admin-status-badge is-client">Client website</span>
          </div>
          <button
            ref={closeButtonReference}
            className="admin-icon-button"
            type="button"
            aria-label="Close website editor"
            disabled={isBusy}
            onClick={onClose}
          >
            <X size={19} />
          </button>
        </header>

        <form className="admin-website-form" onSubmit={handleSubmit}>
          <div>
            <p className="admin-modal-person">{client.contact.name}</p>
            <h2 id="website-modal-title">{client.contact.business || client.contact.name}</h2>
          </div>
          <label>
            Website URL
            <input
              type="text"
              inputMode="url"
              autoComplete="url"
              placeholder="example.com"
              value={websiteUrl}
              onChange={(event) => setWebsiteUrl(event.target.value)}
              autoFocus
            />
          </label>
          <p className="admin-field-help">You can paste the domain without https://. Leave it blank to remove the saved URL.</p>
          {websiteError && <p className="admin-form-message is-error" role="alert">{websiteError}</p>}
          <div className="admin-website-form-actions">
            <button className="admin-secondary-button" type="button" disabled={isBusy} onClick={onClose}>
              Cancel
            </button>
            <button className="admin-primary-button" type="submit" disabled={isBusy}>
              {isBusy ? 'Saving...' : 'Save website'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

function AdminPage() {
  const [accessState, setAccessState] = useState<AccessState>('checking')
  const [adminEmail, setAdminEmail] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [loginNotice, setLoginNotice] = useState('')
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [view, setView] = useState<DashboardView>('submissions')
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [dataError, setDataError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [submissionFilter, setSubmissionFilter] = useState<SubmissionFilter>('all')
  const [busyRecordId, setBusyRecordId] = useState('')
  const [selectedSubmissionId, setSelectedSubmissionId] = useState('')
  const [selectedClientId, setSelectedClientId] = useState('')

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
    const clientsQuery = query(collection(db, 'clients'), orderBy('createdAt', 'desc'), limit(250))

    let submissionsLoaded = false
    let leadsLoaded = false
    let clientsLoaded = false
    const updateLoadingState = () => (
      setIsLoadingData(!(submissionsLoaded && leadsLoaded && clientsLoaded))
    )

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

    const unsubscribeClients = onSnapshot(
      clientsQuery,
      (snapshot) => {
        setClients(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Client))
        clientsLoaded = true
        updateLoadingState()
      },
      (error) => {
        console.error('Unable to load clients.', error)
        setDataError('Clients could not be loaded. Confirm that the latest Firestore rules are deployed.')
        clientsLoaded = true
        updateLoadingState()
      },
    )

    return () => {
      unsubscribeSubmissions()
      unsubscribeLeads()
      unsubscribeClients()
    }
  }, [accessState])

  const leadIds = useMemo(() => new Set(leads.map((lead) => lead.submissionId)), [leads])
  const clientIds = useMemo(() => new Set(clients.map((client) => client.leadId)), [clients])
  const selectedSubmission = useMemo(
    () => submissions.find((submission) => submission.id === selectedSubmissionId),
    [selectedSubmissionId, submissions],
  )
  const closeSubmission = useCallback(() => setSelectedSubmissionId(''), [])
  const selectedClient = useMemo(
    () => clients.find((client) => client.id === selectedClientId),
    [clients, selectedClientId],
  )
  const closeClientWebsite = useCallback(() => setSelectedClientId(''), [])

  const selectView = (nextView: DashboardView) => {
    setView(nextView)
    setSearchTerm('')
  }

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

  const filteredClients = useMemo(() => {
    const search = searchTerm.trim().toLowerCase()
    if (!search) return clients

    return clients.filter((client) => (
      [
        client.contact.name,
        client.contact.email,
        client.contact.business,
        client.contact.phone,
        client.websiteUrl,
        client.status,
      ]
        .join(' ')
        .toLowerCase()
        .includes(search)
    ))
  }, [clients, searchTerm])

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSigningIn) return

    setIsSigningIn(true)
    setLoginError('')
    setLoginNotice('')

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
      setPassword('')
      setIsPasswordVisible(false)
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
    setClients([])
    setIsLoadingData(true)
    setDataError('')
    setSelectedSubmissionId('')
    setSelectedClientId('')
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

  const addLeadAsClient = async (lead: Lead) => {
    const currentUser = auth.currentUser
    if (!currentUser || busyRecordId) return

    setBusyRecordId(lead.id)
    setDataError('')

    try {
      const clientReference = doc(db, 'clients', lead.id)
      const leadReference = doc(db, 'leads', lead.id)
      const submissionReference = doc(db, 'submissions', lead.submissionId)

      await runTransaction(db, async (transaction) => {
        const existingClient = await transaction.get(clientReference)

        if (!existingClient.exists()) {
          transaction.set(clientReference, {
            schemaVersion: 1,
            leadId: lead.id,
            submissionId: lead.submissionId,
            submissionType: lead.submissionType,
            status: 'active',
            websiteUrl: '',
            contact: lead.contact,
            source: lead.source,
            notes: lead.notes ?? '',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdBy: currentUser.uid,
            updatedBy: currentUser.uid,
          })
        }

        transaction.update(leadReference, {
          stage: 'won',
          clientId: lead.id,
          convertedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          updatedBy: currentUser.uid,
        })

        transaction.update(submissionReference, {
          status: 'client',
          clientId: lead.id,
          updatedAt: serverTimestamp(),
          updatedBy: currentUser.uid,
        })
      })

      setSelectedClientId(lead.id)
      selectView('clients')
    } catch (error) {
      console.error('Unable to add client.', error)
      setDataError('That lead could not be converted to a client. Please try again.')
    } finally {
      setBusyRecordId('')
    }
  }

  const changeClientStatus = async (clientId: string, status: ClientStatus) => {
    const currentUser = auth.currentUser
    if (!currentUser || busyRecordId) return

    setBusyRecordId(clientId)
    setDataError('')

    try {
      await updateDoc(doc(db, 'clients', clientId), {
        status,
        updatedAt: serverTimestamp(),
        updatedBy: currentUser.uid,
      })
    } catch (error) {
      console.error('Unable to update client status.', error)
      setDataError('The client status could not be updated. Please try again.')
    } finally {
      setBusyRecordId('')
    }
  }

  const saveClientWebsite = async (clientId: string, websiteUrl: string) => {
    const currentUser = auth.currentUser
    if (!currentUser || busyRecordId) return false

    setBusyRecordId(clientId)
    setDataError('')

    try {
      await updateDoc(doc(db, 'clients', clientId), {
        websiteUrl,
        updatedAt: serverTimestamp(),
        updatedBy: currentUser.uid,
      })
      return true
    } catch (error) {
      console.error('Unable to save client website.', error)
      setDataError('The client website could not be saved. Please try again.')
      return false
    } finally {
      setBusyRecordId('')
    }
  }

  const togglePromotionWinner = async (submission: Submission) => {
    const currentUser = auth.currentUser
    if (!currentUser || busyRecordId) return

    setBusyRecordId(submission.id)
    setDataError('')

    try {
      await updateDoc(doc(db, 'submissions', submission.id), {
        promotionOutcome: submission.promotionOutcome === 'winner' ? deleteField() : 'winner',
        updatedAt: serverTimestamp(),
        updatedBy: currentUser.uid,
      })
    } catch (error) {
      console.error('Unable to update promotion winner.', error)
      setDataError('The winner status could not be updated. Please try again.')
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
            <div className="admin-login-field">
              <label htmlFor="admin-password">Password</label>
              <span className="admin-password-field">
                <input
                  id="admin-password"
                  type={isPasswordVisible ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <button
                  type="button"
                  aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                  aria-pressed={isPasswordVisible}
                  onClick={() => setIsPasswordVisible((currentValue) => !currentValue)}
                >
                  {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </span>
            </div>
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
  const openLeadCount = leads.filter((lead) => !['won', 'lost'].includes(lead.stage)).length
  const freeSiteWinnerCount = submissions.filter(
    (submission) => (
      submission.submissionType === 'free_website_application'
      && submission.promotionOutcome === 'winner'
    ),
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
        <section className="admin-stats" aria-label="Dashboard overview">
          <article>
            <span>New submissions</span>
            <strong>{newSubmissionCount}</strong>
          </article>
          <article>
            <span>Open leads</span>
            <strong>{openLeadCount}</strong>
          </article>
          <article>
            <span>Promotion entries</span>
            <strong>{promotionCount}</strong>
          </article>
          <article>
            <span>Free site winners</span>
            <strong>{freeSiteWinnerCount}</strong>
          </article>
        </section>

        <div className="admin-workspace">
          <nav className="admin-tabs" aria-label="Dashboard sections">
            <button
              className={view === 'submissions' ? 'is-active' : ''}
              type="button"
              onClick={() => selectView('submissions')}
            >
              <Inbox size={17} />
              Submissions
              <TabCount value={submissions.length} />
            </button>
            <button
              className={view === 'leads' ? 'is-active' : ''}
              type="button"
              onClick={() => selectView('leads')}
            >
              <BriefcaseBusiness size={17} />
              Leads
              <TabCount value={leads.length} />
            </button>
            <button
              className={view === 'clients' ? 'is-active' : ''}
              type="button"
              onClick={() => selectView('clients')}
            >
              <Users size={17} />
              Clients
              <TabCount value={clients.length} />
            </button>
          </nav>

          <div className={`admin-controls ${view === 'submissions' ? 'has-filter' : ''}`}>
            <label className="admin-search">
              <Search size={17} />
              <input
                type="search"
                placeholder={
                  view === 'submissions'
                    ? 'Search submissions'
                    : view === 'leads'
                      ? 'Search leads'
                      : 'Search clients'
                }
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
            <section className="admin-records-section" aria-label="Client submissions">
              {filteredSubmissions.length === 0 && (
                <div className="admin-empty-state">
                  <Inbox size={28} />
                  <h2>No submissions found</h2>
                  <p>New project inquiries and promotion applications will appear here.</p>
                </div>
              )}
              {filteredSubmissions.length > 0 && (
                <>
                  <div className="admin-table-shell admin-desktop-only">
                    <table className="admin-data-table">
                      <caption className="admin-sr-only">Client form submissions</caption>
                      <thead>
                        <tr>
                          <th scope="col">Contact</th>
                          <th scope="col">Type</th>
                          <th scope="col">Submitted</th>
                          <th scope="col">Status</th>
                          <th scope="col"><span className="admin-sr-only">Actions</span></th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSubmissions.map((submission) => {
                          const isLead = leadIds.has(submission.id) || Boolean(submission.leadId)
                          const isBusy = busyRecordId === submission.id
                          const isWinner = submission.promotionOutcome === 'winner'

                          return (
                            <tr key={submission.id}>
                              <td>
                                <div className="admin-table-contact">
                                  <strong>{submission.contact.business || submission.contact.name}</strong>
                                  {submission.contact.business && <span>{submission.contact.name}</span>}
                                  <a href={`mailto:${submission.contact.email}`}>{submission.contact.email}</a>
                                </div>
                              </td>
                              <td>
                                <span className={`admin-type-badge is-${submission.submissionType}`}>
                                  {submissionTypeLabel(submission.submissionType)}
                                </span>
                              </td>
                              <td className="admin-table-date">{formatDate(submission.submittedAt)}</td>
                              <td>
                                <span className={`admin-status-badge is-${isWinner ? 'winner' : submission.status}`}>
                                  {submissionStatusLabel(submission)}
                                </span>
                              </td>
                              <td>
                                <div className="admin-row-actions">
                                  <button
                                    className="admin-row-button"
                                    type="button"
                                    onClick={() => setSelectedSubmissionId(submission.id)}
                                  >
                                    <Eye size={15} />
                                    Review
                                  </button>
                                  <button
                                    className="admin-row-button is-primary"
                                    type="button"
                                    disabled={isLead || isBusy}
                                    onClick={() => addSubmissionAsLead(submission)}
                                  >
                                    {isLead ? <Check size={15} /> : <UserPlus size={15} />}
                                    {isLead ? 'Added' : isBusy ? 'Adding...' : 'Add lead'}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="admin-mobile-list admin-mobile-only">
                    {filteredSubmissions.map((submission) => {
                      const isLead = leadIds.has(submission.id) || Boolean(submission.leadId)
                      const isBusy = busyRecordId === submission.id
                      const isWinner = submission.promotionOutcome === 'winner'

                      return (
                        <article className="admin-mobile-record" key={submission.id}>
                          <div className="admin-mobile-record-topline">
                            <span className={`admin-type-badge is-${submission.submissionType}`}>
                              {submissionTypeLabel(submission.submissionType)}
                            </span>
                            <span className="admin-record-date">{formatDate(submission.submittedAt)}</span>
                          </div>
                          <div className="admin-mobile-record-heading">
                            <div>
                              <h2>{submission.contact.business || submission.contact.name}</h2>
                              {submission.contact.business && <p>{submission.contact.name}</p>}
                            </div>
                            <span className={`admin-status-badge is-${isWinner ? 'winner' : submission.status}`}>
                              {submissionStatusLabel(submission)}
                            </span>
                          </div>
                          <a className="admin-mobile-email" href={`mailto:${submission.contact.email}`}>
                            {submission.contact.email}
                          </a>
                          <div className="admin-mobile-actions">
                            <button
                              className="admin-row-button"
                              type="button"
                              onClick={() => setSelectedSubmissionId(submission.id)}
                            >
                              <Eye size={15} />
                              Review
                            </button>
                            <button
                              className="admin-row-button is-primary"
                              type="button"
                              disabled={isLead || isBusy}
                              onClick={() => addSubmissionAsLead(submission)}
                            >
                              {isLead ? <Check size={15} /> : <UserPlus size={15} />}
                              {isLead ? 'Added' : isBusy ? 'Adding...' : 'Add lead'}
                            </button>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                </>
              )}
            </section>
          )}

          {!isLoadingData && view === 'leads' && (
            <section className="admin-records-section" aria-label="Lead pipeline">
              {filteredLeads.length === 0 && (
                <div className="admin-empty-state">
                  <BriefcaseBusiness size={28} />
                  <h2>No leads found</h2>
                  <p>Add a qualified submission to begin building your pipeline.</p>
                </div>
              )}
              {filteredLeads.length > 0 && (
                <>
                  <div className="admin-table-shell admin-desktop-only">
                    <table className="admin-data-table">
                      <caption className="admin-sr-only">Lead pipeline</caption>
                      <thead>
                        <tr>
                          <th scope="col">Contact</th>
                          <th scope="col">Source</th>
                          <th scope="col">Stage</th>
                          <th scope="col">Updated</th>
                          <th scope="col"><span className="admin-sr-only">Actions</span></th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredLeads.map((lead) => (
                          <tr key={lead.id}>
                            <td>
                              <div className="admin-table-contact">
                                <strong>{lead.contact.business || lead.contact.name}</strong>
                                {lead.contact.business && <span>{lead.contact.name}</span>}
                                <a href={`mailto:${lead.contact.email}`}>{lead.contact.email}</a>
                              </div>
                            </td>
                            <td>
                              <span className={`admin-type-badge is-${lead.submissionType}`}>
                                {submissionTypeLabel(lead.submissionType)}
                              </span>
                              {lead.source.campaignId && (
                                <span className="admin-table-campaign">{lead.source.campaignId}</span>
                              )}
                            </td>
                            <td>
                              <select
                                className="admin-compact-select"
                                aria-label={`Pipeline stage for ${lead.contact.business || lead.contact.name}`}
                                value={lead.stage}
                                disabled={busyRecordId === lead.id}
                                onChange={(event) => changeLeadStage(lead.id, event.target.value as LeadStage)}
                              >
                                {leadStages.map((stage) => (
                                  <option key={stage.value} value={stage.value}>{stage.label}</option>
                                ))}
                              </select>
                            </td>
                            <td className="admin-table-date">{formatDate(lead.updatedAt)}</td>
                            <td>
                              <div className="admin-row-actions">
                                <a className="admin-row-button" href={`mailto:${lead.contact.email}`}>
                                  <Mail size={15} />
                                  Email
                                </a>
                                <button
                                  className="admin-row-button is-primary"
                                  type="button"
                                  disabled={clientIds.has(lead.id) || busyRecordId === lead.id}
                                  onClick={() => addLeadAsClient(lead)}
                                >
                                  {clientIds.has(lead.id) ? <Check size={15} /> : <UserPlus size={15} />}
                                  {clientIds.has(lead.id)
                                    ? 'Client'
                                    : busyRecordId === lead.id
                                      ? 'Converting...'
                                      : 'Add client'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="admin-mobile-list admin-mobile-only">
                    {filteredLeads.map((lead) => (
                      <article className="admin-mobile-record" key={lead.id}>
                        <div className="admin-mobile-record-topline">
                          <span className={`admin-type-badge is-${lead.submissionType}`}>
                            {submissionTypeLabel(lead.submissionType)}
                          </span>
                          <span className="admin-record-date">{formatDate(lead.updatedAt)}</span>
                        </div>
                        <div className="admin-mobile-record-heading">
                          <div>
                            <h2>{lead.contact.business || lead.contact.name}</h2>
                            {lead.contact.business && <p>{lead.contact.name}</p>}
                          </div>
                        </div>
                        <a className="admin-mobile-email" href={`mailto:${lead.contact.email}`}>
                          {lead.contact.email}
                        </a>
                        <div className="admin-mobile-actions">
                          <select
                            className="admin-compact-select"
                            aria-label={`Pipeline stage for ${lead.contact.business || lead.contact.name}`}
                            value={lead.stage}
                            disabled={busyRecordId === lead.id}
                            onChange={(event) => changeLeadStage(lead.id, event.target.value as LeadStage)}
                          >
                            {leadStages.map((stage) => (
                              <option key={stage.value} value={stage.value}>{stage.label}</option>
                            ))}
                          </select>
                          <a className="admin-row-button" href={`mailto:${lead.contact.email}`}>
                            <Mail size={15} />
                            Email
                          </a>
                          <button
                            className="admin-row-button is-primary"
                            type="button"
                            disabled={clientIds.has(lead.id) || busyRecordId === lead.id}
                            onClick={() => addLeadAsClient(lead)}
                          >
                            {clientIds.has(lead.id) ? <Check size={15} /> : <UserPlus size={15} />}
                            {clientIds.has(lead.id)
                              ? 'Client'
                              : busyRecordId === lead.id
                                ? 'Converting...'
                                : 'Add client'}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </>
              )}
            </section>
          )}

          {!isLoadingData && view === 'clients' && (
            <section className="admin-records-section" aria-label="Clients">
              {filteredClients.length === 0 && (
                <div className="admin-empty-state">
                  <Globe2 size={28} />
                  <h2>No clients found</h2>
                  <p>Convert a lead when the project is confirmed, then save the client&apos;s website here.</p>
                </div>
              )}
              {filteredClients.length > 0 && (
                <>
                  <div className="admin-table-shell admin-desktop-only">
                    <table className="admin-data-table">
                      <caption className="admin-sr-only">Clients</caption>
                      <thead>
                        <tr>
                          <th scope="col">Contact</th>
                          <th scope="col">Website</th>
                          <th scope="col">Status</th>
                          <th scope="col">Client since</th>
                          <th scope="col"><span className="admin-sr-only">Actions</span></th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredClients.map((client) => (
                          <tr key={client.id}>
                            <td>
                              <div className="admin-table-contact">
                                <strong>{client.contact.business || client.contact.name}</strong>
                                {client.contact.business && <span>{client.contact.name}</span>}
                                <a href={`mailto:${client.contact.email}`}>{client.contact.email}</a>
                              </div>
                            </td>
                            <td>
                              {client.websiteUrl ? (
                                <a
                                  className="admin-website-link"
                                  href={client.websiteUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  {websiteLabel(client.websiteUrl)}
                                  <ExternalLink size={14} />
                                </a>
                              ) : (
                                <span className="admin-website-missing">Website not added</span>
                              )}
                            </td>
                            <td>
                              <select
                                className="admin-compact-select"
                                aria-label={`Status for ${client.contact.business || client.contact.name}`}
                                value={client.status}
                                disabled={busyRecordId === client.id}
                                onChange={(event) => (
                                  changeClientStatus(client.id, event.target.value as ClientStatus)
                                )}
                              >
                                {clientStatuses.map((status) => (
                                  <option key={status.value} value={status.value}>{status.label}</option>
                                ))}
                              </select>
                            </td>
                            <td className="admin-table-date">{formatDate(client.createdAt)}</td>
                            <td>
                              <div className="admin-row-actions">
                                <a className="admin-row-button" href={`mailto:${client.contact.email}`}>
                                  <Mail size={15} />
                                  Email
                                </a>
                                <button
                                  className="admin-row-button is-primary"
                                  type="button"
                                  onClick={() => setSelectedClientId(client.id)}
                                >
                                  <Pencil size={15} />
                                  {client.websiteUrl ? 'Edit site' : 'Add site'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="admin-mobile-list admin-mobile-only">
                    {filteredClients.map((client) => (
                      <article className="admin-mobile-record" key={client.id}>
                        <div className="admin-mobile-record-topline">
                          <span className={`admin-type-badge is-${client.submissionType}`}>
                            {submissionTypeLabel(client.submissionType)}
                          </span>
                          <span className="admin-record-date">Client since {formatDate(client.createdAt)}</span>
                        </div>
                        <div className="admin-mobile-record-heading">
                          <div>
                            <h2>{client.contact.business || client.contact.name}</h2>
                            {client.contact.business && <p>{client.contact.name}</p>}
                          </div>
                        </div>
                        <a className="admin-mobile-email" href={`mailto:${client.contact.email}`}>
                          {client.contact.email}
                        </a>
                        {client.websiteUrl ? (
                          <a
                            className="admin-website-link admin-mobile-website"
                            href={client.websiteUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {websiteLabel(client.websiteUrl)}
                            <ExternalLink size={14} />
                          </a>
                        ) : (
                          <span className="admin-website-missing admin-mobile-website">Website not added</span>
                        )}
                        <div className="admin-mobile-actions">
                          <select
                            className="admin-compact-select"
                            aria-label={`Status for ${client.contact.business || client.contact.name}`}
                            value={client.status}
                            disabled={busyRecordId === client.id}
                            onChange={(event) => (
                              changeClientStatus(client.id, event.target.value as ClientStatus)
                            )}
                          >
                            {clientStatuses.map((status) => (
                              <option key={status.value} value={status.value}>{status.label}</option>
                            ))}
                          </select>
                          <a className="admin-row-button" href={`mailto:${client.contact.email}`}>
                            <Mail size={15} />
                            Email
                          </a>
                          <button
                            className="admin-row-button is-primary"
                            type="button"
                            onClick={() => setSelectedClientId(client.id)}
                          >
                            <Pencil size={15} />
                            {client.websiteUrl ? 'Edit site' : 'Add site'}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </>
              )}
            </section>
          )}
        </div>
      </main>

      {selectedSubmission && (
        <SubmissionModal
          submission={selectedSubmission}
          isLead={leadIds.has(selectedSubmission.id) || Boolean(selectedSubmission.leadId)}
          isBusy={busyRecordId === selectedSubmission.id}
          onClose={closeSubmission}
          onAddLead={addSubmissionAsLead}
          onToggleWinner={togglePromotionWinner}
        />
      )}

      {selectedClient && (
        <ClientWebsiteModal
          client={selectedClient}
          isBusy={busyRecordId === selectedClient.id}
          onClose={closeClientWebsite}
          onSave={saveClientWebsite}
        />
      )}
    </div>
  )
}

export default AdminPage
