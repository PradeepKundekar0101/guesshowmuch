export default function OfflinePage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-8 text-center">
      <span className="text-6xl">📡</span>
      <h1 className="mt-4 text-2xl font-bold text-gray-900">You're offline</h1>
      <p className="mt-2 text-gray-500">
        Check your internet connection and try again.
      </p>
    </div>
  )
}
