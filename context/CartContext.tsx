'use client'

import { createContext, useContext, useReducer, useEffect } from 'react'
import type { CartItem, CartState, Product } from '@/types'

type CartAction =
  | { type: 'ADD_ITEM'; product: Product; merchantId: string; merchantName: string }
  | { type: 'REMOVE_ITEM'; productId: string }
  | { type: 'UPDATE_QUANTITY'; productId: string; quantity: number }
  | { type: 'CLEAR_CART' }

const initialState: CartState = {
  items: [],
  merchantId: null,
  merchantName: null,
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      if (state.merchantId && state.merchantId !== action.merchantId) {
        return state
      }
      const existing = state.items.find((i) => i.product.id === action.product.id)
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.product.id === action.product.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        }
      }
      return {
        ...state,
        merchantId: action.merchantId,
        merchantName: action.merchantName,
        items: [...state.items, { product: action.product, quantity: 1 }],
      }
    }
    case 'REMOVE_ITEM': {
      const items = state.items.filter((i) => i.product.id !== action.productId)
      return {
        ...state,
        items,
        merchantId: items.length === 0 ? null : state.merchantId,
        merchantName: items.length === 0 ? null : state.merchantName,
      }
    }
    case 'UPDATE_QUANTITY': {
      if (action.quantity <= 0) {
        const items = state.items.filter((i) => i.product.id !== action.productId)
        return {
          ...state,
          items,
          merchantId: items.length === 0 ? null : state.merchantId,
          merchantName: items.length === 0 ? null : state.merchantName,
        }
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.product.id === action.productId ? { ...i, quantity: action.quantity } : i
        ),
      }
    }
    case 'CLEAR_CART':
      return initialState
    default:
      return state
  }
}

interface CartContextValue {
  cart: CartState
  addItem: (product: Product, merchantId: string, merchantName: string) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  itemCount: number
  subtotal: number
  getItemQuantity: (productId: string) => number
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, dispatch] = useReducer(cartReducer, initialState, () => {
    if (typeof window === 'undefined') return initialState
    try {
      const saved = localStorage.getItem('portam_cart')
      return saved ? JSON.parse(saved) : initialState
    } catch {
      return initialState
    }
  })

  useEffect(() => {
    localStorage.setItem('portam_cart', JSON.stringify(cart))
  }, [cart])

  const addItem = (product: Product, merchantId: string, merchantName: string) =>
    dispatch({ type: 'ADD_ITEM', product, merchantId, merchantName })

  const removeItem = (productId: string) =>
    dispatch({ type: 'REMOVE_ITEM', productId })

  const updateQuantity = (productId: string, quantity: number) =>
    dispatch({ type: 'UPDATE_QUANTITY', productId, quantity })

  const clearCart = () => dispatch({ type: 'CLEAR_CART' })

  const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = cart.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  const getItemQuantity = (productId: string) =>
    cart.items.find((i) => i.product.id === productId)?.quantity ?? 0

  return (
    <CartContext.Provider
      value={{ cart, addItem, removeItem, updateQuantity, clearCart, itemCount, subtotal, getItemQuantity }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
