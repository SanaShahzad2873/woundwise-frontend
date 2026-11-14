import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2, FlaskConical, AlertTriangle, ImagePlus, Lightbulb } from 'lucide-react'
import { api, isMock } from '../services/api'
import useAsync from '../hooks/useAsync'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import FormField from '../components/ui/FormField'
import FileDropzone from '../components/upload/FileDropzone'
import { inputClass } from '../utils/styles'

const today = () => new Date().toISOString().slice(0, 10)

export default function UploadPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const woundParam = searchParams.get('wound')

  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [fileError, setFileError] = useState('')
  const [patientId, setPatientId] = useState('')
  const [woundId, setWoundId] = useState('')
  const [capturedAt, setCapturedAt] = useState(today())
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState({})
  const [step, setStep] = useState('idle') // idle | uploading | analysing
  const [submitError, setSubmitError] = useState('')

  const patients = useAsync(() => api.getPatients())
  const patientDetail = useAsync(
    () => (patientId ? api.getPatient(patientId) : Promise.resolve(null)),
    [patientId],
  )
  const wounds = patientDetail.data ? patientDetail.data.wounds : []
  const busy = step !== 'idle'

  // Preview URL for the chosen file (cleaned up when the file changes).
  useEffect(() => {
    if (!file) {
      setPreviewUrl('')
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  // Coming from a wound page ("Add new image"): pre-select patient and wound.
  useEffect(() => {
    if (!woundParam) return
    api
      .getWound(woundParam)
      .then((w) => {
        setPatientId(w.patient.id)
        setWoundId(w.id)
      })
      .catch(() => {})
  }, [woundParam])

  // If the chosen patient has exactly one wound, select it automatically.
  useEffect(() => {
    if (!woundId && wounds.length === 1) setWoundId(wounds[0].id)
  }, [wounds, woundId])

  function handlePatientChange(e) {
    setPatientId(e.target.value)
    setWoundId('')
    setErrors((prev) => ({ ...prev, patient: '', wound: '' }))
  }

  function validate() {
    const found = {}
    if (!file) found.file = 'Please choose an image first.'
    if (!patientId) found.patient = 'Please select a patient.'
    if (patientId && !woundId) found.wound = 'Please select a wound.'
    if (!capturedAt) found.date = 'Please choose the date the photo was taken.'
    setErrors(found)
    return Object.keys(found).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitError('')
    if (!validate()) return

    try {
      setStep('uploading')
      const saved = await api.uploadImage(woundId, {
        file,
        captured_at: capturedAt,
        note,
      })
      setStep('analysing')
      await api.analyzeImage(saved.id)
      
      navigate(`/wounds/${woundId}/results/${saved.id}`)
    } catch (err) {
      setSubmitError(err.message)
      setStep('idle')
    }
  }

  return (
    <div>
      <PageHeader
        title="New Analysis"
        subtitle="Upload a wound image for AI-assisted analysis"
      />

      {isMock && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <FlaskConical className="mt-0.5 h-5 w-5 shrink-0" />
          <p>
            <b>Demo mode.</b> Image quality is measured from your photo in the
            browser. The segmentation outline is a <b>simulated</b> oval, not AI
            output, because no real model is connected yet. Use only public or
            de-identified images.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-5">
        <Card title="1. Wound image" className="lg:col-span-3">
          <FileDropzone
            file={file}
            previewUrl={previewUrl}
            onFile={(f) => {
              setFile(f)
              setSubmitError('')
              setErrors((prev) => ({ ...prev, file: '' }))
            }}
            onRemove={() => {
              setFile(null)
              setSubmitError('')
            }}
            error={fileError || errors.file}
            onError={setFileError}
            disabled={busy}
          />

          <div className="mt-4 flex items-start gap-2 rounded-lg bg-ww-bg p-3 text-xs text-ww-muted">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-ww-teal" />
            <p>
              Tips for comparable photos: use good, even light; keep the camera
              the same distance each time; hold it steady and in focus; keep the
              whole wound in frame.
            </p>
          </div>
        </Card>

        <Card title="2. Details" className="lg:col-span-2">
          <div className="space-y-4">
            <FormField label="Patient" error={errors.patient}>
              <select
                value={patientId}
                onChange={handlePatientChange}
                disabled={busy || patients.loading}
                className={inputClass}
              >
                <option value="">
                  {patients.loading ? 'Loading patients...' : 'Select a patient'}
                </option>
                {patients.data?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </FormField>
            {patients.error && (
              <p className="text-sm text-red-600">{patients.error}</p>
            )}

            <FormField label="Wound" error={errors.wound}>
              <select
                value={woundId}
                onChange={(e) => {
                  setWoundId(e.target.value)
                  setErrors((prev) => ({ ...prev, wound: '' }))
                }}
                disabled={busy || !patientId || patientDetail.loading}
                className={inputClass}
              >
                <option value="">
                  {!patientId
                    ? 'Select a patient first'
                    : patientDetail.loading
                      ? 'Loading wounds...'
                      : 'Select a wound'}
                </option>
                {wounds.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.wound_location}
                  </option>
                ))}
              </select>
            </FormField>
            {patientId && !patientDetail.loading && wounds.length === 0 && (
              <p className="text-sm text-ww-muted">
                This patient has no wounds yet.{' '}
                <Link
                  to={`/patients/${patientId}`}
                  className="font-medium text-ww-teal hover:underline"
                >
                  Add a wound first
                </Link>
                .
              </p>
            )}

            <FormField label="Date photo was taken" error={errors.date}>
              <input
                type="date"
                value={capturedAt}
                max={today()}
                onChange={(e) => setCapturedAt(e.target.value)}
                disabled={busy}
                className={inputClass}
              />
            </FormField>

            <FormField label="Note" optional>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                disabled={busy}
                placeholder="e.g. Taken near a window, about 20 cm away"
                className={inputClass}
              />
            </FormField>
          </div>
        </Card>

        <div className="lg:col-span-5">
          {submitError && (
            <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-medium">Could not analyse this image</p>
                <p className="mt-1">{submitError}</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ww-teal px-5 py-3 text-sm font-medium text-white hover:bg-ww-teal-dark disabled:opacity-70 sm:w-auto"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImagePlus className="h-4 w-4" />
            )}
            {step === 'uploading' && 'Uploading image...'}
            {step === 'analysing' && 'Analysing image...'}
            {step === 'idle' && 'Upload and analyse'}
          </button>
        </div>
      </form>
    </div>
  )
}