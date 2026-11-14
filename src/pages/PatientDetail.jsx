import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, Activity, ChevronRight } from 'lucide-react'
import { api } from '../services/api'
import useAsync from '../hooks/useAsync'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import FormField from '../components/ui/FormField'
import LoadingState from '../components/ui/LoadingState'
import ErrorState from '../components/ui/ErrorState'
import EmptyState from '../components/ui/EmptyState'
import { inputClass } from '../utils/styles'
import { formatDate, formatNumber } from '../utils/format'

const CATEGORIES = [
  'Foot ulcer',
  'Surgical wound',
  'Pressure injury',
  'Burn',
  'Laceration',
  'Other',
]

export default function PatientDetail() {
  const { patientId } = useParams()
  const { data, loading, error, reload } = useAsync(
    () => api.getPatient(patientId),
    [patientId],
  )

  const [modalOpen, setModalOpen] = useState(false)
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [description, setDescription] = useState('')
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  function closeModal() {
    setModalOpen(false)
    setLocation('')
    setCategory(CATEGORIES[0])
    setDescription('')
    setFormError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!location.trim()) {
      setFormError('Please enter the wound location.')
      return
    }
    setSaving(true)
    try {
      await api.createWound({
        patient_id: patientId,
        wound_location: location.trim(),
        wound_category: category,
        description: description.trim(),
      })
      closeModal()
      reload()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <Link
        to="/patients"
        className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-ww-teal hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        All patients
      </Link>

      {loading && !data && <LoadingState label="Loading patient..." />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {data && (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <PageHeader
              title={data.name}
              subtitle={`${data.age ? `Age ${data.age} · ` : ''}Record created ${formatDate(data.created_at)}`}
            />
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-ww-teal px-4 py-2 text-sm font-medium text-white hover:bg-ww-teal-dark"
            >
              <Plus className="h-4 w-4" />
              Add wound
            </button>
          </div>

          {data.wounds.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="No wounds recorded"
              text="Add a wound to start tracking images and measurements."
            />
          ) : (
            <Card title={`Wounds (${data.wounds.length})`}>
              <ul className="divide-y divide-ww-line">
                {data.wounds.map((w) => (
                  <li key={w.id}>
                    <Link
                      to={`/wounds/${w.id}`}
                      className="flex items-center gap-3 py-3 hover:bg-ww-bg/60"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ww-navy">
                          {w.wound_location}
                        </p>
                        <p className="text-xs text-ww-muted">
                          {w.wound_category} · {w.image_count} image
                          {w.image_count === 1 ? '' : 's'}
                          {w.latest_captured_at &&
                            ` · last ${formatDate(w.latest_captured_at)}`}
                          {w.latest_pixel_area !== null &&
                            ` · ${formatNumber(w.latest_pixel_area)} px`}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-ww-muted" />
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </>
      )}

      <Modal open={modalOpen} title="Add wound" onClose={closeModal}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Wound location">
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Left heel"
              className={inputClass}
              autoFocus
            />
          </FormField>
          <FormField label="Category">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputClass}
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Description" optional>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={inputClass}
            />
          </FormField>
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-lg border border-ww-line px-4 py-2 text-sm font-medium text-ww-navy hover:bg-ww-bg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-ww-teal px-4 py-2 text-sm font-medium text-white hover:bg-ww-teal-dark disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save wound'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}