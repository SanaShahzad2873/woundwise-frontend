import { useState, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  Info,
  UploadCloud,
  StickyNote,
  Camera,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'
import { api } from '../services/api'
import useAsync from '../hooks/useAsync'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import LimitationsPanel from '../components/ui/LimitationsPanel'
import LoadingState from '../components/ui/LoadingState'
import ErrorState from '../components/ui/ErrorState'
import EmptyState from '../components/ui/EmptyState'
import { inputClass } from '../utils/styles'
import {
  formatDate,
  formatShortDate,
  formatNumber,
  formatPercent,
} from '../utils/format'

async function loadProgress(woundId) {
  const [wound, progress] = await Promise.all([
    api.getWound(woundId),
    api.getProgress(woundId),
  ])
  return { wound, points: progress.points }
}

function percentChange(from, to) {
  if (!from) return null
  return Number((((to - from) / from) * 100).toFixed(1))
}

function Tile({ label, children }) {
  return (
    <div className="rounded-xl border border-ww-line bg-white p-4">
      <p className="text-xs text-ww-muted">{label}</p>
      <div className="mt-1 text-lg font-semibold text-ww-navy">{children}</div>
    </div>
  )
}

export default function WoundProgress() {
  const { woundId } = useParams()
  const { data, loading, error, reload } = useAsync(
    () => loadProgress(woundId),
    [woundId],
  )

  const [photoA, setPhotoA] = useState('')
  const [photoB, setPhotoB] = useState('')
  const [view, setView] = useState('overlay') // 'overlay' or 'original'

  const points = data ? data.points : []

  // Work out which two photos are being compared (default: last two).
  const pair = useMemo(() => {
    if (points.length < 2) return null
    const a = points.find((p) => p.image_id === photoA) || points[points.length - 2]
    const b = points.find((p) => p.image_id === photoB) || points[points.length - 1]
    // Always show the earlier photo on the left.
    const [earlier, later] =
      new Date(a.captured_at) <= new Date(b.captured_at) ? [a, b] : [b, a]
    return {
      a,
      b,
      earlier,
      later,
      same: a.image_id === b.image_id,
      percent: percentChange(earlier.pixel_area, later.pixel_area),
      days: Math.round(
        (new Date(later.captured_at) - new Date(earlier.captured_at)) / 86400000,
      ),
      ratioShift: Number(
        ((later.image_area_ratio - earlier.image_area_ratio) * 100).toFixed(1),
      ),
    }
  }, [points, photoA, photoB])

  const chartRows = points.map((p) => ({
    date: p.captured_at.slice(0, 10),
    area: p.pixel_area,
  }))

  // Timeline: photos and notes together, newest first.
  const events = data
    ? [
        ...points.map((p, i) => ({
          type: 'photo',
          date: p.captured_at,
          point: p,
          prev: i > 0 ? points[i - 1] : null,
        })),
        ...data.wound.notes.map((n) => ({ type: 'note', date: n.created_at, note: n })),
      ].sort((x, y) => new Date(y.date) - new Date(x.date))
    : []

  const Arrow =
    pair && pair.percent !== null
      ? pair.percent < 0
        ? ArrowDownRight
        : pair.percent > 0
          ? ArrowUpRight
          : Minus
      : Minus

  const photoOption = (p) => `${formatDate(p.captured_at)} · ${formatNumber(p.pixel_area)} px`

  return (
    <div>
      <Link
        to={`/wounds/${woundId}`}
        className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-ww-teal hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Wound history
      </Link>

      {loading && !data && <LoadingState label="Loading progress..." />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {data && (
        <div className="space-y-6">
          <PageHeader
            title="Progress comparison"
            subtitle={`${data.wound.patient.name} · ${data.wound.wound_location}`}
          />

          {points.length < 2 && (
            <EmptyState
              icon={Camera}
              title="At least two analysed photos are needed"
              text="Add another photo of this wound on a later date to compare them."
            >
              <Link
                to={`/upload?wound=${woundId}`}
                className="inline-flex items-center gap-2 rounded-lg bg-ww-teal px-4 py-2 text-sm font-medium text-white hover:bg-ww-teal-dark"
              >
                <UploadCloud className="h-4 w-4" />
                Add new image
              </Link>
            </EmptyState>
          )}

          {pair && (
            <Card title="Compare two photos">
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-ww-navy">Photo A</span>
                  <select
                    value={pair.a.image_id}
                    onChange={(e) => setPhotoA(e.target.value)}
                    className={inputClass}
                  >
                    {points.map((p) => (
                      <option key={p.image_id} value={p.image_id}>
                        {photoOption(p)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-ww-navy">Photo B</span>
                  <select
                    value={pair.b.image_id}
                    onChange={(e) => setPhotoB(e.target.value)}
                    className={inputClass}
                  >
                    {points.map((p) => (
                      <option key={p.image_id} value={p.image_id}>
                        {photoOption(p)}
                      </option>
                    ))}
                  </select>
                </label>
                <div>
                  <span className="mb-1 block text-sm font-medium text-ww-navy">Show</span>
                  <div className="inline-flex rounded-lg border border-ww-line p-0.5 text-sm">
                    {[
                      { key: 'overlay', label: 'AI overlay' },
                      { key: 'original', label: 'Original' },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setView(opt.key)}
                        className={`rounded-md px-3 py-1.5 font-medium ${
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
              </div>

              {pair.same ? (
                <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                  Photo A and Photo B are the same image. Choose two different photos.
                </p>
              ) : (
                <>
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    {[
                      { label: 'Earlier', p: pair.earlier },
                      { label: 'Later', p: pair.later },
                    ].map(({ label, p }) => (
                      <div key={label}>
                        <p className="mb-2 text-sm font-medium text-ww-navy">
                          {label}
                          <span className="font-normal text-ww-muted">
                            {' '}
                            · {formatDate(p.captured_at)}
                          </span>
                        </p>
                        <img
                          src={view === 'overlay' ? p.overlay_url : p.image_url}
                          alt={`${label} photo`}
                          className="w-full rounded-xl bg-ww-bg"
                        />
                        <p className="mt-1 text-xs text-ww-muted">
                          {formatNumber(p.pixel_area)} px
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <Tile label="Pixel area change">
                      <span className="inline-flex items-center gap-1">
                        <Arrow className="h-5 w-5 text-ww-teal" />
                        {formatPercent(pair.percent)}
                      </span>
                    </Tile>
                    <Tile label="Earlier → later">
                      <span className="text-base">
                        {formatNumber(pair.earlier.pixel_area)} →{' '}
                        {formatNumber(pair.later.pixel_area)} px
                      </span>
                    </Tile>
                    <Tile label="Days between">{pair.days}</Tile>
                    <Tile label="Share of image area">
                      <span className="text-base">
                        {(pair.earlier.image_area_ratio * 100).toFixed(1)}% →{' '}
                        {(pair.later.image_area_ratio * 100).toFixed(1)}%
                      </span>
                    </Tile>
                  </div>
                  <p className="mt-3 flex items-start gap-2 text-xs text-ww-muted">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-ww-teal" />
                    Image conditions (distance, angle, lighting) can change these
                    measurements. A smaller or larger pixel area does not by itself
                    show healing or worsening.
                  </p>
                </>
              )}
            </Card>
          )}

          {points.length >= 1 && (
            <Card title="Pixel area over time">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartRows}>
                    <CartesianGrid stroke="#e3e8ee" strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatShortDate}
                      stroke="#6b7a8c"
                      fontSize={12}
                    />
                    <YAxis
                      stroke="#6b7a8c"
                      fontSize={12}
                      width={55}
                      tickFormatter={formatNumber}
                    />
                    <Tooltip
                      labelFormatter={formatDate}
                      formatter={(value) => [`${formatNumber(value)} px`, 'Pixel area']}
                    />
                    <Line
                      type="monotone"
                      dataKey="area"
                      stroke="#0f766e"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          <Card title="Timeline">
            {events.length === 0 ? (
              <p className="text-sm text-ww-muted">Nothing has been recorded yet.</p>
            ) : (
              <ol className="ml-2 border-l border-ww-line">
                {events.map((ev) => {
                  if (ev.type === 'note') {
                    return (
                      <li key={`n-${ev.note.id}`} className="relative pb-5 pl-6">
                        <span className="absolute -left-2 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white ring-2 ring-ww-line">
                          <StickyNote className="h-2.5 w-2.5 text-ww-muted" />
                        </span>
                        <p className="text-xs text-ww-muted">{formatDate(ev.date)} · Note</p>
                        <p className="mt-0.5 text-sm text-ww-text">{ev.note.note}</p>
                      </li>
                    )
                  }
                  const change = ev.prev
                    ? percentChange(ev.prev.pixel_area, ev.point.pixel_area)
                    : null
                  return (
                    <li key={`p-${ev.point.image_id}`} className="relative pb-5 pl-6">
                      <span className="absolute -left-2 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-ww-teal">
                        <Camera className="h-2.5 w-2.5 text-white" />
                      </span>
                      <Link
                        to={`/wounds/${woundId}/results/${ev.point.image_id}`}
                        className="flex items-center gap-3 rounded-lg p-1 hover:bg-ww-bg"
                      >
                        <img
                          src={ev.point.overlay_url}
                          alt=""
                          className="h-12 w-16 shrink-0 rounded-md object-cover"
                        />
                        <div>
                          <p className="text-xs text-ww-muted">
                            {formatDate(ev.date)} · Photo analysed
                          </p>
                          <p className="text-sm font-medium text-ww-navy">
                            {formatNumber(ev.point.pixel_area)} px
                            {change !== null && (
                              <span className="font-normal text-ww-muted">
                                {' '}
                                ({formatPercent(change)} vs previous photo)
                              </span>
                            )}
                          </p>
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ol>
            )}
          </Card>

          <LimitationsPanel />
        </div>
      )}
    </div>
  )
}