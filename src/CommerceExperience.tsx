import { motion, useReducedMotion } from 'framer-motion'
import {
  ArrowDown,
  ArrowRight,
  CalendarClock,
  Check,
  CreditCard,
  LayoutDashboard,
  Plus,
  ShoppingBag,
  Sparkles,
  Workflow,
} from 'lucide-react'
import { useLuxuryStore } from './LuxuryStoreState.ts'
import CountUp from './CountUpNumber.tsx'
import {
  formatDemoCurrency,
  LUXURY_DEMO_BALANCE,
  luxuryProducts,
} from './luxuryCatalog.ts'

const revealEase = [0.22, 1, 0.36, 1] as const

const systemNodes = [
  { label: 'Capture', detail: 'Qualified inquiry', icon: Workflow },
  { label: 'Schedule', detail: 'Real availability', icon: CalendarClock },
  { label: 'Transact', detail: 'Secure payment', icon: CreditCard },
  { label: 'Operate', detail: 'One clear dashboard', icon: LayoutDashboard },
]

function CommerceExperience() {
  const {
    balance,
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
      <section className="systems-section page-frame" data-ambient-scene="2">
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

        <motion.div
          className="systems-section__map"
          initial={reduceMotion ? false : { opacity: 0, x: 36 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: reduceMotion ? 0 : 0.78, delay: 0.08, ease: revealEase }}
        >
          <div className="systems-map__intro">
            <span>ONE CONNECTED FLOW</span>
            <p>
              Bookings can update schedules, trigger payments and confirmations,
              organize customer data, and give your team a live operational view.
            </p>
          </div>
          <div className="systems-map__rail" aria-label="Example connected business system">
            {systemNodes.map(({ label, detail, icon: Icon }, index) => (
              <motion.div
                className="systems-node"
                key={label}
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: reduceMotion ? 0 : 0.5, delay: index * 0.09 }}
              >
                <span className="systems-node__icon"><Icon size={18} /></span>
                <span className="systems-node__index">0{index + 1}</span>
                <div>
                  <strong>{label}</strong>
                  <small>{detail}</small>
                </div>
                {index < systemNodes.length - 1 && <i aria-hidden="true" />}
              </motion.div>
            ))}
          </div>
        </motion.div>
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
          <h2>I got you a little something.</h2>
          <p>
            You made it this far, so your fictional wallet has been funded with
            fifty million dollars. Let’s spend it while I show you what a polished
            product experience can feel like.
          </p>
          <a className="wallet-gift__link" href="#shop">
            Enter the demo shop <ArrowDown size={17} />
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
            <span><Sparkles size={16} /> DEMO WALLET</span>
            <span>RAFA / 50</span>
          </div>
          <p>Available balance</p>
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
            <span className="wallet-card__approved"><Check size={13} /> FUNDS READY</span>
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
              <p className="section-kicker">THE $50M DEMO SHOP</p>
              <h2>Go ahead. Add something ridiculous.</h2>
            </div>
            <div className="luxury-shop__header-copy">
              <p>
                Ten fictional products. A real cart, inventory controls, responsive
                interactions, and a wallet that updates when you place an order.
              </p>
              <button type="button" onClick={() => setCartOpen(true)}>
                <ShoppingBag size={17} /> View cart{cartCount > 0 ? ` (${cartCount})` : ''}
              </button>
            </div>
          </motion.header>

          <div className="luxury-shop__status" aria-label="Demo shop status">
            <span><i /> Fictional catalog</span>
            <span>Available: {formatDemoCurrency(balance)}</span>
            <span>No checkout or payment collection</span>
          </div>

          <div className="product-grid__mobile-hint" aria-hidden="true">
            <span>Swipe to browse</span>
            <span>2 rows · 5 columns <ArrowRight size={14} /></span>
          </div>

          <div
            className="product-grid"
            role="region"
            aria-label="Fictional luxury product catalog"
            tabIndex={0}
          >
            {luxuryProducts.map((product, index) => {
              const quantity = quantityFor(product.id)
              return (
                <motion.article
                  className="product-card"
                  key={product.id}
                  initial={reduceMotion ? false : { opacity: 0, y: 28 }}
                  whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.12 }}
                  transition={{ duration: reduceMotion ? 0 : 0.62, delay: (index % 3) * 0.06, ease: revealEase }}
                >
                  <div className="product-card__media">
                    <img src={product.image} alt={product.name} loading="lazy" />
                    <span>{String(index + 1).padStart(2, '0')} / 10</span>
                    {quantity > 0 && <i>{quantity} in cart</i>}
                  </div>
                  <div className="product-card__body">
                    <p>{product.category}</p>
                    <div className="product-card__title">
                      <h3>{product.name}</h3>
                      <strong>{formatDemoCurrency(product.price)}</strong>
                    </div>
                    <p className="product-card__description">{product.description}</p>
                    <button type="button" onClick={() => addToCart(product.id)}>
                      <Plus size={16} /> {quantity > 0 ? 'Add another' : 'Add to demo cart'}
                    </button>
                  </div>
                </motion.article>
              )
            })}
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
