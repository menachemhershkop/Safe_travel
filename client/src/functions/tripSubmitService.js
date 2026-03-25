const TRIP_SUBMIT_URL = ''

// Temporary mock toggle (set to false when backend is ready)
const USE_MOCK = true

function clamp01(n) {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(1, n))
}

function buildMockSegments(coordinates = []) {
  if (!Array.isArray(coordinates)) return []
  if (coordinates.length < 2) return []

  const segments = []

  // Create a simple gradient "risk zones" along the route length.
  // risk: 0.05..0.95 with some deterministic variation.
  const denom = Math.max(1, coordinates.length - 2)
  for (let i = 0; i < coordinates.length - 1; i += 1) {
    const a = coordinates[i]
    const b = coordinates[i + 1]
    if (!a || !b) continue

    const t = denom === 0 ? 0 : i / denom
    const base = 0.05 + 0.9 * t
    const wave = 0.1 * Math.sin(t * Math.PI * 4) // deterministic wave
    const risk = clamp01(base + wave)

    segments.push({
      coords: [a, b],
      risk,
    })
  }

  return segments
}

async function mockSubmitTripDetails(payload) {
  // Simulate network latency (500-1000ms).
  const delayMs = 500 + Math.floor(Math.random() * 501)
  await new Promise((r) => setTimeout(r, delayMs))

  const coordinates = payload?.coordinates
  const segments = buildMockSegments(coordinates)
  return { segments }
}

async function realSubmitTripDetails(payload) {
  if (!TRIP_SUBMIT_URL) {
    throw new Error('יש להגדיר URL בקובץ tripSubmitService.js לפני שליחה לשרת.')
  }

  const response = await fetch(TRIP_SUBMIT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`השרת החזיר שגיאה: ${response.status}`)
  }

  return response.json().catch(() => null)
}

export async function submitTripDetails(payload) {
  if (USE_MOCK) return mockSubmitTripDetails(payload)
  return realSubmitTripDetails(payload)
}
