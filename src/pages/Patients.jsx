import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, UserPlus, Users, ChevronRight } from 'lucide-react'
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

function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

export default function Patients() {
  const { data, loading, error, reload } = useAsync(() => api.getPatients())
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const filtered = useMemo(() => {
    if (!data) return []
    const q = query.trim().toLowerCase()
    return data.filter((p) => p.name.toLowerCase().includes(q))
  }, [data, query])

  function closeModal() {
    setModalOpen(false)
    setName('')
    setAge('')
    setFormError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) {
      setFormError('Please enter a patient name or reference.')
      return
    }
    if (age !== '' && (Number(age) < 0 || Number(age) > 120)) {
      setFormError('Age must be between 0 and 120.')
      return
    }
    setSaving(true)
    try {
      await api.createPatient({ name: name.trim(), age })
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
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader
          title="Patients"
          subtitle="Patient records and wound histories"
        />
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-ww-teal px-4 py-2 text-sm font-medium text-white hover:bg-ww-teal-dark"
        >
          <UserPlus className="h-4 w-4" />
          Add patient
        </button>
      </div>

      {loading && !data && <LoadingState label="Loading patients..." />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {data && data.length === 0 && (
        <EmptyState
          icon={Users}
          title="No patients yet"
          text="Add a demo patient to start documenting wounds."
        />
      )}

      {data && data.length > 0 && (
        <Card>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ww-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search patients by name"
              className={`${inputClass} pl-9`}
            />
          </div>

          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-ww-muted">
              No patients match "{query}".
            </p>
          ) : (
            <ul className="divide-y divide-ww-line">
              {filtered.map((p) => (
                <li key={p.id}>
                  <Link
                    to={`/patients/${p.id}`}
                    className="flex items-center gap-3 py-3 hover:bg-ww-bg/60"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ww-navy text-sm font-medium text-ww-mint">
                      {initials(p.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ww-navy">
                        {p.name}
                      </p>
                      <p className="text-xs text-ww-muted">
                        {p.age ? `Age ${p.age} · ` : ''}
                        {p.wound_count} wound{p.wound_count === 1 ? '' : 's'}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-ww-muted" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      <Modal open={modalOpen} title="Add patient" onClose={closeModal}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Name or reference">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Demo Patient D"
              className={inputClass}
              autoFocus
            />
          </FormField>
          <FormField label="Age" optional>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g. 52"
              className={inputClass}
            />
          </FormField>
          <p className="text-xs text-ww-muted">
            Use fictional or de-identified records only for this prototype.
          </p>
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
              {saving ? 'Saving...' : 'Save patient'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}