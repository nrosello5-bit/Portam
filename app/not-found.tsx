import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
      <div className="text-6xl mb-4">🗺️</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Pàgina no trobada</h1>
      <p className="text-gray-500 mb-6">La pàgina que cerques no existeix.</p>
      <Link href="/" className="btn-primary">Tornar a l&apos;inici</Link>
    </div>
  )
}
