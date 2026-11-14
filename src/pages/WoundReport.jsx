import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Printer, Info } from 'lucide-react'
import { api, isMock } from '../services/api'
import useAsync from '../hooks/useAsync'
import LoadingState from '../components/ui/LoadingState'
import ErrorState from '../components/ui/ErrorState'
import EmptyState from '../components/ui/EmptyState'
import { inputClass } from '../utils/styles'
import { formatDate, formatNumber, formatPercent } from '../utils/format'

function percentChange(from, to) {
  if (!from) return null
  return Number((((to - from) / from) * 100).toFixed(1))
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4 border-b border-ww-line py-2 text-sm">
      <dt className="text-ww-muted">{label}</dt>
      <dd className="text-right font-medium text-ww-navy">{value}</dd>
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <h2 className="mb-2 mt-6 border-b-2 border-ww-navy pb-1 text-sm font-semibold uppercase tracking-wide text-ww-navy">
      {children}
    </h2>
  )
}

export default function WoundReport() {
  const { woundId } = useParams()
  const { data: wound, loading, error, reload } = useAsync(
    () => api.getWound(woundId),
    [woundId],
  )
  const [selectedId, setSelectedId] = useState('')

  const analysed = wound
    ? wound.images.filter(
        (i) => i.analysis && i.analysis.analysis_status === 'completed',
      )
    : []
  const selected =
    analysed.find((i) => i.id === selectedId) || analysed[analysed.length - 1]
  const index = selected ? analysed.indexOf(selected) : -1
  const previous = index > 0 ? analysed[index - 1] : null
  const history = analysed.slice(0, index + 1)

  const changeVsPrevious =
    previous && selected
      ? percentChange(previous.analysis.pixel_area, selected.analysis.pixel_area)
      : null
  const daysBetween =
    previous && selected
      ? Math.round(
          (new Date(selected.captured_at) - new Date(previous.captured_at)) /
            86400000,
        )
      : null

  return (
    <div>
      {/* Screen-only toolbar (hidden when printing) */}
      <div className="mb-4 print:hidden">
        <Link
          to={`/wounds/${woundId}`}
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-ww-teal hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Wound history
        </Link>

        {analysed.length > 0 && (
          <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-ww-line bg-white p-4">
            <label className="block min-w-56 flex-1">
              <span className="mb-1 block text-sm font-medium text-ww-navy">
                Report for photo
              </span>
              <select
                value={selected.id}
                onChange={(e) => setSelectedId(e.target.value)}
                className={inputClass}
              >
                {analysed.map((i) => (
                  <option key={i.id} value={i.id}>
                    {formatDate(i.captured_at)} · {formatNumber(i.analysis.pixel_area)} px
                  </option>
                ))}
              </select>
            </label>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-lg bg-ww-teal px-4 py-2 text-sm font-medium text-white hover:bg-ww-teal-dark"
            >
              <Printer className="h-4 w-4" />
              Download PDF
            </button>
            <p className="flex w-full items-start gap-2 text-xs text-ww-muted">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-ww-teal" />
              In the window that opens, set Destination to "Save as PDF" and
              switch on "Background graphics" so colours and images appear.
            </p>
          </div>
        )}
      </div>

      {loading && !wound && <LoadingState label="Preparing report..." />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {wound && analysed.length === 0 && (
        <EmptyState
          title="No analysed photos yet"
          text="A report needs at least one analysed photo of this wound."
        />
      )}

      {wound && selected && (
        <article className="rounded-2xl border border-ww-line bg-white p-6 shadow-sm print:rounded-none print:border-0 print:p-0 print:shadow-none sm:p-8">
          {/* Header */}
          <header className="flex flex-wrap items-start justify-between gap-3 border-b border-ww-line pb-4">
            <div>
              <p className="text-lg font-semibold text-ww-navy">
                WoundWise <span className="text-ww-teal">AI</span>
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ww-navy">
                Wound Progress Report
              </h1>
            </div>
            <div className="text-right text-sm text-ww-muted">
              <p>Report generated</p>
              <p className="font-medium text-ww-navy">{formatDate(new Date().toISOString())}</p>
            </div>
          </header>

          {isMock && (
            <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
              <b>Demo report.</b> This report contains fictional demo data and a
              simulated segmentation overlay. It is not a real patient record or
              real AI output.
            </p>
          )}

          <SectionTitle>Patient and wound reference</SectionTitle>
          <dl className="grid gap-x-8 sm:grid-cols-2">
            <Row label="Patient" value={wound.patient.name} />
            <Row label="Age" value={wound.patient.age || '-'} />
            <Row label="Wound location" value={wound.wound_location} />
            <Row label="Category" value={wound.wound_category} />
            <Row label="Wound record created" value={formatDate(wound.created_at)} />
            <Row label="Wound reference" value={wound.id} />
          </dl>

          <div className="break-inside-avoid">
            <SectionTitle>Analysis of photo from {formatDate(selected.captured_at)}</SectionTitle>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="mb-1 text-xs font-medium text-ww-muted">Original photo</p>
                <img src={selected.image_url} alt="Original" className="w-full rounded-lg" />
              </div>
              <div>
                <p className="mb-1 text-xs font-medium text-ww-muted">Segmentation overlay</p>
                <img
                  src={selected.analysis.overlay_url}
                  alt="Segmentation overlay"
                  className="w-full rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="break-inside-avoid">
            <SectionTitle>Measurements</SectionTitle>
            <dl className="grid gap-x-8 sm:grid-cols-2">
              <Row label="Pixel area" value={`${formatNumber(selected.analysis.pixel_area)} px`} />
              <Row
                label="Share of image area"
                value={`${(selected.analysis.image_area_ratio * 100).toFixed(1)}%`}
              />
              <Row
                label="Image size"
                value={`${selected.analysis.image_width} × ${selected.analysis.image_height} px`}
              />
              <Row label="Model" value={selected.analysis.model_version} />
              <Row
                label="Image quality"
                value={selected.image_quality ? selected.image_quality.status : 'Not assessed'}
              />
              <Row
                label="Quality notes"
                value={
                  selected.image_quality?.issues?.length
                    ? selected.image_quality.issues.join('; ')
                    : 'None'
                }
              />
            </dl>
            <p className="mt-2 text-xs text-ww-muted">
              Areas are in image pixels, not cm². No calibration reference was used.
            </p>
          </div>

          <div className="break-inside-avoid">
            <SectionTitle>Comparison with previous photo</SectionTitle>
            {previous ? (
              <dl className="grid gap-x-8 sm:grid-cols-2">
                <Row label="Previous photo" value={formatDate(previous.captured_at)} />
                <Row label="Days between photos" value={daysBetween} />
                <Row
                  label="Previous pixel area"
                  value={`${formatNumber(previous.analysis.pixel_area)} px`}
                />
                <Row
                  label="Change in pixel area"
                  value={formatPercent(changeVsPrevious)}
                />
              </dl>
            ) : (
              <p className="text-sm text-ww-muted">
                This is the first analysed photo, so there is no earlier photo to compare.
              </p>
            )}
          </div>

          {history.length > 1 && (
            <div className="break-inside-avoid">
              <SectionTitle>Photo history</SectionTitle>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-ww-line text-xs text-ww-muted">
                    <th className="py-2 font-medium">Date</th>
                    <th className="py-2 font-medium">Pixel area</th>
                    <th className="py-2 font-medium">Change vs previous</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((img, i) => (
                    <tr key={img.id} className="border-b border-ww-line">
                      <td className="py-2">{formatDate(img.captured_at)}</td>
                      <td className="py-2">{formatNumber(img.analysis.pixel_area)} px</td>
                      <td className="py-2">
                        {i === 0
                          ? '-'
                          : formatPercent(
                              percentChange(
                                history[i - 1].analysis.pixel_area,
                                img.analysis.pixel_area,
                              ),
                            )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="break-inside-avoid">
            <SectionTitle>Care notes</SectionTitle>
            {wound.notes.length === 0 ? (
              <p className="text-sm text-ww-muted">No notes recorded.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {wound.notes.map((n) => (
                  <li key={n.id}>
                    <span className="text-ww-muted">{formatDate(n.created_at)}: </span>
                    {n.note}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-8 break-inside-avoid rounded-lg border border-ww-line bg-ww-bg p-4 text-xs text-ww-muted">
            <p className="font-medium text-ww-navy">Medical disclaimer</p>
            <p className="mt-1">
              WoundWise AI provides AI-assisted visual analysis and wound progress
              documentation. It is not a substitute for professional medical
              assessment, diagnosis, or treatment. Measurements are image-based
              observations and are affected by camera distance, angle and lighting.
            </p>
          </div>
        </article>
      )}
    </div>
  )
}