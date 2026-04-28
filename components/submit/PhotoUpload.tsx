"use client"

import { useState, useRef } from "react"
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
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        Photo <span className="text-gray-400 font-normal">(optional)</span>
      </label>
      {preview ? (
        <div className="relative">
          <img src={preview} alt="Preview" className="h-32 w-full rounded-xl object-cover" />
          <button
            onClick={() => { setPreview(null); onUpload(""); if (inputRef.current) inputRef.current.value = "" }}
            className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-xs text-white"
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-32 w-full items-center justify-center rounded-xl border-2 border-dashed border-gray-200 text-gray-400 transition-colors hover:border-emerald-300 hover:text-emerald-500"
        >
          {uploading ? "Uploading..." : "📷 Tap to add photo"}
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/jpeg,image/png" onChange={handleFile} className="hidden" />
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  )
}
