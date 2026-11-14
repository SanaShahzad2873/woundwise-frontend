import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  Users,
  Image as ImageIcon,
  CalendarClock,
  UploadCloud,
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  Info,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'
import { api } from '../services/api'
import useAsync from '../hooks/useAsync'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import StatCard from '../components/ui/StatCard'
import LoadingState from '../components/ui/LoadingState'
import ErrorState from '../components/ui/ErrorState'
import EmptyState from '../components/ui/EmptyState'
import {
  formatDate,
  formatShortDate,
  formatNumber,
  formatPercent,
} from '../utils/format'


const LINE_COLORS = ['#0f766e', '#0b2545', '#d97706', '#6b7a8c']

// Step 1: ask the API for everything the dashboard needs.
async function loadDashboard() {
  const [wounds, patients] = await Promise.all([
    api.getWounds(),
    api.getPatients(),
  ])
  const progressList = await Promise.all(wounds.map((w) => api.getProgress(w.id)))
  return { wounds, patients, progressList }
}

// Step 2: turn the raw API data into the shapes our screen needs.
function buildSummary({ wounds, patients, progressList }) {
  const woundRows = wounds.map((w, i) => ({
    ...w,
    points: progressList[i].points,
    comparison: progressList[i].comparison,
  }))

  const allPoints = woundRows.flatMap((w) =>
    w.points.map((p) => ({
      ...p,
      wound_id: w.id,
      patient_name: w.patient_name,
      wound_location: w.wound_location,
    })),
  )
  allPoints.sort((a, b) => new Date(b.captured_at) - new Date(a.captured_at))

  // One chart row per date; each wound gets its own column in that row.
  const byDate = {}
  woundRows.forEach((w) =>
    w.points.forEach((p) => {
      const day = p.captured_at.slice(0, 10)
      byDate[day] = byDate[day] || { date: day }
      byDate[day][w.id] = p.pixel_area
    }),
  )
  const chartRows = Object.values(byDate).sort((a, b) =>
    a.date.localeCompare(b.date),
  )

  return {
    woundRows,
    recent: allPoints.slice(0, 5),
    latestDate: allPoints.length ? allPoints[0].captured_at : null,
    chartRows,
    totalAnalyses: allPoints.length,
    patientCount: patients.length,
  }
}

// Small arrow + percentage shown next to each wound.
function ChangeIndicator({ comparison }) {
  if (!comparison) {
    return <span className="text-xs text-ww-muted">Needs 2 images to compare</span>
  }
  const pct = comparison.pixel_area_change_percent
  const Icon = pct < 0 ? ArrowDownRight : pct > 0 ? ArrowUpRight : Minus
  return (
    <span className="inline-flex items-center gap-1 text-sm font-medium text-ww-navy">
      <Icon className="h-4 w-4 text-ww-teal" />
      {formatPercent(pct)}
      <span className="text-xs font-normal text-ww-muted">pixel area vs previous</span>
    </span>
  )
}

export default function Dashboard() {
  const { data, loading, error, reload } = useAsync(loadDashboard)
  const summary = useMemo(() => (data ? buildSummary(data) : null), [data])

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader
          title="Dashboard"
          subtitle="Overview of monitored wounds and recent analyses"
        />
        <Link
          to="/upload"
          className="inline-flex items-center gap-2 rounded-lg border border-ww-line bg-white px-4 py-2 text-sm font-medium text-ww-navy hover:bg-ww-bg"
        >
          <UploadCloud className="h-4 w-4 text-ww-teal" />
          Quick upload
        </Link>
      </div>

      {loading && <LoadingState label="Loading dashboard..." />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {summary && summary.woundRows.length === 0 && (
        <EmptyState
          icon={Activity}
          title="No wounds monitored yet"
          text="Upload a first wound image to start tracking progress."
        >
          <Link
            to="/upload"
            className="rounded-lg bg-ww-teal px-4 py-2 text-sm font-medium text-white hover:bg-ww-teal-dark"
          >
            Start a new analysis
          </Link>
        </EmptyState>
      )}

      {summary && summary.woundRows.length > 0 && (
        <div className="space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label="Monitored wounds"
              value={summary.woundRows.length}
              icon={Activity}
            />
            <StatCard label="Patients" value={summary.patientCount} icon={Users} />
            <StatCard
              label="Analyses"
              value={summary.totalAnalyses}
              icon={ImageIcon}
            />
            <StatCard
              label="Latest analysis"
              value={formatDate(summary.latestDate)}
              icon={CalendarClock}
            />
          </div>

          {/* Chart + recent analyses */}
          <div className="grid gap-6 lg:grid-cols-3">
            <Card title="Progress overview" className="lg:col-span-2">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={summary.chartRows}>
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
                      formatter={(value) => [`${formatNumber(value)} px`, '']}
                    />
                    <Legend />
                    {summary.woundRows.map((w, i) => (
                      <Line
                        key={w.id}
                        type="monotone"
                        dataKey={w.id}
                        name={w.patient_name}
                        stroke={LINE_COLORS[i % LINE_COLORS.length]}
                        strokeWidth={2.5}
                        dot={{ r: 3 }}
                        connectNulls
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-3 flex items-start gap-2 text-xs text-ww-muted">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-ww-teal" />
                Values are pixel areas from each photo, not cm². Camera distance
                and lighting affect them, and a change in pixel area does not by
                itself show healing.
              </p>
            </Card>

            <Card title="Recent analyses">
              <ul className="space-y-3">
                {summary.recent.map((p) => (
                  <li key={p.image_id} className="flex items-center gap-3">
                    <img
                      src={p.overlay_url}
                      alt={`Segmentation overlay for ${p.patient_name}`}
                      className="h-12 w-16 shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ww-navy">
                        {p.patient_name}
                      </p>
                      <p className="truncate text-xs text-ww-muted">
                        {p.wound_location}
                      </p>
                      <p className="text-xs text-ww-muted">
                        {formatDate(p.captured_at)} · {formatNumber(p.pixel_area)} px
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Monitored wounds */}
          <Card
            title="Monitored wounds"
            action={
              <Link
                to="/patients"
                className="text-sm font-medium text-ww-teal hover:underline"
              >
                View patient records
              </Link>
            }
          >
            <ul className="divide-y divide-ww-line">
              {summary.woundRows.map((w) => (
                <li
                  key={w.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-ww-navy">
                      {w.patient_name}
                      <span className="font-normal text-ww-muted">
                        {' '}
                        · {w.wound_location}
                      </span>
                    </p>
                    <p className="text-xs text-ww-muted">
                      {w.wound_category} · {w.image_count} image
                      {w.image_count === 1 ? '' : 's'} · last{' '}
                      {formatDate(w.latest_captured_at)}
                    </p>
                  </div>
                  <ChangeIndicator comparison={w.comparison} />
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  )
}