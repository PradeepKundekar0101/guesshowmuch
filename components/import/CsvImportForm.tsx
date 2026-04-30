"use client"

import { useState } from "react"
import { CheckCircle2, AlertCircle } from "lucide-react"

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
      if (!res.ok) {
        setError(data.error || "Import failed")
        return
      }
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
          <label
            htmlFor="passphrase"
            className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-soft"
          >
            Admin passphrase
          </label>
          <input
            id="passphrase"
            type="password"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            className="w-full rounded-xl border border-rule bg-surface px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-ink"
            placeholder="Enter passphrase…"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-full bg-brand py-3 text-[13px] font-semibold uppercase tracking-[0.06em] text-white transition-all hover:bg-brand-hover active:scale-[0.99]"
        >
          Unlock
        </button>
      </form>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-soft">
          CSV file
        </label>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="w-full text-sm text-ink-soft file:mr-4 file:rounded-full file:border-0 file:bg-brand file:px-4 file:py-2 file:text-[12px] file:font-semibold file:uppercase file:tracking-[0.06em] file:text-white hover:file:bg-brand-hover"
        />
        <p className="mt-1.5 text-[11px] leading-relaxed text-ink-muted">
          Format: name, cuisine_type, address, suburb, city, latitude,
          longitude, dish_name, price, photo_url
        </p>
      </div>

      {preview.length > 0 && (
        <div>
          <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-soft">
            Preview · {preview.length} row{preview.length !== 1 ? "s" : ""}
          </p>
          <div className="max-h-60 overflow-auto rounded-xl border border-rule bg-surface">
            <table className="w-full text-xs">
              <thead className="bg-paper-dim text-ink-muted">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold uppercase tracking-[0.06em]">Name</th>
                  <th className="px-3 py-2 text-left font-semibold uppercase tracking-[0.06em]">Dish</th>
                  <th className="px-3 py-2 text-left font-semibold uppercase tracking-[0.06em]">Price</th>
                  <th className="px-3 py-2 text-left font-semibold uppercase tracking-[0.06em]">Suburb</th>
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 10).map((row, i) => (
                  <tr key={i} className="border-t border-rule text-ink">
                    <td className="px-3 py-2">{String(row.name || "")}</td>
                    <td className="px-3 py-2">{String(row.dish_name || "")}</td>
                    <td className="price-num px-3 py-2">${String(row.price || "")}</td>
                    <td className="px-3 py-2">{String(row.suburb || "")}</td>
                  </tr>
                ))}
                {preview.length > 10 && (
                  <tr className="border-t border-rule">
                    <td colSpan={4} className="px-3 py-2 text-center text-ink-muted">
                      …and {preview.length - 10} more
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {preview.length > 0 && (
        <button
          onClick={handleImport}
          disabled={loading}
          className="w-full rounded-full bg-brand py-3 text-[13px] font-semibold uppercase tracking-[0.06em] text-white transition-all hover:bg-brand-hover disabled:opacity-50"
        >
          {loading ? "Importing…" : `Import ${preview.length} restaurants`}
        </button>
      )}

      {result && (
        <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm">
          <CheckCircle2
            size={16}
            strokeWidth={2}
            className="mt-0.5 shrink-0 text-emerald-600"
          />
          <div>
            <p className="font-semibold text-emerald-700">
              Imported {result.imported} restaurant{result.imported !== 1 ? "s" : ""}
            </p>
            {result.errors.length > 0 && (
              <ul className="mt-1.5 space-y-0.5 text-[11px] text-cinnabar-600">
                {result.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-cinnabar-200 bg-cinnabar-50 px-4 py-3 text-sm text-cinnabar-700">
          <AlertCircle size={16} strokeWidth={2} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
