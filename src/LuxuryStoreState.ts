import { createContext, useContext } from 'react'
import type { LuxuryProduct } from './luxuryCatalog.ts'

export type CartLine = {
  product: LuxuryProduct
  quantity: number
}

export type DemoOrder = {
  reference: string
  total: number
  itemCount: number
}

export type LuxuryStoreValue = {
  balance: number
  walletUnlocked: boolean
  cartOpen: boolean
  cartLines: CartLine[]
  cartCount: number
  cartTotal: number
  order: DemoOrder | null
  celebrationReference: string | null
  unlockWallet: () => void
  setCartOpen: (open: boolean) => void
  addToCart: (productId: string) => void
  setQuantity: (productId: string, quantity: number) => void
  removeFromCart: (productId: string) => void
  placeOrder: () => void
  resetDemo: () => void
  dismissOrder: () => void
}

export const LuxuryStoreContext = createContext<LuxuryStoreValue | null>(null)

export function useLuxuryStore() {
  const value = useContext(LuxuryStoreContext)
  if (!value) throw new Error('useLuxuryStore must be used inside LuxuryStoreProvider')
  return value
}
