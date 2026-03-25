const TRIP_SUBMIT_URL = ''

// Temporary mock toggle (set to false when backend is ready)
const USE_MOCK = true

import { useRouteStore } from '../components/zustand/store.js'
import timeStringToTimestamp from '../components/map/utils/timeStringToTimestamp.js'
import { decodePolyline } from '../components/map/utils/polyline.js'

function clamp01(n) {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(1, n))
}

function extractSteps(routeResponse) {
  const routes = routeResponse?.routes
  if (!Array.isArray(routes)) return []

  const steps = routes.flatMap((route) => {
    const legs = route?.legs
    if (!Array.isArray(legs)) return []
    return legs.flatMap((leg) => (Array.isArray(leg?.steps) ? leg.steps : []))
  })

  return steps
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

function buildMockCoordinatesFromSteps(steps = []) {
  if (!Array.isArray(steps) || steps.length === 0) return []
  const coords = []

  for (const step of steps) {
    const points = step?.polyline?.points
    if (typeof points !== 'string') continue
    const decoded = decodePolyline(points)
    if (decoded.length === 0) continue
    coords.push(...decoded)
  }

  return coords
}

async function mockSubmitTripDetails(payload) {
  // Simulate network latency (500-1000ms).
  const delayMs = 500 + Math.floor(Math.random() * 501)
  await new Promise((r) => setTimeout(r, delayMs))

  const coordinates =
    Array.isArray(payload?.coordinates) && payload.coordinates.length > 0
      ? payload.coordinates
      : buildMockCoordinatesFromSteps(payload?.steps)
  const segments = buildMockSegments(coordinates)
  return { segments }
}

/* global google */

function fetchGoogleRoute() {
  const { origin, destination, departureTime } = useRouteStore.getState()

  if (!origin || !destination || !departureTime) {
    return Promise.reject(new Error('Missing route data'))
  }

  const timestamp = timeStringToTimestamp(departureTime)

  const directionsService = new google.maps.DirectionsService()

  return new Promise((resolve, reject) => {
    directionsService.route(
      {
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
        drivingOptions: {
          departureTime: timestamp,
        },
      },
      (res, status) => {
        if (status !== 'OK') return reject(new Error('Directions request failed: ' + status))
        return resolve(res)
      },
    )
  })
}

async function realSubmitTripDetails(_payload) {
  void _payload
  const { departureTime } = useRouteStore.getState()

  const routeResponse = await fetchGoogleRoute()
  const steps = extractSteps(routeResponse)

  const response = await fetch(TRIP_SUBMIT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      steps,
      departureTime,
    }),
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
