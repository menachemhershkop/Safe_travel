import { useEffect, useMemo, useRef, useState } from 'react'
import './TripForm.css'
import { searchIsraeliAddresses } from '../functions/addressService'
import { debounce } from '../functions/debounce'

function TripForm() {
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [departureTime, setDepartureTime] = useState('')
  const [originSuggestions, setOriginSuggestions] = useState([])
  const [destinationSuggestions, setDestinationSuggestions] = useState([])
  const [isOriginLoading, setIsOriginLoading] = useState(false)
  const [isDestinationLoading, setIsDestinationLoading] = useState(false)
  const [openField, setOpenField] = useState(null)
  const originRef = useRef('')
  const destinationRef = useRef('')

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
    console.log(suggestion);
    setOrigin(suggestion.label)
    setOriginSuggestions([])
    setOpenField(null)
  }

  const selectDestination = (suggestion) => {
    console.log(suggestion);
    setDestination(suggestion.label)
    setDestinationSuggestions([])
    setOpenField(null)
  }

  return (
    <section className="trip-form-card">
      <h1>נסיעה חדשה</h1>

      <form className="trip-form" onSubmit={(event) => event.preventDefault()}>
        <label className="autocomplete-field">
          מוצא
          <input
            type="text"
            value={origin}
            onChange={(event) => setOrigin(event.target.value)}
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
            onChange={(event) => setDestination(event.target.value)}
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
      </form>
    </section>
  )
}

export default TripForm
