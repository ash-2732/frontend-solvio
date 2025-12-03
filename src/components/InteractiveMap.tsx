"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
	iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
	iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
	shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface InteractiveMapProps {
	lat: number | null;
	lng: number | null;
	onLocationSelect: (lat: number, lng: number) => void;
}

function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
	const map = useMapEvents({
		click: (e) => {
			const { lat, lng } = e.latlng;
			onLocationSelect(lat, lng);
		},
	});

	return null;
}

function MapUpdater({ lat, lng }: { lat: number | null; lng: number | null }) {
	const map = useMap();

	useEffect(() => {
		if (lat !== null && lng !== null) {
			map.flyTo([lat, lng], 13, {
				duration: 1,
			});
		}
	}, [lat, lng, map]);

	return null;
}

export default function InteractiveMap({ lat, lng, onLocationSelect }: InteractiveMapProps) {
	// Default to Dhaka, Bangladesh if no location provided
	const centerLat = lat ?? 23.7808;
	const centerLng = lng ?? 90.4219;

	useEffect(() => {
		// Force Leaflet to recalculate map size on mount
		const timer = setTimeout(() => {
			window.dispatchEvent(new Event("resize"));
		}, 100);
		return () => clearTimeout(timer);
	}, []);

	return (
		<div className="w-full h-[320px] rounded-lg overflow-hidden border border-slate-200 relative">
			<MapContainer
				center={[centerLat, centerLng]}
				zoom={13}
				style={{ height: "100%", width: "100%" }}
				scrollWheelZoom={true}
			>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
				<MapClickHandler onLocationSelect={onLocationSelect} />
				<MapUpdater lat={lat} lng={lng} />
				{lat !== null && lng !== null && <Marker position={[lat, lng]} />}
			</MapContainer>
			<div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-md shadow-md text-xs text-slate-700 z-[1000] pointer-events-none">
				💡 Click anywhere on the map to set location
			</div>
		</div>
	);
}
