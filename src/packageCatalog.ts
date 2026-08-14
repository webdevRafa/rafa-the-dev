export type PackageAddOn = {
  id: string
  name: string
  description: string
  price: number
}

export type ServicePackage = {
  id: string
  slug: string
  name: string
  shortName: string
  price: number
  timeline: string
  architecture: string
  featured?: boolean
  accent: 'cyan' | 'violet' | 'coral'
  note: string
  idealFor: string
  features: string[]
  includes: Array<{ title: string; description: string }>
  addOns: PackageAddOn[]
}

export const servicePackages: ServicePackage[] = [
  {
    id: 'brochure-website',
    slug: 'brochure-website',
    name: 'Brochure Website',
    shortName: 'Brochure site',
    price: 500,
    timeline: '1–2 weeks',
    architecture: 'Light — lead capture only',
    accent: 'cyan',
    note: 'A clean, credible website for a business that needs to explain its services and make it easy to get in touch.',
    idealFor: 'Local businesses, independent professionals, new ventures, and established companies replacing an outdated site.',
    features: ['Up to five focused pages', 'Responsive custom build', 'Contact or inquiry form', 'Launch-ready essentials'],
    includes: [
      { title: 'Up to five pages', description: 'A practical page set such as Home, About, Services, Gallery, and Contact.' },
      { title: 'Custom responsive design', description: 'A polished experience built for phones, tablets, and desktop screens.' },
      { title: 'Lead capture', description: 'A secure inquiry form with confirmation email and an organized admin record.' },
      { title: 'Launch foundation', description: 'Performance, accessibility, metadata, domain connection, and production deployment.' },
    ],
    addOns: [
      { id: 'search-visibility', name: 'Search visibility setup', description: 'Keyword-aware titles, descriptions, sitemap, robots rules, and search-console readiness.', price: 250 },
      { id: 'local-business-seo', name: 'Local business SEO', description: 'LocalBusiness schema, location signals, service-area content guidance, and map integration.', price: 150 },
      { id: 'copy-refinement', name: 'Copy refinement', description: 'I polish and restructure your supplied copy so it reads clearly and confidently.', price: 200 },
      { id: 'appointment-requests', name: 'Appointment request flow', description: 'A focused multi-field request experience with the details you need before following up.', price: 300 },
    ],
  },
  {
    id: 'connected-business-site',
    slug: 'connected-business-site',
    name: 'Connected Business Site',
    shortName: 'Connected site',
    price: 1500,
    timeline: '2–5 weeks',
    architecture: 'Focused — one core workflow',
    featured: true,
    accent: 'violet',
    note: 'A customer-facing website connected to one useful workflow your business needs to collect, manage, or act on.',
    idealFor: 'Service businesses ready to move beyond a brochure site into bookings, deposits, structured requests, or managed records.',
    features: ['Flexible marketing pages', 'One Firestore workflow', 'Automated notifications', 'Simple record management'],
    includes: [
      { title: 'Business website', description: 'The responsive marketing experience and launch foundation from the brochure package.' },
      { title: 'Focused data model', description: 'A secure Firestore structure designed around one core customer or operational workflow.' },
      { title: 'Workflow interface', description: 'A purpose-built form or flow for structured requests, applications, reservations, or intake.' },
      { title: 'Record visibility', description: 'A lightweight admin view or organized record system so submissions are useful after they arrive.' },
    ],
    addOns: [
      { id: 'search-visibility', name: 'Search visibility setup', description: 'Technical on-page SEO, sitemap, structured metadata, and search-console readiness.', price: 300 },
      { id: 'booking-workflow', name: 'Booking workflow', description: 'Availability, scheduling rules, confirmations, and rescheduling logic.', price: 500 },
      { id: 'stripe-payments', name: 'Stripe payments or deposits', description: 'A secure checkout flow with payment-status tracking.', price: 600 },
      { id: 'email-automation', name: 'Customer email automation', description: 'Branded transactional messages for the key moments in your workflow.', price: 250 },
      { id: 'admin-dashboard', name: 'Expanded admin dashboard', description: 'Filtering, statuses, notes, and management actions for your records.', price: 700 },
    ],
  },
  {
    id: 'custom-business-system',
    slug: 'custom-business-system',
    name: 'Custom Business System',
    shortName: 'Custom system',
    price: 5000,
    timeline: 'Scoped together',
    architecture: 'Advanced — roles + connected data',
    accent: 'coral',
    note: 'A complete web application for portals, operations, marketplaces, dashboards, or interconnected business processes.',
    idealFor: 'Businesses replacing spreadsheets and scattered tools, creating a client portal, or launching a custom digital product.',
    features: ['Product + data blueprint', 'Authentication and roles', 'One core business workflow', 'Admin tools + deployment'],
    includes: [
      { title: 'Technical product blueprint', description: 'The users, records, permissions, workflows, and first release are mapped before development.' },
      { title: 'Secure application foundation', description: 'Authentication, role-aware access, Firestore rules, indexes, and production infrastructure.' },
      { title: 'Core workflow', description: 'One complete business process designed, built, tested, and connected to the underlying data.' },
      { title: 'Operational workspace', description: 'Admin tools for the records, statuses, and actions your team needs to manage.' },
    ],
    addOns: [
      { id: 'search-ready-pages', name: 'Search-ready marketing pages', description: 'A public marketing layer with on-page SEO and conversion-focused content structure.', price: 350 },
      { id: 'additional-role', name: 'Additional user role', description: 'A distinct permission model and experience for another type of user.', price: 500 },
      { id: 'additional-workflow', name: 'Additional core workflow', description: 'Another connected business process with its own states, rules, and interfaces.', price: 1000 },
      { id: 'api-integration', name: 'Third-party API integration', description: 'A production integration with an external service, including error handling.', price: 750 },
      { id: 'analytics-dashboard', name: 'Analytics dashboard', description: 'Operational metrics and reporting views derived from your application data.', price: 650 },
    ],
  },
]

export function getServicePackage(slug: string | undefined) {
  return servicePackages.find((servicePackage) => servicePackage.slug === slug)
}

export function formatPackagePrice(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}
