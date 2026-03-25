import { GoogleMap } from '@react-google-maps/api';

import RouteLayer from './RouteLayer.jsx';
import { useRouteStore } from '../../zustand/store.js';

const ISRAEL_CENTER = { lat: 32.0853, lng: 34.7818 };
const ZOOM = 10;

const containerStyle = {
  width: '100%',
  height: '520px'
};

export default function MapView() {
  const segments = useRouteStore((s) => s.segments);
  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={ISRAEL_CENTER}
      zoom={ZOOM}
    >
      <RouteLayer segments={segments} />
    </GoogleMap>
  );
}

