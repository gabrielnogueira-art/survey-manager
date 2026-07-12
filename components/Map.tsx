"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet's default icon path issues in Next.js
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

type Unit = {
  id: string;
  propertyName: string;
  address: string;
  lat: number;
  lng: number;
  status: string;
};

function MapBoundsUpdater({ units }: { units: Unit[] }) {
  const map = useMap();
  useEffect(() => {
    if (units.length > 0) {
      const bounds = L.latLngBounds(units.map(u => [u.lat, u.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [units, map]);
  return null;
}

export default function Map({ units }: { units: Unit[] }) {
  return (
    <div style={{ height: "400px", width: "100%", borderRadius: "1rem", overflow: "hidden" }}>
      <MapContainer 
        center={[-23.5505, -46.6333]} // Fallback center
        zoom={10} 
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapBoundsUpdater units={units} />
        {units.map((unit) => (
          <Marker key={unit.id} position={[unit.lat, unit.lng]} icon={icon}>
            <Popup>
              <strong>{unit.propertyName}</strong><br />
              {unit.address}<br />
              Status: {unit.status}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
