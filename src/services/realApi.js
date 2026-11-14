// REAL API: talks to the FastAPI backend. Same function names as mockApi.js.
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function request(path, options = {}) {
  let response
  try {
    response = await fetch(`${BASE}${path}`, options)
  } catch {
    throw new Error('Cannot reach the server. Is the backend running?')
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`
    try {
      const body = await response.json()
      if (typeof body.detail === 'string') message = body.detail
    } catch {
      // the error body was not JSON; keep the default message
    }
    throw new Error(message)
  }
  return response.json()
}

const sendJson = (method, body) => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

export const getPatients = () => request('/api/patients')
export const getPatient = (id) => request(`/api/patients/${id}`)
export const createPatient = (data) => request('/api/patients', sendJson('POST', data))
export const createWound = (data) => request('/api/wounds', sendJson('POST', data))
export const getWounds = () => request('/api/wounds') // proposed addition
export const getWound = (id) => request(`/api/wounds/${id}`)
export const getAnalysis = (id) => request(`/api/analyses/${id}`)
export const getProgress = (woundId) => request(`/api/wounds/${woundId}/progress`)
export const addNote = (woundId, data) =>
  request(`/api/wounds/${woundId}/notes`, sendJson('POST', data))
export const uploadImage = (woundId, { file, captured_at, note }) => {
  const form = new FormData()
  form.append('file', file)
  if (captured_at) form.append('captured_at', captured_at)
  if (note) form.append('note', note)
  return request(`/api/wounds/${woundId}/images`, { method: 'POST', body: form })
}

export const analyzeImage = (imageId) =>
  request(`/api/analyze/${imageId}`, { method: 'POST' })