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
    timeline: '1–2 days',
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
      { id: 'search-visibility', name: 'Search visibility setup', description: 'Help search engines understand your site with clear page titles, descriptions, a sitemap, and Google Search Console setup.', price: 250 },
      { id: 'local-business-seo', name: 'Local business SEO', description: 'Improve visibility for nearby customers with location-focused content, local business details, and a map.', price: 150 },
      { id: 'copy-refinement', name: 'Copy refinement', description: 'I polish and restructure your supplied copy so it reads clearly and confidently.', price: 200 },
      { id: 'appointment-requests', name: 'Appointment request form', description: 'A detailed request form that collects the information you need before following up.', price: 300 },
    ],
  },
  {
    id: 'connected-business-site',
    slug: 'connected-business-site',
    name: 'Connected Business Site',
    shortName: 'Connected site',
    price: 1500,
    timeline: '1–3 weeks',
    architecture: 'Connected — website + tailored database',
    featured: true,
    accent: 'violet',
    note: 'A customer-facing website with a tailored database and simple tools for handling bookings, requests, payments, or other customer activity.',
    idealFor: 'Service businesses ready to move beyond a brochure site with bookings, deposits, customer requests, or information that needs to be organized and updated.',
    features: ['Flexible pages for your business', 'Tailored business database', 'Automatic customer notifications', 'Simple dashboard to manage requests'],
    includes: [
      { title: 'Business website', description: 'A polished, mobile-friendly website with the same strong foundation as the brochure package.' },
      { title: 'Tailored business database', description: 'A secure, organized place for the customer information and records your business needs to manage.' },
      { title: 'Custom customer flow', description: 'A step-by-step experience for requests, applications, reservations, or customer intake.' },
      { title: 'Simple management dashboard', description: 'View, organize, and update incoming requests from one convenient place.' },
    ],
    addOns: [
      { id: 'search-visibility', name: 'Search visibility setup', description: 'Help search engines understand your site with optimized pages, a sitemap, and Google Search Console setup.', price: 300 },
      { id: 'booking-workflow', name: 'Online booking', description: 'Let customers choose available times and receive confirmations, with clear rules for rescheduling.', price: 500 },
      { id: 'stripe-payments', name: 'Online payments or deposits', description: 'Let customers pay securely online while you keep track of each payment.', price: 600 },
      { id: 'email-automation', name: 'Automatic customer emails', description: 'Branded emails for important moments such as confirmations, updates, and reminders.', price: 250 },
      { id: 'admin-dashboard', name: 'Advanced management dashboard', description: 'Filter requests, update statuses, add notes, and manage customer records in one place.', price: 700 },
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
    note: 'A secure web application for customer portals, team operations, marketplaces, dashboards, or other tools built around how your business works.',
    idealFor: 'Businesses replacing spreadsheets and scattered tools, creating a client portal, or launching a custom digital product.',
    features: ['Clear plan for your custom system', 'Secure customer and team accounts', 'Tools built around your daily process', 'Admin dashboard + complete launch'],
    includes: [
      { title: 'Clear system plan', description: 'We map who will use the system, what they need to do, and what the first release should include.' },
      { title: 'Secure accounts + access', description: 'Customers and team members can sign in and see only the tools and information meant for them.' },
      { title: 'Custom business process', description: 'One complete day-to-day process is designed, built, tested, and connected from start to finish.' },
      { title: 'Admin dashboard', description: 'Your team gets a central place to manage records, statuses, and important actions.' },
    ],
    addOns: [
      { id: 'search-ready-pages', name: 'Search-ready marketing pages', description: 'Public pages that clearly explain what you offer, encourage inquiries, and help search engines understand your business.', price: 350 },
      { id: 'additional-role', name: 'Additional account type', description: 'A separate sign-in experience and access level for another kind of customer, employee, or partner.', price: 500 },
      { id: 'additional-workflow', name: 'Additional business process', description: 'Build another connected process for a different task your customers or team need to complete.', price: 1000 },
      { id: 'api-integration', name: 'Connect another business service', description: 'Connect your system to another service your business uses, with safeguards when requests fail or run late.', price: 750 },
      { id: 'analytics-dashboard', name: 'Reporting dashboard', description: 'Clear charts and summaries that help you understand activity across your system.', price: 650 },
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
