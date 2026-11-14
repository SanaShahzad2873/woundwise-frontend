// MOCK DATA: fake records for development only.
// The images are drawn illustrations, NOT real photos and NOT real AI output.

const W = 800
const H = 600

function svgToUri(svg) {
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}

// A drawn "skin photo" with a reddish wound-shaped blob.
function originalSvg(rx, ry, tone) {
  return svgToUri(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs><radialGradient id="skin" cx="50%" cy="45%" r="75%">
<stop offset="0%" stop-color="${tone}"/><stop offset="100%" stop-color="#b98466"/>
</radialGradient></defs>
<rect width="${W}" height="${H}" fill="url(#skin)"/>
<ellipse cx="400" cy="300" rx="${rx + 14}" ry="${ry + 14}" fill="#d9907a" opacity="0.7"/>
<ellipse cx="400" cy="300" rx="${rx}" ry="${ry}" fill="#8f2f2f"/>
<ellipse cx="385" cy="290" rx="${rx * 0.5}" ry="${ry * 0.45}" fill="#b04a4a"/>
<text x="20" y="580" font-size="22" fill="#ffffff" opacity="0.85" font-family="sans-serif">DEMO ILLUSTRATION - not a real photo</text>
</svg>`)
}

// The same picture with a mint "segmentation" outline on top.
function overlaySvg(rx, ry, tone) {
  return svgToUri(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs><radialGradient id="skin" cx="50%" cy="45%" r="75%">
<stop offset="0%" stop-color="${tone}"/><stop offset="100%" stop-color="#b98466"/>
</radialGradient></defs>
<rect width="${W}" height="${H}" fill="url(#skin)"/>
<ellipse cx="400" cy="300" rx="${rx + 14}" ry="${ry + 14}" fill="#d9907a" opacity="0.7"/>
<ellipse cx="400" cy="300" rx="${rx}" ry="${ry}" fill="#8f2f2f"/>
<ellipse cx="385" cy="290" rx="${rx * 0.5}" ry="${ry * 0.45}" fill="#b04a4a"/>
<ellipse cx="400" cy="300" rx="${rx}" ry="${ry}" fill="#2dd4bf" fill-opacity="0.45" stroke="#5eead4" stroke-width="5"/>
<text x="20" y="580" font-size="22" fill="#ffffff" opacity="0.85" font-family="sans-serif">DEMO OVERLAY - not real AI output</text>
</svg>`)
}

// Black and white mask picture.
function maskSvg(rx, ry) {
  return svgToUri(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<rect width="${W}" height="${H}" fill="#000"/>
<ellipse cx="400" cy="300" rx="${rx}" ry="${ry}" fill="#fff"/>
</svg>`)
}

const goodQuality = {
  status: 'good',
  blur_score: 182.4,
  brightness: 128,
  issues: [],
}
const fairQuality = {
  status: 'fair',
  blur_score: 95.1,
  brightness: 62,
  issues: ['Lighting is slightly dark'],
}

// Builds one image record plus its analysis.
function buildImage(n, woundId, date, rx, tone, quality) {
  const ry = Math.round(rx * 0.75)
  const pixelArea = Math.round(Math.PI * rx * ry)
  const when = `${date}T09:30:00Z`
  return {
    id: `img${n}`,
    wound_id: woundId,
    image_url: originalSvg(rx, ry, tone),
    captured_at: when,
    created_at: when,
    image_quality: quality,
    analysis: {
      id: `an${n}`,
      image_id: `img${n}`,
      model_version: 'MOCK-DEMO-v0 (not a real model)',
      overlay_url: overlaySvg(rx, ry, tone),
      mask_url: maskSvg(rx, ry),
      pixel_area: pixelArea,
      image_width: W,
      image_height: H,
      image_area_ratio: Number((pixelArea / (W * H)).toFixed(4)),
      confidence: null,
      analysis_status: 'completed',
      created_at: when,
    },
  }
}

export const patients = [
  { id: 'p1', name: 'Demo Patient A', age: 58, created_at: '2026-10-20T08:00:00Z' },
  { id: 'p2', name: 'Demo Patient B', age: 44, created_at: '2026-10-28T08:00:00Z' },
  { id: 'p3', name: 'Demo Patient C', age: 67, created_at: '2026-11-10T08:00:00Z' },
]

export const wounds = [
  {
    id: 'w1',
    patient_id: 'p1',
    wound_location: 'Left foot, plantar surface',
    wound_category: 'Foot ulcer',
    description: 'Demo record for presentation purposes.',
    created_at: '2026-10-23T08:00:00Z',
  },
  {
    id: 'w2',
    patient_id: 'p2',
    wound_location: 'Right forearm',
    wound_category: 'Surgical wound',
    description: 'Demo record for presentation purposes.',
    created_at: '2026-11-01T08:00:00Z',
  },
  {
    id: 'w3',
    patient_id: 'p3',
    wound_location: 'Left lower leg',
    wound_category: 'Pressure injury',
    description: 'Demo record with only one image.',
    created_at: '2026-11-12T08:00:00Z',
  },
]

export const images = [
  buildImage(1, 'w1', '2026-10-23', 170, '#d4a284', goodQuality),
  buildImage(2, 'w1', '2026-10-30', 140, '#d4a284', goodQuality),
  buildImage(3, 'w1', '2026-11-06', 110, '#d8a98c', fairQuality),
  buildImage(4, 'w1', '2026-11-12', 85, '#d8a98c', goodQuality),
  buildImage(5, 'w2', '2026-11-01', 90, '#cf9b7c', goodQuality),
  buildImage(6, 'w2', '2026-11-08', 80, '#cf9b7c', goodQuality),
  buildImage(7, 'w2', '2026-11-13', 86, '#cf9b7c', goodQuality),
  buildImage(8, 'w3', '2026-11-12', 60, '#c99577', goodQuality),
]

export const notes = [
  {
    id: 'n1',
    wound_id: 'w1',
    author_id: 'demo-user',
    note: 'Photo taken near a window, about 20 cm from the wound.',
    created_at: '2026-10-30T09:35:00Z',
  },
  {
    id: 'n2',
    wound_id: 'w1',
    author_id: 'demo-user',
    note: 'Lighting was dimmer than usual for this photo.',
    created_at: '2026-11-06T09:35:00Z',
  },
]