// import { useEffect, useState } from 'react';
// import { fetchRoute } from '../services/routeService.js';
// import { decodePolyline } from '../utils/polyline.js';

// export function useMapRoute() {
//   const [coordinates, setCoordinates] = useState([]);
//   useEffect(() => {
//     let cancelled = false;

//     async function load() {
//       const route = await fetchRoute();

//       // Current contract: mock route coordinates.
//       if (route?.coordinates && Array.isArray(route.coordinates)) {
//         if (!cancelled) setCoordinates(route.coordinates);
//         return;
//       }

//       // Future contract: routeService may return an encoded polyline.
//       if (route?.encodedPolyline && typeof route.encodedPolyline === 'string') {
//         if (!cancelled) setCoordinates(decodePolyline(route.encodedPolyline));
//       }
//     }

//     load();

//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   return { coordinates };
// }

import { useCallback, useState } from 'react';
import { fetchRoute } from '../services/routeService.js';
import { submitTripDetails } from '../../../functions/tripSubmitService.js';
import { useRouteStore } from '../../zustand/store.js';

export function useMapRoute() {
  const [loading, setLoading] = useState(false);
  const setSegments = useRouteStore((s) => s.setSegments);
  const setConfines = useRouteStore((s) => s.setConfines)
  function reduceCoordinates(coords, maxPoints = 200) {
    if (!Array.isArray(coords) || coords.length <= maxPoints) return coords || [];
    const lastIdx = coords.length - 1;
    const step = Math.ceil(lastIdx / (maxPoints - 1));
    const reduced = [coords[0]];
    for (let i = step; i < lastIdx; i += step) reduced.push(coords[i]);
    reduced.push(coords[lastIdx]);
    return reduced;
  }

  const loadRoute = useCallback(async function loadRoute() {
    setLoading(true);
    try {
      setSegments([]);
      const res = await fetchRoute();
      
      const { coordinates, confines } = res
      const routeCoords = coordinates
      setConfines(confines)

      if (!Array.isArray(routeCoords) || routeCoords.length === 0) {
        throw new Error('No route coordinates returned from DirectionsService');
      }

      const reducedCoords = reduceCoordinates(routeCoords);
      const response = await submitTripDetails({ coordinates: reducedCoords });
      const segments = response?.segments;
      if (!Array.isArray(segments)) {
        throw new Error('Invalid backend response: expected { segments: [...] }');
      }

      // כאן צריך לתקן: להחליף את שם השדה בהתאם למה שהשרת מחזיר (לדוגמה: response.risk / response.tripRisk / response.summary.risk)
      const tripRisk = response?.tripRisk;
      setTripRisk(tripRisk ?? null);

      setSegments(segments);
    } finally {
      setLoading(false);
    }
  }, [setSegments, setTripRisk]);

  return { loading, loadRoute };
}
