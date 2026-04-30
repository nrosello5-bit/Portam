import MerchantNav from '@/components/merchant/MerchantNav'

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-container bg-gray-50 min-h-screen">
      {children}
      <MerchantNav />
      <div className="h-20" />
    </div>
  )
}
