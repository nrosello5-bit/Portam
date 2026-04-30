import { CartProvider } from '@/context/CartContext'
import ClientNav from '@/components/client/ClientNav'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="page-container bg-gray-50">
        {children}
        <ClientNav />
        <div className="h-20" />
      </div>
    </CartProvider>
  )
}
