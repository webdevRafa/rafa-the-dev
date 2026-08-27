export type LuxuryProduct = {
  id: string
  name: string
  category: string
  price: number
  image: string
  description: string
}

export const LUXURY_DEMO_BALANCE = 50_000_000

export const luxuryProducts: LuxuryProduct[] = [
  {
    id: 'cliffside-estate',
    name: 'The Horizon Estate',
    category: 'Coastal real estate',
    price: 5_000_000,
    image: '/luxury-demo/cliffside-estate.webp',
    description: 'A glass-wrapped cliffside retreat with an infinity edge and the Pacific at its feet.',
  },
  {
    id: 'italian-supercar',
    name: 'V12 Midnight',
    category: 'Italian supercar',
    price: 750_000,
    image: '/luxury-demo/italian-supercar.webp',
    description: 'A hand-finished twelve-cylinder grand tourer built for dramatic arrivals.',
  },
  {
    id: 'tourbillon-watch',
    name: 'Nocturne Tourbillon',
    category: 'Swiss timepiece',
    price: 420_000,
    image: '/luxury-demo/tourbillon-watch.webp',
    description: 'An open-worked platinum movement assembled for the person who notices every detail.',
  },
  {
    id: 'diamond-ring',
    name: 'Celestial Pear',
    category: 'High jewelry',
    price: 1_200_000,
    image: '/luxury-demo/diamond-ring.webp',
    description: 'A museum-grade pear-cut diamond set alone so the light can do all the talking.',
  },
  {
    id: 'private-island',
    name: 'Solstice Island',
    category: 'Private retreat',
    price: 12_500_000,
    image: '/luxury-demo/private-island.webp',
    description: 'Your own crescent of sand, contemporary villa, and a horizon with no calendar.',
  },
  {
    id: 'explorer-yacht',
    name: 'The Forty-Five',
    category: 'Explorer yacht',
    price: 18_000_000,
    image: '/luxury-demo/explorer-yacht.webp',
    description: 'Forty-five meters of quiet range, warm architecture, and anywhere-you-like mobility.',
  },
  {
    id: 'grand-piano',
    name: 'Midnight Concert Grand',
    category: 'Bespoke instrument',
    price: 325_000,
    image: '/luxury-demo/grand-piano.webp',
    description: 'A concert-scale instrument voiced by hand and finished in mirror-black lacquer.',
  },
  {
    id: 'wine-vault',
    name: 'The Collector’s Vault',
    category: 'Private cellar',
    price: 680_000,
    image: '/luxury-demo/wine-vault.webp',
    description: 'A climate-controlled tasting room designed around your once-in-a-lifetime bottles.',
  },
  {
    id: 'private-jet',
    name: 'The Global Seven',
    category: 'Long-range aircraft',
    price: 9_500_000,
    image: '/luxury-demo/private-jet.webp',
    description: 'Intercontinental range, a tailored cabin, and no middle seat anywhere in sight.',
  },
  {
    id: 'meteorite-sculpture',
    name: 'Fragments of Elsewhere',
    category: 'Collectible sculpture',
    price: 900_000,
    image: '/luxury-demo/meteorite-sculpture.webp',
    description: 'A sculptural iron meteorite—billions of years old, and exceptionally good on a pedestal.',
  },
]

export const formatDemoCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
