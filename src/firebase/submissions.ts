import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from './firebaseConfig'

const SUBMISSIONS_COLLECTION = 'submissions'
const SCHEMA_VERSION = 1

type SubmissionSource = {
  site: 'rafa-the-dev'
  route: '/' | '/free-website'
  formId: 'homepage-project-inquiry' | 'free-website-application'
  campaignId: string
}

export type ProjectInquiryInput = {
  name: string
  email: string
  business: string
  capabilities: string[]
  message: string
  timing: string
  budget: string
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
