import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  UploadCloud,
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  FlaskConical,
  History,
} from 'lucide-react'
import { api } from '../services/api'
import useAsync from '../hooks/useAsync'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import QualityBadge from '../components/ui/QualityBadge'
import LimitationsPanel from '../components/ui/LimitationsPanel'
import LoadingState from '../components/ui/LoadingState'
import ErrorState from '../components/ui/ErrorState'
import { formatDate, formatNumber, formatPercent } from '../utils/format'

// Loads the wound (with all its images) and the progress points,
// then picks out this image and the one before it.
async function loadResult(woundId, imageId) {
  const [wound, progress] = await Promise.all([
    api.getWound(woundId),
    api.getProgress(woundId),
  ])
  const image = wound.images.find((i) => i.id === imageId)
  if (!image) throw new Error('This image was not found.')
  const index = progress.points.findIndex((p) => p.image_id === imageId)
  const previous = index > 0 ? progress.points[index - 1] : null
  return { wound, image, previous }
}

function Tile({ label, value }) {
  return (
    <div className="rounded-xl border border-ww-line bg-white p-4">
      <p className="text-xs text-ww-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold text-ww-navy">{value}</p>
    </div>
  )
}

function ImagePanel({ label, src, badge }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-ww-navy">{label}</p>
        {badge}
      </div>
      <img src={src} alt={label} className="w-full rounded-xl bg-ww-bg" />
    </div>
  )
}

const qualityText = {
  good: 'This photo passed the basic checks for blur, lighting and size.',
  fair: 'This photo was usable, but the issues below may reduce how comparable the measurement is.',
  poor: 'This photo did not pass the basic checks.',
}

export default function AnalysisResult() {
  const { woundId, imageId } = useParams()
  const { data, loading, error, reload } = useAsync(
    () => loadResult(woundId, imageId),
    [woundId, imageId],
  )

  const analysis = data ? data.image.analysis : null
  const isSimulated = analysis && analysis.model_version.includes('MOCK')

  let comparison = null
  if (analysis && data.previous && data.previous.pixel_area > 0) {
    const change = analysis.pixel_area - data.previous.pixel_area
    const days = Math.round(
      (new Date(data.image.captured_at) - new Date(data.previous.captured_at)) /
        86400000,
    )
    comparison = {
      change,
      percent: Number(((change / data.previous.pixel_area) * 100).toFixed(1)),
      days,
    }
  }
  const ChangeIcon = comparison
    ? comparison.change < 0
      ? ArrowDownRight
      : comparison.change > 0
        ? ArrowUpRight
        : Minus
    : null

  return (
    <div>
      <Link
        to={`/wounds/${woundId}`}
        className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-ww-teal hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Wound history
      </Link>

      {loading && !data && <LoadingState label="Loading analysis..." />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {data && (
        <div className="space-y-6">
          <PageHeader
            title="Analysis result"
            subtitle={`${data.wound.patient.name} · ${data.wound.wound_location} · photo from ${formatDate(data.image.captured_at)}`}
          />

          {!analysis && (
            <ErrorState message="This image has not been analysed yet." />
          )}

          {analysis && (
            <>
              <Card title="Segmentation comparison">
                <div className="grid gap-4 md:grid-cols-2">
                  <ImagePanel label="Original photo" src={data.image.image_url} />
                  <ImagePanel
                    label="Segmentation overlay"
                    src={analysis.overlay_url}
                    badge={
                      isSimulated && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
                          <FlaskConical className="h-3 w-3" />
                          Simulated
                        </span>
                      )
                    }
                  />
                </div>
              </Card>

              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Tile
                  label="Pixel area"
                  value={`${formatNumber(analysis.pixel_area)} px`}
                />
                <Tile
                  label="Share of image area"
                  value={`${(analysis.image_area_ratio * 100).toFixed(1)}%`}
                />
                <Tile
                  label="Image size"
                  value={`${analysis.image_width} × ${analysis.image_height}`}
                />
                <Tile label="Model" value={analysis.model_version} />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card title="Image quality report">
                  <QualityBadge quality={data.image.image_quality} />
                  <p className="mt-3 text-sm text-ww-muted">
                    {qualityText[data.image.image_quality?.status] ||
                      'No quality information is available.'}
                  </p>
                  {data.image.image_quality && (
                    <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <dt className="text-ww-muted">Sharpness score</dt>
                        <dd className="font-medium text-ww-navy">
                          {data.image.image_quality.blur_score}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-ww-muted">Brightness (0-255)</dt>
                        <dd className="font-medium text-ww-navy">
                          {data.image.image_quality.brightness}
                        </dd>
                      </div>
                    </dl>
                  )}
                </Card>

                <Card title="Compared with previous photo">
                  {!comparison ? (
                    <p className="text-sm text-ww-muted">
                      This is the first analysed photo of this wound, so there is
                      nothing to compare yet. Add another photo on a later date to
                      see the change.
                    </p>
                  ) : (
                    <>
                      <p className="flex items-center gap-2 text-2xl font-semibold text-ww-navy">
                        <ChangeIcon className="h-6 w-6 text-ww-teal" />
                        {formatPercent(comparison.percent)}
                      </p>
                      <p className="mt-1 text-sm text-ww-muted">
                        Pixel area went from{' '}
                        {formatNumber(data.previous.pixel_area)} px (
                        {formatDate(data.previous.captured_at)}) to{' '}
                        {formatNumber(analysis.pixel_area)} px, over{' '}
                        {comparison.days} day{comparison.days === 1 ? '' : 's'}.
                      </p>
                      <p className="mt-3 text-xs text-ww-muted">
                        A change in pixel area is a visual observation only. It
                        does not by itself show healing or worsening.
                      </p>
                    </>
                  )}
                </Card>
              </div>
            </>
          )}

          <LimitationsPanel />

          <div className="flex flex-wrap gap-3">
            <Link
              to={`/wounds/${woundId}`}
              className="inline-flex items-center gap-2 rounded-lg bg-ww-navy px-4 py-2 text-sm font-medium text-white hover:bg-ww-navy/90"
            >
              <History className="h-4 w-4" />
              View wound history
            </Link>
            <Link
              to={`/upload?wound=${woundId}`}
              className="inline-flex items-center gap-2 rounded-lg bg-ww-teal px-4 py-2 text-sm font-medium text-white hover:bg-ww-teal-dark"
            >
              <UploadCloud className="h-4 w-4" />
              Add another image
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}