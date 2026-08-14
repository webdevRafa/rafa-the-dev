import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from './firebaseConfig'
import type { ProjectBudget } from '../projectInquiryOptions'

const SUBMISSIONS_COLLECTION = 'submissions'
const SCHEMA_VERSION = 1

type SubmissionSource = {
  site: 'rafa-the-dev'
  route: '/' | '/free-website' | `/packages/${string}`
  formId: 'homepage-project-inquiry' | 'free-website-application' | 'package-inquiry'
  campaignId: string
}

export type ProjectInquiryInput = {
  name: string
  email: string
  business: string
  capabilities: string[]
  message: string
  timing: string
  budget: ProjectBudget | ''
}

export type FreeWebsiteApplicationInput = {
  name: string
  email: string
  phone: string
  location: string
  projectName: string
  instagram: string
  projectType: string
  currentPresence: string
  story: string
  impact: string
  audience: string
  scope: string[]
  visitorAction: string
  contentReadiness: string
  notes: string
  followsInstagram: boolean
  scopeAcknowledged: boolean
}

export type PackageInquiryInput = {
  name: string
  email: string
  business: string
  phone: string
  timing: string
  message: string
  packageId: string
  packageName: string
  packageRoute: `/packages/${string}`
  selectedAddOns: string[]
  basePrice: number
  addOnTotal: number
  estimatedTotal: number
}

function cleanText(value: string, maximumLength: number) {
  return value.trim().slice(0, maximumLength)
}

function cleanEmail(value: string) {
  return cleanText(value, 254).toLowerCase()
}

function cleanList(values: string[], maximumItems: number, maximumItemLength: number) {
  return [...new Set(values.map((value) => cleanText(value, maximumItemLength)).filter(Boolean))]
    .slice(0, maximumItems)
}

function cleanPrice(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.min(100000, Math.max(0, Math.round(value)))
}

function baseSubmission(
  submissionType: 'project_inquiry' | 'free_website_application',
  source: SubmissionSource,
) {
  return {
    schemaVersion: SCHEMA_VERSION,
    submissionType,
    status: 'new',
    submittedAt: serverTimestamp(),
    source,
  } as const
}

export async function submitProjectInquiry(input: ProjectInquiryInput) {
  const submission = {
    ...baseSubmission('project_inquiry', {
      site: 'rafa-the-dev',
      route: '/',
      formId: 'homepage-project-inquiry',
      campaignId: '',
    }),
    contact: {
      name: cleanText(input.name, 120),
      email: cleanEmail(input.email),
      business: cleanText(input.business, 160),
      phone: '',
      location: '',
      instagram: '',
    },
    payload: {
      capabilities: cleanList(input.capabilities, 9, 80),
      message: cleanText(input.message, 5000),
      timing: cleanText(input.timing, 80),
      budget: cleanText(input.budget, 80),
    },
  }

  const submissionReference = await addDoc(collection(db, SUBMISSIONS_COLLECTION), submission)
  return submissionReference.id
}

export async function submitPackageInquiry(input: PackageInquiryInput) {
  const basePrice = cleanPrice(input.basePrice)
  const addOnTotal = cleanPrice(input.addOnTotal)
  const estimatedTotal = cleanPrice(input.estimatedTotal)
  const selectedAddOns = cleanList(input.selectedAddOns, 8, 120)

  const submission = {
    ...baseSubmission('project_inquiry', {
      site: 'rafa-the-dev',
      route: input.packageRoute,
      formId: 'package-inquiry',
      campaignId: '',
    }),
    contact: {
      name: cleanText(input.name, 120),
      email: cleanEmail(input.email),
      business: cleanText(input.business, 160),
      phone: cleanText(input.phone, 40),
      location: '',
      instagram: '',
    },
    payload: {
      capabilities: [cleanText(input.packageName, 120), ...selectedAddOns],
      message: cleanText(input.message, 5000),
      timing: cleanText(input.timing, 80),
      budget: `Planning estimate: $${estimatedTotal.toLocaleString('en-US')}`,
      packageId: cleanText(input.packageId, 80),
      packageName: cleanText(input.packageName, 120),
      selectedAddOns,
      basePrice,
      addOnTotal,
      estimatedTotal,
    },
  }

  const submissionReference = await addDoc(collection(db, SUBMISSIONS_COLLECTION), submission)
  return submissionReference.id
}

export async function submitFreeWebsiteApplication(input: FreeWebsiteApplicationInput) {
  const campaignId = import.meta.env.VITE_FREE_WEBSITE_CAMPAIGN_ID?.trim() || 'free-website'
  const submission = {
    ...baseSubmission('free_website_application', {
      site: 'rafa-the-dev',
      route: '/free-website',
      formId: 'free-website-application',
      campaignId: cleanText(campaignId, 100),
    }),
    contact: {
      name: cleanText(input.name, 120),
      email: cleanEmail(input.email),
      business: cleanText(input.projectName, 160),
      phone: cleanText(input.phone, 40),
      location: cleanText(input.location, 160),
      instagram: cleanText(input.instagram, 80),
    },
    payload: {
      projectType: cleanText(input.projectType, 100),
      currentPresence: cleanText(input.currentPresence, 500),
      story: cleanText(input.story, 8000),
      impact: cleanText(input.impact, 5000),
      audience: cleanText(input.audience, 5000),
      scope: cleanList(input.scope, 8, 80),
      visitorAction: cleanText(input.visitorAction, 100),
      contentReadiness: cleanText(input.contentReadiness, 100),
      notes: cleanText(input.notes, 5000),
      followsInstagram: input.followsInstagram,
      scopeAcknowledged: input.scopeAcknowledged,
    },
  }

  const submissionReference = await addDoc(collection(db, SUBMISSIONS_COLLECTION), submission)
  return submissionReference.id
}
