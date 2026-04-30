import RiderNav from '@/components/rider/RiderNav'

export default function RiderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-container bg-gray-50 min-h-screen">
      {children}
      <RiderNav />
      <div className="h-20" />
    </div>
  )
}
