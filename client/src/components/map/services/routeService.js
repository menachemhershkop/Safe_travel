// const MOCK_ROUTE_COORDINATES = [
//   { lat: 32.0853, lng: 34.7818 }, // center of Israel
//   { lat: 32.045, lng: 34.765 },
//   { lat: 31.994, lng: 34.805 },
//   { lat: 31.976, lng: 34.848 },
//   { lat: 32.015, lng: 34.885 },
// ];
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

        const coordinates = decodePolyline(res.routes[0].overview_polyline.points);

        resolve(coordinates);
      }
    );
  });
}