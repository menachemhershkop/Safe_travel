const TRIP_SUBMIT_URL = ''

export async function submitTripDetails(payload) {  
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
