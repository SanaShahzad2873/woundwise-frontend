import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  UploadCloud,
  StickyNote,
  Send,
  Image as ImageIcon,
  Info,
  TrendingDown,
  FileText,
} from 'lucide-react'
import { api } from '../services/api'
import useAsync from '../hooks/useAsync'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import QualityBadge from '../components/ui/QualityBadge'
import LoadingState from '../components/ui/LoadingState'
import ErrorState from '../components/ui/ErrorState'
import EmptyState from '../components/ui/EmptyState'
import { inputClass } from '../utils/styles'
import { formatDate, formatNumber } from '../utils/format'

export default function WoundDetail() {
  const { woundId } = useParams()
  const { data, loading, error, reload } = useAsync(
    () => api.getWound(woundId),
    [woundId],
  )

  const [selectedId, setSelectedId] = useState(null)
  const [view, setView] = useState('overlay') // 'overlay' or 'original'
  const [noteText, setNoteText] = useState('')
  const [noteError, setNoteError] = useState('')
  const [saving, setSaving] = useState(false)

  const images = data ? data.images : []
  // If nothing was clicked yet, show the newest image.
  const selected =
    images.find((img) => img.id === selectedId) || images[images.length - 1]
  const analysis = selected ? selected.analysis : null

  async function handleAddNote(e) {
    e.preventDefault()
    if (!noteText.trim()) {
      setNoteError('Please write a note first.')
      return
    }
    setSaving(true)
    setNoteError('')
    try {
      await api.addNote(woundId, { note: noteText.trim() })
      setNoteText('')
      reload()
    } catch (err) {
      setNoteError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      {data && (
        <Link
          to={`/patients/${data.patient.id}`}
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-ww-teal hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          {data.patient.name}
        </Link>
      )}

      {loading && !data && <LoadingState label="Loading wound..." />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {data && (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <PageHeader
              title={data.wound_location}
              subtitle={`${data.wound_category} · ${data.patient.name} · started ${formatDate(data.created_at)}`}
            />
              <Link
                to={`/wounds/${data.id}/report`}
                className="inline-flex items-center gap-2 rounded-lg border border-ww-line bg-white px-4 py-2 text-sm font-medium text-ww-navy hover:bg-ww-bg"
              >
                <FileText className="h-4 w-4 text-ww-teal" />
                Report
              </Link>
                        <div className="flex flex-wrap gap-2">
              <Link
                to={`/wounds/${data.id}/progress`}
                className="inline-flex items-center gap-2 rounded-lg border border-ww-line bg-white px-4 py-2 text-sm font-medium text-ww-navy hover:bg-ww-bg"
              >
                <TrendingDown className="h-4 w-4 text-ww-teal" />
                View progress
              </Link>
              <Link
                to={`/upload?wound=${data.id}`}
                className="inline-flex items-center gap-2 rounded-lg bg-ww-teal px-4 py-2 text-sm font-medium text-white hover:bg-ww-teal-dark"
              >
                <UploadCloud className="h-4 w-4" />
                Add new image
              </Link>
            </div>
          </div>

          {images.length === 0 ? (
            <EmptyState
              icon={ImageIcon}
              title="No images yet"
              text="Upload a first image of this wound to see an AI-assisted analysis."
            />
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Image viewer */}
              <Card className="lg:col-span-2">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-ww-navy">
                    Image from {formatDate(selected.captured_at)}
                  </p>
                  <div className="inline-flex rounded-lg border border-ww-line p-0.5 text-sm">
                    {[
                      { key: 'original', label: 'Original' },
                      { key: 'overlay', label: 'AI overlay' },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => setView(opt.key)}
                        disabled={opt.key === 'overlay' && !analysis}
                        className={`rounded-md px-3 py-1.5 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                          view === opt.key
                            ? 'bg-ww-navy text-white'
                            : 'text-ww-navy hover:bg-ww-bg'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <img
                  src={
                    view === 'overlay' && analysis
                      ? analysis.overlay_url
                      : selected.image_url
                  }
                  alt="Wound"
                  className="w-full rounded-xl bg-ww-bg"
                />
                {!analysis && (
                  <p className="mt-2 text-sm text-ww-muted">
                    This image has not been analysed yet.
                  </p>
                )}

                {/* Thumbnails: click one to view it */}
                <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                  {images.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedId(img.id)}
                      className={`shrink-0 rounded-lg p-1 text-left ${
                        img.id === selected.id
                          ? 'ring-2 ring-ww-teal'
                          : 'ring-1 ring-ww-line hover:ring-ww-teal/50'
                      }`}
                    >
                      <img
                        src={img.image_url}
                        alt=""
                        className="h-16 w-20 rounded-md object-cover"
                      />
                      <p className="mt-1 text-center text-xs text-ww-muted">
                        {formatDate(img.captured_at)}
                      </p>
                    </button>
                  ))}
                </div>
              </Card>

              {/* Measurements */}
              <Card title="Measurements">
                <dl className="space-y-4 text-sm">
                  <div>
                    <dt className="text-ww-muted">Pixel area</dt>
                    <dd className="text-xl font-semibold text-ww-navy">
                      {analysis ? `${formatNumber(analysis.pixel_area)} px` : '-'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-ww-muted">Share of image area</dt>
                    <dd className="font-medium text-ww-navy">
                      {analysis
                        ? `${(analysis.image_area_ratio * 100).toFixed(1)}%`
                        : '-'}
                    </dd>
                  </div>
                  <div>
                    <dt className="mb-1 text-ww-muted">Image quality</dt>
                    <dd>
                      <QualityBadge quality={selected.image_quality} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-ww-muted">Model</dt>
                    <dd className="font-medium text-ww-navy">
                      {analysis ? analysis.model_version : '-'}
                    </dd>
                  </div>
                </dl>
                                {analysis && (
                  <Link
                    to={`/wounds/${data.id}/results/${selected.id}`}
                    className="mt-4 inline-flex w-full items-center justify-center rounded-lg border border-ww-line px-3 py-2 text-sm font-medium text-ww-navy hover:bg-ww-bg"
                  >
                    View full analysis
                  </Link>
                )}
                <p className="mt-4 flex items-start gap-2 border-t border-ww-line pt-3 text-xs text-ww-muted">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-ww-teal" />
                  Pixel measurements depend on camera distance and lighting. They
                  are not cm² and do not by themselves show healing.
                </p>
              </Card>
            </div>
          )}

          {/* Care notes */}
          <Card title="Care notes" className="mt-6">
            <form onSubmit={handleAddNote} className="mb-4">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={2}
                placeholder="Add a note, e.g. how the photo was taken"
                className={inputClass}
              />
              {noteError && (
                <p className="mt-1 text-sm text-red-600">{noteError}</p>
              )}
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-ww-navy px-4 py-2 text-sm font-medium text-white hover:bg-ww-navy/90 disabled:opacity-60"
                >
                  <Send className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Add note'}
                </button>
              </div>
            </form>

            {data.notes.length === 0 ? (
              <p className="flex items-center gap-2 text-sm text-ww-muted">
                <StickyNote className="h-4 w-4" />
                No notes yet.
              </p>
            ) : (
              <ul className="space-y-3">
                {[...data.notes].reverse().map((n) => (
                  <li key={n.id} className="rounded-lg bg-ww-bg p-3 text-sm">
                    <p className="text-ww-text">{n.note}</p>
                    <p className="mt-1 text-xs text-ww-muted">
                      {formatDate(n.created_at)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      )}
    </div>
  )
}