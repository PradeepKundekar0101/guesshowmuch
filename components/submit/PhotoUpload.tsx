"use client"

import { useState, useRef } from "react"
import { Camera, X, Loader2 } from "lucide-react"
import { compressImage } from "@/lib/utils/image"

type PhotoUploadProps = {
  onUpload: (url: string) => void
}

export function PhotoUpload({ onUpload }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (JPEG or PNG)")
      return
    }
    setError(null)
    setUploading(true)
    try {
      const compressed = await compressImage(file)
      const previewUrl = URL.createObjectURL(compressed)
      setPreview(previewUrl)
      const formData = new FormData()
      formData.append("file", compressed, "photo.jpg")
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!)
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      )
      if (!res.ok) throw new Error("Upload failed")
      const data = await res.json()
      onUpload(data.secure_url)
    } catch {
      setError("Failed to upload photo. Please try again.")
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-soft">
        Photo <span className="font-normal text-ink-muted">(optional)</span>
      </label>
      {preview ? (
        <div className="relative overflow-hidden rounded-xl ring-1 ring-rule">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Preview" className="h-36 w-full object-cover" />
          <button
            type="button"
            onClick={() => {
              setPreview(null)
              onUpload("")
              if (inputRef.current) inputRef.current.value = ""
            }}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-brand/85 text-white backdrop-blur transition-colors hover:bg-brand-hover"
            aria-label="Remove photo"
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="group flex h-36 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-rule bg-paper-dim/40 text-ink-muted transition-all hover:border-ink hover:bg-paper-dim hover:text-ink disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 size={20} className="animate-spin" strokeWidth={1.75} />
              <span className="text-[12px] font-medium">Uploading…</span>
            </>
          ) : (
            <>
              <Camera size={22} strokeWidth={1.5} />
              <span className="text-[12px] font-medium">Tap to add a photo</span>
            </>
          )}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleFile}
        className="hidden"
      />
      {error && <p className="mt-1.5 text-[11px] text-cinnabar-600">{error}</p>}
    </div>
  )
}
