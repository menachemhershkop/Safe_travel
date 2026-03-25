import { useEffect, useMemo, useRef, useState } from 'react'
import './TripForm.css'
import { searchIsraeliAddresses } from '../functions/addressService'
import { debounce } from '../functions/debounce'
import { useRouteStore } from './zustand/store.js'
import { useMapRoute } from './map/hooks/useMapRoute'
// זה השינוי האחרון 
function TripForm() {
  const [selectedOrigin, setSelectedOrigin] = useState(null)
  const [selectedDestination, setSelectedDestination] = useState(null)
  const [originSuggestions, setOriginSuggestions] = useState([])
  const [destinationSuggestions, setDestinationSuggestions] = useState([])
  const [isOriginLoading, setIsOriginLoading] = useState(false)
  const [isDestinationLoading, setIsDestinationLoading] = useState(false)
  const [openField, setOpenField] = useState(null)
  const [submitMessage, setSubmitMessage] = useState('')
  const [submitError, setSubmitError] = useState('')
  const originRef = useRef('')
  const destinationRef = useRef('')

  const { origin, destination, departureTime, isSubmitting, setIsSubmitting, setOrigin, setDestination, setDepartureTime } = useRouteStore()

  const { loadRoute } = useMapRoute();

  originRef.current = origin
  destinationRef.current = destination

  const debouncedOriginSearch = useMemo(
    () =>
      debounce(async (query) => {
        const results = await searchIsraeliAddresses(query)

        if (originRef.current.trim() === query) {
          setOriginSuggestions(results)
          setIsOriginLoading(false)
        }
      }, 350),
    [],
  )

  const debouncedDestinationSearch = useMemo(
    () =>
      debounce(async (query) => {
        const results = await searchIsraeliAddresses(query)

        if (destinationRef.current.trim() === query) {
          setDestinationSuggestions(results)
          setIsDestinationLoading(false)
        }
      }, 350),
    [],
  )

  useEffect(() => {
    const query = origin.trim()

    if (query.length < 2) {
      setOriginSuggestions([])
      setIsOriginLoading(false)
      return
    }

    setIsOriginLoading(true)
    debouncedOriginSearch(query)
  }, [origin, debouncedOriginSearch])

  useEffect(() => {
    const query = destination.trim()

    if (query.length < 2) {
      setDestinationSuggestions([])
      setIsDestinationLoading(false)
      return
    }

    setIsDestinationLoading(true)
    debouncedDestinationSearch(query)
  }, [destination, debouncedDestinationSearch])

  useEffect(
    () => () => {
      debouncedOriginSearch.cancel()
      debouncedDestinationSearch.cancel()
    },
    [debouncedOriginSearch, debouncedDestinationSearch],
  )

  const selectOrigin = (suggestion) => {
    setOrigin(suggestion.label)
    setSelectedOrigin(suggestion)
    setOriginSuggestions([])
    setOpenField(null)
  }

  const selectDestination = (suggestion) => {
    setDestination(suggestion.label)
    setSelectedDestination(suggestion)
    setDestinationSuggestions([])
    setOpenField(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitMessage('')
    setSubmitError('')

    const trimmedOrigin = origin.trim()
    const trimmedDestination = destination.trim()

    if (!trimmedOrigin || !trimmedDestination || !departureTime) {
      setSubmitError('יש למלא מוצא, יעד ושעת יציאה לפני שליחה.')
      return
    }

    if (!selectedOrigin || !selectedDestination) {
      setSubmitError('כדי לשלוח למפה, יש לבחור מוצא ויעד מתוך רשימת ההצעות.')
      return
    }

    const originLat = Number(selectedOrigin.lat)
    const originLon = Number(selectedOrigin.lon)
    const destinationLat = Number(selectedDestination.lat)
    const destinationLon = Number(selectedDestination.lon)

    if (
      !Number.isFinite(originLat) ||
      !Number.isFinite(originLon) ||
      !Number.isFinite(destinationLat) ||
      !Number.isFinite(destinationLon)
    ) {
      setSubmitError('חסרים נתוני מפה תקינים (lat/lon). בחר מחדש כתובות מהרשימה.')
      return
    }

    setIsSubmitting(true)

    try {
      await loadRoute()
      setSubmitMessage('הפרטים נשלחו בהצלחה.')
    } catch (error) {
      setSubmitError(error.message || 'שליחה נכשלה, נסה שוב.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="trip-form-card">
      <h1>תכנון נסיעה</h1>

      <form className="trip-form" onSubmit={handleSubmit}>
        <label className="autocomplete-field">
          מוצא
          <input
            type="text"
            value={origin}
            onChange={(event) => {
              setOrigin(event.target.value)
              setSelectedOrigin(null)
            }}
            onFocus={() => setOpenField('origin')}
            onBlur={() => setTimeout(() => setOpenField(null), 120)}
            placeholder="לדוגמה: תל אביב"
          />
          {openField === 'origin' && (isOriginLoading || originSuggestions.length > 0) ? (
            <ul className="suggestions-list">
              {isOriginLoading ? <li className="suggestion-status">טוען הצעות...</li> : null}
              {!isOriginLoading
                ? originSuggestions.map((suggestion) => (
                  <li key={suggestion.id}>
                    <button
                      type="button"
                      className="suggestion-button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => selectOrigin(suggestion)}
                    >
                      {suggestion.label}
                    </button>
                  </li>
                ))
                : null}
            </ul>
          ) : null}
        </label>

        <label className="autocomplete-field">
          יעד
          <input
            type="text"
            value={destination}
            onChange={(event) => {
              setDestination(event.target.value)
              setSelectedDestination(null)
            }}
            onFocus={() => setOpenField('destination')}
            onBlur={() => setTimeout(() => setOpenField(null), 120)}
            placeholder="לדוגמה: ירושלים"
          />
          {openField === 'destination' &&
            (isDestinationLoading || destinationSuggestions.length > 0) ? (
            <ul className="suggestions-list">
              {isDestinationLoading ? (
                <li className="suggestion-status">טוען הצעות...</li>
              ) : null}
              {!isDestinationLoading
                ? destinationSuggestions.map((suggestion) => (
                  <li key={suggestion.id}>
                    <button
                      type="button"
                      className="suggestion-button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => selectDestination(suggestion)}
                    >
                      {suggestion.label}
                    </button>
                  </li>
                ))
                : null}
            </ul>
          ) : null}
        </label>

        <label>
          שעת יציאה
          <input
            type="time"
            value={departureTime}
            onChange={(event) => setDepartureTime(event.target.value)}
          />
        </label>

        <button type="submit" className="submit-button" disabled={isSubmitting}>
          {isSubmitting ? 'בודק...' : 'תכנן נסיעה'}
        </button>

        {submitMessage ? <p className="submit-message success">{submitMessage}</p> : null}
        {submitError ? <p className="submit-message error">{submitError}</p> : null}
      </form>
    </section>
  )
}

export default TripForm
