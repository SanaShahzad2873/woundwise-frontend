import { useRef, useState } from 'react'
import { UploadCloud, RefreshCw, Trash2, FileImage } from 'lucide-react'

const MAX_MB = 10
const ALLOWED_TYPES = ['image/jpeg', 'image/png']

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export default function FileDropzone({
  file,
  previewUrl,
  onFile,
  onRemove,
  error,
  onError,
  disabled,
}) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  function handleFiles(fileList) {
    const chosen = fileList && fileList[0]
    if (!chosen) return
    if (!ALLOWED_TYPES.includes(chosen.type)) {
      onError('Please choose a JPG, JPEG or PNG image.')
      return
    }
    if (chosen.size > MAX_MB * 1024 * 1024) {
      onError(`This file is ${formatSize(chosen.size)}. The maximum size is ${MAX_MB} MB.`)
      return
    }
    onError('')
    onFile(chosen)
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files)
          e.target.value = '' // lets you pick the same file again later
        }}
      />

      {previewUrl ? (
        <div className="rounded-xl border border-ww-line p-3">
          <img
            src={previewUrl}
            alt="Selected wound preview"
            className="max-h-80 w-full rounded-lg bg-ww-bg object-contain"
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="flex min-w-0 items-center gap-2 text-sm text-ww-muted">
              <FileImage className="h-4 w-4 shrink-0 text-ww-teal" />
              <span className="truncate">{file.name}</span>
              <span className="shrink-0">({formatSize(file.size)})</span>
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={disabled}
                onClick={() => inputRef.current.click()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-ww-line px-3 py-1.5 text-sm font-medium text-ww-navy hover:bg-ww-bg disabled:opacity-50"
              >
                <RefreshCw className="h-4 w-4" />
                Replace
              </button>
              <button
                type="button"
                disabled={disabled}
                onClick={onRemove}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') inputRef.current.click()
          }}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            handleFiles(e.dataTransfer.files)
          }}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
            dragging
              ? 'border-ww-teal bg-ww-mint-soft'
              : 'border-ww-line bg-white hover:border-ww-teal/60 hover:bg-ww-bg/50'
          }`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ww-mint-soft">
            <UploadCloud className="h-6 w-6 text-ww-teal" />
          </div>
          <p className="text-sm font-medium text-ww-navy">
            Drag and drop a wound image here, or click to browse
          </p>
          <p className="text-xs text-ww-muted">JPG, JPEG or PNG · up to {MAX_MB} MB</p>
        </div>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}