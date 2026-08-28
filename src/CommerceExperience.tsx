import { motion, useReducedMotion } from 'framer-motion'
import {
  ArrowDown,
  Check,
  Plus,
  ShoppingBag,
  Sparkles,
} from 'lucide-react'
import { useLuxuryStore } from './LuxuryStoreState.ts'
import CountUp from './CountUpNumber.tsx'
import {
  formatDemoCurrency,
  LUXURY_DEMO_BALANCE,
  luxuryProducts,
  type LuxuryProduct,
} from './luxuryCatalog.ts'

const revealEase = [0.22, 1, 0.36, 1] as const

const systemCapabilities = [
  'Custom websites',
  'Booking & scheduling',
  'Payments & checkout',
  'Customer portals',
  'Dashboards & analytics',
  'Workflow automation',
]

type ProductCardProps = {
  product: LuxuryProduct
  index: number
  quantity: number
  animate: boolean
  onAdd: (productId: string) => void
}

function ProductCard({ product, index, quantity, animate, onAdd }: ProductCardProps) {
  const content = (
    <>
      <div className="product-card__media">
        <img src={product.image} alt={product.name} loading="lazy" />
        <span>{String(index + 1).padStart(2, '0')}</span>
        {quantity > 0 && <i>Selected</i>}
      </div>
      <div className="product-card__body">
        <p>{product.category}</p>
        <div className="product-card__title">
          <h3>{product.name}</h3>
          <strong>{formatDemoCurrency(product.price)}</strong>
        </div>
        <p className="product-card__description">{product.description}</p>
        <button
          type="button"
          onClick={() => onAdd(product.id)}
          disabled={quantity > 0}
        >
          {quantity > 0 ? <Check size={16} /> : <Plus size={16} />}
          {quantity > 0 ? 'Added to demo cart' : 'Add to demo cart'}
        </button>
      </div>
    </>
  )

  const className = `product-card${quantity > 0 ? ' is-selected' : ''}`

  if (!animate) {
    return <article className={className}>{content}</article>
  }

  return (
    <motion.article
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.62, delay: (index % 3) * 0.06, ease: revealEase }}
    >
      {content}
    </motion.article>
  )
}

function CommerceExperience() {
  const {
    walletUnlocked,
    cartLines,
    cartCount,
    unlockWallet,
    addToCart,
    setCartOpen,
  } = useLuxuryStore()
  const reduceMotion = useReducedMotion()

  const quantityFor = (productId: string) =>
    cartLines.find(({ product }) => product.id === productId)?.quantity ?? 0

  return (
    <>
      <section
        className="systems-section page-frame"
        id="what-i-build"
        data-ambient-scene="2"
      >
        <motion.div
          className="systems-section__lead"
          initial={reduceMotion ? false : { opacity: 0, y: 34 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: reduceMotion ? 0 : 0.72, ease: revealEase }}
        >
          <p className="section-kicker">WHAT I BUILD</p>
          <h2>Complete systems that keep the whole business moving.</h2>
          <p>
            The strongest products connect the customer experience to the work
            happening behind it—not another isolated screen or disconnected tool.
          </p>
        </motion.div>

        <motion.ul
          className="systems-services"
          aria-label="Services and systems I build"
          initial={reduceMotion ? false : { opacity: 0, x: 36 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: reduceMotion ? 0 : 0.78, delay: 0.08, ease: revealEase }}
        >
          {systemCapabilities.map((capability, index) => (
            <motion.li
              key={capability}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: reduceMotion ? 0 : 0.5, delay: index * 0.06 }}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{capability}</strong>
            </motion.li>
          ))}
        </motion.ul>
      </section>

      <motion.section
        className="wallet-gift-section page-frame"
        data-ambient-scene="3"
        onViewportEnter={unlockWallet}
        viewport={{ once: true, amount: 0.45 }}
      >
        <motion.div
          className="wallet-gift__copy"
          initial={reduceMotion ? false : { opacity: 0, y: 34 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: reduceMotion ? 0 : 0.76, ease: revealEase }}
        >
          <p className="section-kicker">THANKS FOR STOPPING BY</p>
          <h2>Some free gifts for you.</h2>
          <p>
            You made it this far, so I’m giving you $50,000,000 to spend at my
            store while I show you what a polished product experience can feel like.
          </p>
          <a className="wallet-gift__link" href="#shop">
            View available items <ArrowDown size={17} />
          </a>
        </motion.div>

        <motion.div
          className="wallet-card"
          initial={reduceMotion ? false : { opacity: 0, scale: 0.9, rotate: 4 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, scale: 1, rotate: 0 }}
          viewport={{ once: true, amount: 0.45 }}
          transition={{ duration: reduceMotion ? 0 : 0.9, delay: 0.08, ease: revealEase }}
        >
          <div className="wallet-card__top">
            <span><Sparkles size={16} /> AVAILABLE TO SPEND</span>
          </div>
          <strong aria-label={formatDemoCurrency(LUXURY_DEMO_BALANCE)}>
            {walletUnlocked ? (
              <CountUp
                start={0}
                end={LUXURY_DEMO_BALANCE}
                duration={reduceMotion ? 0 : 2.2}
                separator=","
                prefix="$"
              />
            ) : '$0'}
          </strong>
          <div className="wallet-card__bottom">
            <span>FOR DEMONSTRATION ONLY</span>
          </div>
        </motion.div>
      </motion.section>

      <motion.section
        className="luxury-shop-section"
        id="shop"
        data-ambient-scene="4"
        onViewportEnter={unlockWallet}
        viewport={{ once: true, amount: 0.05 }}
      >
        <div className="luxury-shop page-frame">
          <motion.header
            className="luxury-shop__header"
            initial={reduceMotion ? false : { opacity: 0, y: 30 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: reduceMotion ? 0 : 0.72, ease: revealEase }}
          >
            <div>
              <p className="section-kicker">RAFA’S SHOP</p>
              <h2>Choose any, on me.</h2>
            </div>
            <div className="luxury-shop__header-copy">
              <p>
                A curated collection with a real cart, inventory controls,
                responsive interactions, and a wallet that updates when you place an order.
              </p>
              <button type="button" onClick={() => setCartOpen(true)}>
                <ShoppingBag size={17} /> View cart{cartCount > 0 ? ` (${cartCount})` : ''}
              </button>
            </div>
          </motion.header>

          <div className="product-grid__mobile-hint" aria-hidden="true">Swipe to browse</div>

          <div
            className="product-grid product-grid--desktop"
            role="region"
            aria-label="Luxury product catalog"
            tabIndex={0}
          >
            {luxuryProducts.slice(0, 4).map((product, index) => (
              <ProductCard
                product={product}
                index={index}
                quantity={quantityFor(product.id)}
                animate={!reduceMotion}
                onAdd={addToCart}
                key={product.id}
              />
            ))}
          </div>

          <div className="mobile-product-rows" aria-label="Luxury product catalog">
            <div
              className="mobile-product-row"
              role="region"
              aria-label="Luxury products, row one"
              tabIndex={0}
            >
              {luxuryProducts.slice(0, 5).map((product, index) => (
                <ProductCard
                  product={product}
                  index={index}
                  quantity={quantityFor(product.id)}
                  animate={false}
                  onAdd={addToCart}
                  key={product.id}
                />
              ))}
            </div>
            <div
              className="mobile-product-row"
              role="region"
              aria-label="Luxury products, row two"
              tabIndex={0}
            >
              {luxuryProducts.slice(5).map((product, index) => (
                <ProductCard
                  product={product}
                  index={index + 5}
                  quantity={quantityFor(product.id)}
                  animate={false}
                  onAdd={addToCart}
                  key={product.id}
                />
              ))}
            </div>
          </div>

          <div className="luxury-shop__closing">
            <span><ShoppingBag size={18} /></span>
            <p>
              This is a fictional commerce experience built to demonstrate product
              presentation, cart logic, stateful UI, and responsive interaction design.
            </p>
          </div>
        </div>
      </motion.section>
    </>
  )
}

export default CommerceExperience
