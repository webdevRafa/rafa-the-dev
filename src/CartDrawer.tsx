import { useEffect, useRef } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Check, Minus, Plus, RotateCcw, ShieldCheck, ShoppingBag, Trash2, X } from 'lucide-react'
import { useLuxuryStore } from './LuxuryStoreState.ts'
import { formatDemoCurrency } from './luxuryCatalog.ts'

const drawerEase = [0.22, 1, 0.36, 1] as const

function CartDrawer() {
  const {
    balance,
    cartOpen,
    cartLines,
    cartCount,
    cartTotal,
    order,
    setCartOpen,
    setQuantity,
    removeFromCart,
    placeOrder,
    resetDemo,
    dismissOrder,
  } = useLuxuryStore()
  const reduceMotion = useReducedMotion()
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const canOrder = cartCount > 0 && cartTotal <= balance
  const remainingBalance = balance - cartTotal

  useEffect(() => {
    if (!cartOpen) return
    document.documentElement.classList.add('cart-drawer-open')
    document.body.classList.add('cart-drawer-open')
    closeButtonRef.current?.focus()

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setCartOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.documentElement.classList.remove('cart-drawer-open')
      document.body.classList.remove('cart-drawer-open')
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [cartOpen, setCartOpen])

  return (
    <>
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.button
              className="cart-backdrop"
              type="button"
              aria-label="Close demo cart"
              onClick={() => setCartOpen(false)}
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
            />
            <motion.aside
              className="cart-drawer"
              role="dialog"
              aria-modal="true"
              aria-labelledby="cart-title"
              initial={reduceMotion ? false : { x: '100%' }}
              animate={{ x: 0 }}
              exit={reduceMotion ? undefined : { x: '100%' }}
              transition={{ duration: reduceMotion ? 0 : 0.48, ease: drawerEase }}
            >
              <header className="cart-drawer__header">
                <div>
                  <p>THE $50M DEMO SHOP</p>
                  <h2 id="cart-title">Your cart <span>{cartCount}</span></h2>
                </div>
                <button
                  ref={closeButtonRef}
                  type="button"
                  aria-label="Close cart"
                  onClick={() => setCartOpen(false)}
                >
                  <X size={21} />
                </button>
              </header>

              <div className="cart-drawer__balance">
                <span>Available demo balance</span>
                <strong>{formatDemoCurrency(balance)}</strong>
              </div>

              <div className="cart-drawer__body">
                {cartLines.length === 0 ? (
                  <div className="cart-empty">
                    <span><ShoppingBag size={24} /></span>
                    <h3>Your fantasy cart is empty.</h3>
                    <p>Choose something appropriately unnecessary from the collection.</p>
                    <button type="button" onClick={() => setCartOpen(false)}>Continue browsing</button>
                  </div>
                ) : (
                  <div className="cart-lines">
                    {cartLines.map(({ product, quantity }) => (
                      <article className="cart-line" key={product.id}>
                        <img src={product.image} alt="" />
                        <div className="cart-line__copy">
                          <p>{product.category}</p>
                          <h3>{product.name}</h3>
                          <strong>{formatDemoCurrency(product.price * quantity)}</strong>
                          <div className="cart-line__actions">
                            <div className="quantity-control" aria-label={`Quantity for ${product.name}`}>
                              <button
                                type="button"
                                aria-label={`Decrease ${product.name} quantity`}
                                onClick={() => setQuantity(product.id, quantity - 1)}
                              >
                                <Minus size={14} />
                              </button>
                              <span aria-live="polite">{quantity}</span>
                              <button
                                type="button"
                                aria-label={`Increase ${product.name} quantity`}
                                onClick={() => setQuantity(product.id, quantity + 1)}
                                disabled={quantity >= 9}
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <button
                              className="cart-line__remove"
                              type="button"
                              aria-label={`Remove ${product.name} from cart`}
                              onClick={() => removeFromCart(product.id)}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>

              <footer className="cart-drawer__footer">
                <div className="cart-summary-row">
                  <span>Demo order total</span>
                  <strong>{formatDemoCurrency(cartTotal)}</strong>
                </div>
                <div className={`cart-summary-row cart-summary-row--remaining${remainingBalance < 0 ? ' is-over' : ''}`}>
                  <span>Wallet after order</span>
                  <strong>{formatDemoCurrency(remainingBalance)}</strong>
                </div>
                {remainingBalance < 0 && (
                  <p className="cart-warning">Even imaginary money has limits. Remove an item to continue.</p>
                )}
                <button
                  className="cart-order-button"
                  type="button"
                  disabled={!canOrder}
                  onClick={placeOrder}
                >
                  <span>Place demo order</span>
                  <span>{formatDemoCurrency(cartTotal)}</span>
                </button>
                <p className="cart-safe-note"><ShieldCheck size={14} /> Fictional storefront. No payment or personal information is collected.</p>
                <button className="cart-reset" type="button" onClick={resetDemo}>
                  <RotateCcw size={13} /> Reset the $50M demo
                </button>
              </footer>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {order && (
          <motion.div
            className="demo-order-toast"
            role="status"
            initial={reduceMotion ? false : { opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 16 }}
          >
            <span className="demo-order-toast__icon"><Check size={19} /></span>
            <div>
              <strong>Demo order placed</strong>
              <p>{order.itemCount} {order.itemCount === 1 ? 'item' : 'items'} · {formatDemoCurrency(order.total)} · {order.reference}</p>
            </div>
            <button type="button" aria-label="Dismiss order confirmation" onClick={dismissOrder}><X size={17} /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default CartDrawer
