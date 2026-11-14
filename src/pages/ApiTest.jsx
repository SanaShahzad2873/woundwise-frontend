import { useState } from 'react'
import { api, isMock } from '../services/api'
import useAsync from '../hooks/useAsync'
import PageHeader from '../components/ui/PageHeader'

export default function ApiTest() {
  const patients = useAsync(() => api.getPatients())
  const progress = useAsync(() => api.getProgress('w1'))
  const [errorDemo, setErrorDemo] = useState('')

  async function testError() {
    setErrorDemo('Loading...')
    try {
      await api.getWound('does-not-exist')
    } catch (err) {
      setErrorDemo(`Error caught correctly: "${err.message}"`)
    }
  }

  const latest = progress.data?.comparison?.latest
  const previous = progress.data?.comparison?.previous

  return (
    <div>
      <PageHeader
        title="API test page"
        subtitle={`Mode: ${isMock ? 'MOCK (fake data)' : 'REAL backend'}`}
      />

      <div className="space-y-6">
        <section className="rounded-2xl border border-ww-line bg-white p-5">
          <h2 className="font-semibold text-ww-navy">1. Patients</h2>
          {patients.loading && <p className="mt-2 text-sm text-ww-muted">Loading patients...</p>}
          {patients.error && <p className="mt-2 text-sm text-red-600">{patients.error}</p>}
          <ul className="mt-2 space-y-1 text-sm">
            {patients.data?.map((p) => (
              <li key={p.id}>
                {p.name} (age {p.age}), {p.wound_count} wound(s)
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-ww-line bg-white p-5">
          <h2 className="font-semibold text-ww-navy">2. Progress for wound w1</h2>
          {progress.loading && <p className="mt-2 text-sm text-ww-muted">Loading progress...</p>}
          {progress.error && <p className="mt-2 text-sm text-red-600">{progress.error}</p>}
          {progress.data?.comparison && (
            <>
              <p className="mt-2 text-sm">
                Pixel area changed by{' '}
                <b>{progress.data.comparison.pixel_area_change_percent}%</b> between the last two
                images ({previous.pixel_area} to {latest.pixel_area} pixels).
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <p className="mb-1 text-xs text-ww-muted">Previous (original)</p>
                  <img src={previous.image_url} alt="Previous wound" className="rounded-lg" />
                </div>
                <div>
                  <p className="mb-1 text-xs text-ww-muted">Latest (overlay)</p>
                  <img src={latest.overlay_url} alt="Latest overlay" className="rounded-lg" />
                </div>
              </div>
            </>
          )}
        </section>

        <section className="rounded-2xl border border-ww-line bg-white p-5">
          <h2 className="font-semibold text-ww-navy">3. Error handling</h2>
          <button
            onClick={testError}
            className="mt-2 rounded-lg bg-ww-navy px-4 py-2 text-sm font-medium text-white hover:bg-ww-navy/90"
          >
            Test error state
          </button>
          {errorDemo && <p className="mt-2 text-sm">{errorDemo}</p>}
        </section>
      </div>
    </div>
  )
}