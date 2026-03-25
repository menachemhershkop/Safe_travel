
import { useRouteStore } from "../../zustand/store.js";
import { decodePolyline } from "../utils/polyline";
import timeStringToTimestamp from "../utils/timeStringToTimestamp";

/* global google */

export async function fetchRoute() {
  const { origin, destination, departureTime } = useRouteStore.getState();

  return new Promise((resolve, reject) => {
    if (!origin || !destination || !departureTime) {
      return reject(new Error("Missing route data"));
    }
    const timestamp = timeStringToTimestamp(departureTime);

    const directionsService = new google.maps.DirectionsService();

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
        if (status !== "OK") {
          return reject(new Error("Directions request failed: " + status));
        }

        const coordinates = decodePolyline(res.routes[0].overview_polyline);
        const confines = [res.routes[0].legs[0].end_location, res.routes[0].legs[0].start_location]

        resolve({ coordinates, confines });
      }
    );
  });
}