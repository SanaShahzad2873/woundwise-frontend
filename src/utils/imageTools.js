// Image helpers used by the MOCK service only.
// In real mode, the backend (AI team) does quality checks and segmentation.

export function loadImageFromUrl(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Could not read this image file.'))
    img.src = url
  })
}

export async function loadImageFromFile(file) {
  const url = URL.createObjectURL(file)
  try {
    return await loadImageFromUrl(url)
  } finally {
    URL.revokeObjectURL(url)
  }
}

// Draws an image (or canvas) onto a new canvas that is at most maxWidth wide.
export function scaleToCanvas(source, maxWidth) {
  const srcW = source.naturalWidth || source.width
  const srcH = source.naturalHeight || source.height
  const scale = Math.min(1, maxWidth / srcW)
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(srcW * scale)
  canvas.height = Math.round(srcH * scale)
  canvas.getContext('2d').drawImage(source, 0, 0, canvas.width, canvas.height)
  return canvas
}

// REAL measurement of blur and brightness from the photo's pixels.
// These cut-offs are rough prototype values, not clinically validated.
export function assessQuality(canvas, originalWidth, originalHeight) {
  const small = scaleToCanvas(canvas, 400)
  const w = small.width
  const h = small.height
  const data = small.getContext('2d').getImageData(0, 0, w, h).data

  // Convert to grey and find the average brightness.
  const gray = new Float32Array(w * h)
  let sum = 0
  for (let i = 0; i < w * h; i++) {
    const g = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2]
    gray[i] = g
    sum += g
  }
  const brightness = sum / (w * h)

  // Sharpness: variance of the Laplacian. Low value = blurry.
  let lapSum = 0
  let lapSumSq = 0
  let count = 0
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x
      const lap =
        4 * gray[i] - gray[i - 1] - gray[i + 1] - gray[i - w] - gray[i + w]
      lapSum += lap
      lapSumSq += lap * lap
      count++
    }
  }
  const mean = lapSum / count
  const blur = lapSumSq / count - mean * mean

  const issues = []
  let rank = 0 // 0 good, 1 fair, 2 poor
  const flag = (level, text) => {
    issues.push(text)
    rank = Math.max(rank, level)
  }

  if (Math.min(originalWidth, originalHeight) < 200) {
    flag(2, 'Image is too small (shorter side must be at least 200 px)')
  }
  if (blur < 8) flag(2, 'Image is too blurry')
  else if (blur < 25) flag(1, 'Image is slightly blurry')

  if (brightness < 40) flag(2, 'Lighting is too dark')
  else if (brightness < 70) flag(1, 'Lighting is slightly dark')
  else if (brightness > 235) flag(2, 'Image is overexposed')
  else if (brightness > 215) flag(1, 'Lighting is slightly bright')

  return {
    status: ['good', 'fair', 'poor'][rank],
    blur_score: Number(blur.toFixed(1)),
    brightness: Math.round(brightness),
    issues,
  }
}

// SIMULATED segmentation: a fixed oval in the middle. NOT AI output.
export function drawSimulatedOverlay(sourceCanvas) {
  const w = sourceCanvas.width
  const h = sourceCanvas.height
  const rx = w * 0.16
  const ry = h * 0.12

  const overlay = document.createElement('canvas')
  overlay.width = w
  overlay.height = h
  const ctx = overlay.getContext('2d')
  ctx.drawImage(sourceCanvas, 0, 0)

  ctx.beginPath()
  ctx.ellipse(w / 2, h / 2, rx, ry, 0, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(45, 212, 191, 0.45)'
  ctx.fill()
  ctx.lineWidth = Math.max(3, w * 0.006)
  ctx.strokeStyle = '#5eead4'
  ctx.stroke()

  ctx.font = `${Math.max(14, Math.round(w * 0.028))}px sans-serif`
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)'
  ctx.shadowBlur = 4
  ctx.fillText('SIMULATED OVERLAY - not AI output', 16, h - 16)

  const mask = document.createElement('canvas')
  mask.width = w
  mask.height = h
  const mctx = mask.getContext('2d')
  mctx.fillStyle = '#000'
  mctx.fillRect(0, 0, w, h)
  mctx.beginPath()
  mctx.ellipse(w / 2, h / 2, rx, ry, 0, 0, Math.PI * 2)
  mctx.fillStyle = '#fff'
  mctx.fill()

  return {
    overlayUrl: overlay.toDataURL('image/jpeg', 0.85),
    maskUrl: mask.toDataURL('image/png'),
    pixelArea: Math.round(Math.PI * rx * ry),
    width: w,
    height: h,
  }
}