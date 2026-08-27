import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  LUXURY_DEMO_BALANCE,
  luxuryProducts,
} from './luxuryCatalog.ts'
import { LuxuryStoreContext, type DemoOrder, type LuxuryStoreValue } from './LuxuryStoreState.ts'

export function LuxuryStoreProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(LUXURY_DEMO_BALANCE)
  const [walletUnlocked, setWalletUnlocked] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [cart, setCart] = useState<Record<string, number>>({})
  const [order, setOrder] = useState<DemoOrder | null>(null)

  const cartLines = useMemo(
    () => luxuryProducts
      .map((product) => ({ product, quantity: cart[product.id] ?? 0 }))
      .filter((line) => line.quantity > 0),
    [cart],
  )

  const cartCount = cartLines.reduce((total, line) => total + line.quantity, 0)
  const cartTotal = cartLines.reduce(
    (total, line) => total + line.product.price * line.quantity,
    0,
  )

  const addToCart = (productId: string) => {
    setWalletUnlocked(true)
    setCart((current) => ({
      ...current,
      [productId]: Math.min((current[productId] ?? 0) + 1, 9),
    }))
  }

  const setQuantity = (productId: string, quantity: number) => {
    setCart((current) => {
      if (quantity <= 0) {
        const next = { ...current }
        delete next[productId]
        return next
      }
      return { ...current, [productId]: Math.min(quantity, 9) }
    })
  }

  const removeFromCart = (productId: string) => setQuantity(productId, 0)

  const placeOrder = () => {
    if (cartCount === 0 || cartTotal > balance) return
    setBalance((current) => current - cartTotal)
    setCart({})
    setCartOpen(false)
    setOrder({
      reference: `DEMO-${Date.now().toString(36).slice(-6).toUpperCase()}`,
      total: cartTotal,
      itemCount: cartCount,
    })
  }

  const resetDemo = () => {
    setBalance(LUXURY_DEMO_BALANCE)
    setWalletUnlocked(true)
    setCart({})
    setOrder(null)
  }

  const value: LuxuryStoreValue = {
    balance,
    walletUnlocked,
    cartOpen,
    cartLines,
    cartCount,
    cartTotal,
    order,
    unlockWallet: () => setWalletUnlocked(true),
    setCartOpen,
    addToCart,
    setQuantity,
    removeFromCart,
    placeOrder,
    resetDemo,
    dismissOrder: () => setOrder(null),
  }

  return (
    <LuxuryStoreContext.Provider value={value}>
      {children}
    </LuxuryStoreContext.Provider>
  )
}
