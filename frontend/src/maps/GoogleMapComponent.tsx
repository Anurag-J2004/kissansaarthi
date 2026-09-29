import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet';

// Fix Leaflet default icon paths broken by bundlers
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  risk: string;
}

interface Props {
  locations: Location[];
  center?: [number, number];
  zoom?: number;
}

const RISK_COLOR: Record<string, string> = {
  HIGH:     '#DC2626',
  MODERATE: '#F59E0B',
  LOW:      '#16A34A',
};

const RISK_FILL: Record<string, string> = {
  HIGH:     '#FEE2E2',
  MODERATE: '#FEF9C3',
  LOW:      '#DCFCE7',
};

const PanchayatMap = ({ locations, center = [18.510, 74.010], zoom = 11 }: Props) => {
  return (
    <MapContainer
      key={`${center[0]}-${center[1]}`}
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%', minHeight: '300px', zIndex: 0, position: 'relative' }}
      scrollWheelZoom={true}
    >
      {/* Free OpenStreetMap tiles — no API key needed */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {locations.map((loc) => (
        <CircleMarker
          key={loc.id}
          center={[loc.lat, loc.lng]}
          radius={20}
          pathOptions={{
            color:       RISK_COLOR[loc.risk] ?? '#6B7280',
            fillColor:   RISK_FILL[loc.risk]  ?? '#F3F4F6',
            fillOpacity: 0.85,
            weight:      2.5,
          }}
        >
          <Tooltip permanent direction="top" offset={[0, -16]}>
            <span style={{ fontWeight: 700, fontSize: 11 }}>{loc.name}</span>
          </Tooltip>
          <Popup>
            <div style={{ minWidth: 140 }}>
              <p style={{ fontWeight: 700, marginBottom: 4 }}>{loc.name}</p>
              <p>Risk: <strong style={{ color: RISK_COLOR[loc.risk] }}>{loc.risk}</strong></p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
};

export default PanchayatMap;
