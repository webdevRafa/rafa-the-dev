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
    architecture: 'Simple — website + form submissions',
    accent: 'cyan',
    note: 'A clean, credible website for a business that needs to explain its services and make it easy to get in touch.',
    idealFor: 'Local businesses, independent professionals, new ventures, and established companies replacing an outdated site.',
    features: ['Up to five custom pages', 'Mobile-friendly custom design', 'Contact or inquiry form', 'Automatic confirmation emails'],
    includes: [
      { title: 'Up to five pages', description: 'A practical page set such as Home, About, Services, Gallery, and Contact.' },
      { title: 'Mobile-friendly custom design', description: 'A polished experience built to work beautifully on phones, tablets, and desktop screens.' },
      { title: 'Inquiry forms + email follow-up', description: 'A secure form that organizes each inquiry and automatically confirms it with your potential customer.' },
      { title: 'Ready to go live', description: 'Fast loading, accessibility, search-friendly basics, domain connection, and a complete website launch.' },
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
    architecture: 'Connected — website + tailored database',
    featured: true,
    accent: 'violet',
    note: 'A customer-facing website connected to one useful workflow your business needs to collect, manage, or act on.',
    idealFor: 'Service businesses ready to move beyond a brochure site into bookings, deposits, structured requests, or managed records.',
    features: ['Flexible pages for your business', 'Tailored business database', 'Automatic customer notifications', 'Simple dashboard to manage requests'],
    includes: [
      { title: 'Business website', description: 'The responsive marketing experience and launch foundation from the brochure package.' },
      { title: 'Tailored business database', description: 'A secure, organized place for the customer information and records your business needs to manage.' },
      { title: 'Custom customer flow', description: 'A step-by-step experience for requests, applications, reservations, or customer intake.' },
      { title: 'Simple management dashboard', description: 'View, organize, and update incoming requests from one convenient place.' },
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
    architecture: 'Advanced — secure accounts + connected tools',
    accent: 'coral',
    note: 'A complete web application for portals, operations, marketplaces, dashboards, or interconnected business processes.',
    idealFor: 'Businesses replacing spreadsheets and scattered tools, creating a client portal, or launching a custom digital product.',
    features: ['Clear plan for your custom system', 'Secure customer and team accounts', 'Tools built around your daily process', 'Admin dashboard + complete launch'],
    includes: [
      { title: 'Clear system plan', description: 'We map who will use the system, what they need to do, and what the first release should include.' },
      { title: 'Secure accounts + access', description: 'Customers and team members can sign in and see only the tools and information meant for them.' },
      { title: 'Custom business process', description: 'One complete day-to-day process is designed, built, tested, and connected from start to finish.' },
      { title: 'Admin dashboard', description: 'Your team gets a central place to manage records, statuses, and important actions.' },
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
