export type UserRole = 'client' | 'rider' | 'merchant'

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'picked_up'
  | 'delivered'
  | 'cancelled'

export type PaymentMethod = 'card' | 'cash'

export type MerchantCategory =
  | 'restaurants'
  | 'farmacies'
  | 'supermercats'
  | 'flors'
  | 'altres'

export interface User {
  id: string
  name: string
  phone: string | null
  email: string
  role: UserRole
  address: string | null
  created_at: string
}

export interface Merchant {
  id: string
  user_id: string
  name: string
  category: MerchantCategory
  description: string | null
  address: string
  lat: number
  lng: number
  is_open: boolean
  delivery_fee: number
  min_order: number
  logo_url: string | null
  created_at: string
  distance?: number
}

export interface Product {
  id: string
  merchant_id: string
  name: string
  description: string | null
  price: number
  category: string
  image_url: string | null
  available: boolean
  created_at: string
}

export interface Order {
  id: string
  client_id: string
  merchant_id: string
  rider_id: string | null
  status: OrderStatus
  total: number
  delivery_fee: number
  address: string
  lat: number | null
  lng: number | null
  notes: string | null
  payment_method: PaymentMethod
  stripe_payment_intent_id: string | null
  created_at: string
  updated_at: string
  merchant?: Merchant
  client?: User
  rider?: User
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  created_at: string
  product?: Product
}

export interface RiderLocation {
  rider_id: string
  lat: number
  lng: number
  updated_at: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface CartState {
  items: CartItem[]
  merchantId: string | null
  merchantName: string | null
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, { ca: string; es: string; color: string }> = {
  pending: { ca: 'Pendent', es: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  accepted: { ca: 'Acceptada', es: 'Aceptada', color: 'bg-blue-100 text-blue-800' },
  preparing: { ca: 'Preparant', es: 'Preparando', color: 'bg-orange-100 text-orange-800' },
  picked_up: { ca: 'Recollida', es: 'Recogida', color: 'bg-purple-100 text-purple-800' },
  delivered: { ca: 'Lliurada', es: 'Entregada', color: 'bg-green-100 text-green-800' },
  cancelled: { ca: 'Cancel·lada', es: 'Cancelada', color: 'bg-red-100 text-red-800' },
}

export const MERCHANT_CATEGORY_LABELS: Record<MerchantCategory, { ca: string; es: string; emoji: string }> = {
  restaurants: { ca: 'Restaurants', es: 'Restaurantes', emoji: '🍕' },
  farmacies: { ca: 'Farmàcies', es: 'Farmacias', emoji: '💊' },
  supermercats: { ca: 'Supermercats', es: 'Supermercados', emoji: '🛒' },
  flors: { ca: 'Flors', es: 'Flores', emoji: '💐' },
  altres: { ca: 'Altres', es: 'Otros', emoji: '📦' },
}
