import { Polyline } from '@react-google-maps/api';
const DEFAULT_WEIGHT = 4;

function getRiskColor(risk) {
  const r = typeof risk === 'number' ? risk : Number(risk);
  if (!Number.isFinite(r)) return 'red';
  if (r < 0.3) return 'green';
  if (r < 0.6) return 'orange';
  return 'red';
}

export default function RouteLayer({ segments = [] }) {
  const renderSegments = Array.isArray(segments)
    ? segments.filter((segment) => Array.isArray(segment?.coords) && segment.coords.length > 0)
    : [];

  return (
    <>
      {renderSegments.map((segment, idx) => (
        <Polyline
          key={idx}
          path={segment.coords}
          options={{
            strokeColor: getRiskColor(segment.risk),
            strokeWeight: DEFAULT_WEIGHT,
          }}
        />
      ))}
    </>
  );
}

