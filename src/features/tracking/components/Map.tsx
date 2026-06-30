"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icon asset issue in Next.js
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

interface Coords {
  lat: number;
  lng: number;
}

interface MapProps {
  coordinates: Coords[];
}

// Helper component to center map on coordinates change
function RecenterMap({ coords }: { coords: Coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.setView([coords.lat, coords.lng], 16);
    }
  }, [coords, map]);
  return null;
}

export default function Map({ coordinates }: MapProps) {
  const hasCoords = coordinates.length > 0;
  const currentCenter: [number, number] = hasCoords
    ? [coordinates[coordinates.length - 1].lat, coordinates[coordinates.length - 1].lng]
    : [-6.2088, 106.8456]; // Default to Jakarta center

  const polylinePositions = coordinates.map((c) => [c.lat, c.lng] as [number, number]);

  return (
    <div className="w-full h-[300px] md:h-[400px] rounded-lg overflow-hidden border border-slate-200 shadow-sm relative z-0">
      <MapContainer
        center={currentCenter}
        zoom={hasCoords ? 16 : 12}
        scrollWheelZoom={true}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {polylinePositions.length > 0 && (
          <Polyline positions={polylinePositions} color="#ef4444" weight={4} />
        )}

        {hasCoords && (
          <>
            {/* Start point marker */}
            <Marker position={[coordinates[0].lat, coordinates[0].lng]}>
              <RecenterMap coords={coordinates[coordinates.length - 1]} />
            </Marker>
            {/* Current point marker if path has multiple points */}
            {coordinates.length > 1 && (
              <Marker
                position={[
                  coordinates[coordinates.length - 1].lat,
                  coordinates[coordinates.length - 1].lng,
                ]}
              />
            )}
          </>
        )}
      </MapContainer>
    </div>
  );
}
