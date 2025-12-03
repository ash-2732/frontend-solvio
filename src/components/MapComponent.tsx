"use client";

import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

type Marker = {
  id: string;
  position: [number, number];
  popup?: string;
  color?: "red" | "orange" | "yellow" | "green" | "blue";
};

type MapComponentProps = {
  latitude: number;
  longitude: number;
  zoom?: number;
  markers?: Marker[];
  height?: string;
  onMapClick?: (lat: number, lng: number) => void;
};

export default function MapComponent({
  latitude,
  longitude,
  zoom = 13,
  markers = [],
  height = "400px",
  onMapClick,
}: MapComponentProps) {
  const mapId = `map-${Math.random().toString(36).substring(7)}`;

  useEffect(() => {
    // Create map
    const map = L.map(mapId).setView([latitude, longitude], zoom);

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Color icon URLs
    const iconUrls: Record<string, string> = {
      red: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
      orange:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
      yellow:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png",
      green:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
      blue: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    };

    // Add markers
    markers.forEach((marker) => {
      const icon = marker.color
        ? L.icon({
            iconUrl: iconUrls[marker.color],
            shadowUrl:
              "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
          })
        : undefined;

      const leafletMarker = L.marker(marker.position, { icon }).addTo(map);

      if (marker.popup) {
        leafletMarker.bindPopup(marker.popup);
      }
    });

    // Handle map clicks
    if (onMapClick) {
      map.on("click", (e: L.LeafletMouseEvent) => {
        onMapClick(e.latlng.lat, e.latlng.lng);
      });
    }

    // Cleanup
    return () => {
      map.remove();
    };
  }, [latitude, longitude, zoom, markers, onMapClick, mapId]);

  return <div id={mapId} style={{ height, width: "100%", borderRadius: "16px" }} />;
}
