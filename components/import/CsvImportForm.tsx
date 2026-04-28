"use client"

import { useState } from "react"

type ImportResult = { imported: number; errors: string[] }

export function CsvImportForm() {
  const [passphrase, setPassphrase] = useState("")
  const [unlocked, setUnlocked] = useState(false)
  const [preview, setPreview] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleUnlock(e: React.FormEvent) {
    e.preventDefault()
    if (passphrase.trim()) setUnlocked(true)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setResult(null)
    setError(null)
    const reader = new FileReader()
    reader.onload = (event) => {
      const csv = event.target?.result as string
      const lines = csv.trim().split("\n")
      const headers = lines[0].split(",").map((h) => h.trim())
      const rows = lines.slice(1).map((line) => {
        const values = line.split(",")
        const row: Record<string, unknown> = {}
        headers.forEach((header, i) => {
          const val = values[i]?.trim()
          if (header === "price" || header === "latitude" || header === "longitude") {
            row[header] = parseFloat(val) || 0
          } else {
            row[header] = val || null
          }
        })
        return row
      })
      setPreview(rows)
    }
    reader.readAsText(f)
  }

  async function handleImport() {
    if (preview.length === 0) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passphrase, restaurants: preview }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "Import failed"); return }
      setResult(data)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!unlocked) {
    return (
      <form onSubmit={handleUnlock} className="space-y-4">
        <div>
          <label htmlFor="passphrase" className="block text-sm font-medium text-gray-700 mb-1.5">Admin Passphrase</label>
          <input id="passphrase" type="password" value={passphrase} onChange={(e) => setPassphrase(e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" placeholder="Enter passphrase..." />
        </div>
        <button type="submit" className="w-full rounded-2xl bg-emerald-500 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-600">Unlock</button>
      </form>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">CSV File</label>
        <input type="file" accept=".csv" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100" />
        <p className="mt-1 text-xs text-gray-400">Format: name, cuisine_type, address, suburb, city, latitude, longitude, dish_name, price, photo_url</p>
      </div>
      {preview.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700">Preview: {preview.length} row{preview.length !== 1 ? "s" : ""}</p>
          <div className="mt-2 max-h-60 overflow-auto rounded-xl border border-gray-200">
            <table className="w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-500">Name</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500">Dish</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500">Price</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500">Suburb</th>
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 10).map((row, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="px-3 py-2 text-gray-700">{String(row.name || "")}</td>
                    <td className="px-3 py-2 text-gray-700">{String(row.dish_name || "")}</td>
                    <td className="px-3 py-2 text-gray-700">${String(row.price || "")}</td>
                    <td className="px-3 py-2 text-gray-700">{String(row.suburb || "")}</td>
                  </tr>
                ))}
                {preview.length > 10 && (
                  <tr className="border-t border-gray-100">
                    <td colSpan={4} className="px-3 py-2 text-center text-gray-400">...and {preview.length - 10} more rows</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {preview.length > 0 && (
        <button onClick={handleImport} disabled={loading} className="w-full rounded-2xl bg-emerald-500 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-600 disabled:opacity-50">
          {loading ? "Importing..." : `Import ${preview.length} Restaurants`}
        </button>
      )}
      {result && (
        <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm">
          <p className="font-medium text-emerald-700">✅ Imported {result.imported} restaurant{result.imported !== 1 ? "s" : ""}</p>
          {result.errors.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs text-red-600">{result.errors.map((err, i) => (<li key={i}>{err}</li>))}</ul>
          )}
        </div>
      )}
      {error && (<div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>)}
    </div>
  )
}
