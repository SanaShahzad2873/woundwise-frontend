// MOCK API: pretends to be the backend, using fake data from mockData.js.
// Function names match the real API in realApi.js.
import { patients, wounds, images, notes } from './mockData'

const delay = (ms = 450) => new Promise((resolve) => setTimeout(resolve, ms))

function imagesForWound(woundId) {
  return images
    .filter((img) => img.wound_id === woundId)
    .sort((a, b) => new Date(a.captured_at) - new Date(b.captured_at))
}

function woundSummary(wound) {
  const imgs = imagesForWound(wound.id)
  const latest = imgs[imgs.length - 1]
  const patient = patients.find((p) => p.id === wound.patient_id)
  return {
    ...wound,
    patient_name: patient ? patient.name : 'Unknown',
    image_count: imgs.length,
    latest_captured_at: latest ? latest.captured_at : null,
    latest_pixel_area: latest && latest.analysis ? latest.analysis.pixel_area : null,
  }
}

// GET /api/patients
export async function getPatients() {
  await delay()
  return patients.map((p) => ({
    ...p,
    wound_count: wounds.filter((w) => w.patient_id === p.id).length,
  }))
}

// GET /api/patients/{patient_id}
export async function getPatient(patientId) {
  await delay()
  const patient = patients.find((p) => p.id === patientId)
  if (!patient) throw new Error('Patient not found')
  return {
    ...patient,
    wounds: wounds.filter((w) => w.patient_id === patientId).map(woundSummary),
  }
}

// POST /api/patients
export async function createPatient({ name, age }) {
  await delay()
  const patient = {
    id: `p${patients.length + 1}`,
    name,
    age: age ? Number(age) : null,
    created_at: new Date().toISOString(),
  }
  patients.push(patient)
  return patient
}

// POST /api/wounds
export async function createWound({ patient_id, wound_location, wound_category, description }) {
  await delay()
  const wound = {
    id: `w${wounds.length + 1}`,
    patient_id,
    wound_location,
    wound_category,
    description: description || '',
    created_at: new Date().toISOString(),
  }
  wounds.push(wound)
  return woundSummary(wound)
}

// GET /api/wounds   (proposed addition to the contract)
export async function getWounds() {
  await delay()
  return wounds.map(woundSummary)
}

// GET /api/wounds/{wound_id}
export async function getWound(woundId) {
  await delay()
  const wound = wounds.find((w) => w.id === woundId)
  if (!wound) throw new Error('Wound not found')
  const patient = patients.find((p) => p.id === wound.patient_id)
  return {
    ...woundSummary(wound),
    patient: { id: patient.id, name: patient.name, age: patient.age },
    images: imagesForWound(woundId),
    notes: notes.filter((n) => n.wound_id === woundId),
  }
}

// GET /api/analyses/{analysis_id}
export async function getAnalysis(analysisId) {
  await delay()
  const image = images.find((img) => img.analysis && img.analysis.id === analysisId)
  if (!image) throw new Error('Analysis not found')
  return image.analysis
}

// GET /api/wounds/{wound_id}/progress
export async function getProgress(woundId) {
  await delay()
  const wound = wounds.find((w) => w.id === woundId)
  if (!wound) throw new Error('Wound not found')

  const points = imagesForWound(woundId)
    .filter((img) => img.analysis && img.analysis.analysis_status === 'completed')
    .map((img) => ({
      image_id: img.id,
      captured_at: img.captured_at,
      image_url: img.image_url,
      overlay_url: img.analysis.overlay_url,
      pixel_area: img.analysis.pixel_area,
      image_area_ratio: img.analysis.image_area_ratio,
    }))

  let comparison = null
  if (points.length >= 2) {
    const previous = points[points.length - 2]
    const latest = points[points.length - 1]
    const change = latest.pixel_area - previous.pixel_area
    comparison = {
      previous,
      latest,
      pixel_area_change: change,
      pixel_area_change_percent: Number(((change / previous.pixel_area) * 100).toFixed(1)),
    }
  }
  return { wound_id: woundId, points, comparison }
}

// POST /api/wounds/{wound_id}/notes
export async function addNote(woundId, { note }) {
  await delay(300)
  const newNote = {
    id: `n${notes.length + 1}`,
    wound_id: woundId,
    author_id: 'demo-user',
    note,
    created_at: new Date().toISOString(),
  }
  notes.push(newNote)
  return newNote
}
export { uploadImage, analyzeImage } from './mockUpload'