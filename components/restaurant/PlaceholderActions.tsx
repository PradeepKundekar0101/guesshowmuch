export function PlaceholderActions() {
  return (
    <>
      {/* Vote section placeholder */}
      <div className="border-t border-gray-100 pt-6 opacity-40">
        <h3 className="mb-2.5 text-sm font-semibold text-gray-900">
          Is this price still accurate?
        </h3>
        <div className="flex gap-3">
          <div className="flex flex-1 flex-col items-center rounded-xl bg-gray-100 py-3">
            <span className="text-2xl">👍</span>
            <span className="mt-1 text-xs text-gray-500">Still accurate</span>
          </div>
          <div className="flex flex-1 flex-col items-center rounded-xl bg-gray-100 py-3">
            <span className="text-2xl">👎</span>
            <span className="mt-1 text-xs text-gray-500">Price changed</span>
          </div>
        </div>
        <p className="mt-2 text-center text-[11px] text-gray-400">Coming soon</p>
      </div>

      {/* Comments placeholder */}
      <div className="border-t border-gray-100 pt-6 opacity-40">
        <h3 className="mb-2.5 text-sm font-semibold text-gray-900">Comments</h3>
        <div className="rounded-xl bg-gray-50 py-5 text-center text-sm text-gray-400">
          💬 Comments coming soon
        </div>
      </div>

      {/* Flag button placeholder */}
      <div className="border-t border-gray-100 pt-6 text-center opacity-40">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-400">
          🚩 Report outdated info
        </span>
        <p className="mt-1.5 text-[11px] text-gray-400">Coming soon</p>
      </div>
    </>
  )
}
