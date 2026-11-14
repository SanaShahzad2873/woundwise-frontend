// MOCK upload + analysis. Nothing leaves your computer.
import { wounds, images, notes } from './mockData'
import {
  loadImageFromFile,
  loadImageFromUrl,
  scaleToCanvas,
  assessQuality,
  drawSimulatedOverlay,
} from '../utils/imageTools'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// POST /api/wounds/{wound_id}/images
export async function uploadImage(woundId, { file, captured_at, note }) {
  await delay(600)
  if (!wounds.find((w) => w.id === woundId)) throw new Error('Wound not found')

  const img = await loadImageFromFile(file)
  const canvas = scaleToCanvas(img, 800)
  const quality = assessQuality(canvas, img.naturalWidth, img.naturalHeight)

  if (quality.status === 'poor') {
    throw new Error(
      `This image is not suitable for analysis. ${quality.issues.join('. ')}. ` +
        'Please capture another image from a consistent distance in good light.',
    )
  }

  const when = captured_at
    ? `${captured_at}T12:00:00Z`
    : new Date().toISOString()

  const record = {
    id: `img${images.length + 1}`,
    wound_id: woundId,
    image_url: canvas.toDataURL('image/jpeg', 0.85),
    captured_at: when,
    created_at: new Date().toISOString(),
    image_quality: quality,
    analysis: null,
  }
  images.push(record)

  if (note && note.trim()) {
    notes.push({
      id: `n${notes.length + 1}`,
      wound_id: woundId,
      author_id: 'demo-user',
      note: note.trim(),
      created_at: new Date().toISOString(),
    })
  }
  return record
}

// POST /api/analyze/{image_id}
export async function analyzeImage(imageId) {
  await delay(1200)
  const record = images.find((i) => i.id === imageId)
  if (!record) throw new Error('Image not found')

  const img = await loadImageFromUrl(record.image_url)
  const canvas = scaleToCanvas(img, 800)
  const sim = drawSimulatedOverlay(canvas)

  record.analysis = {
    id: `an${imageId}`,
    image_id: imageId,
    model_version: 'MOCK-DEMO-v0 (not a real model)',
    overlay_url: sim.overlayUrl,
    mask_url: sim.maskUrl,
    pixel_area: sim.pixelArea,
    image_width: sim.width,
    image_height: sim.height,
    image_area_ratio: Number((sim.pixelArea / (sim.width * sim.height)).toFixed(4)),
    confidence: null,
    analysis_status: 'completed',
    created_at: new Date().toISOString(),
  }
  return record.analysis
}