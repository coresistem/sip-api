import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LocationPickerProps {
    onLocationSelect: (lat: number, lng: number) => void;
    initialLat?: number;
    initialLng?: number;
}

export default function LocationPicker({ onLocationSelect, initialLat, initialLng }: LocationPickerProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                const newLat = parseFloat(lat);
                const newLng = parseFloat(lon);

                if (mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo([newLat, newLng], 13);

                    if (markerRef.current) {
                        markerRef.current.setLatLng([newLat, newLng]);
                    } else {
                        markerRef.current = L.marker([newLat, newLng]).addTo(mapInstanceRef.current);
                    }
                    onLocationSelect(newLat, newLng);
                }
            } else {
                alert('Location not found');
            }
        } catch (error) {
            console.error('Search failed:', error);
            alert('Search failed');
        } finally {
            setIsSearching(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    useEffect(() => {
        if (!mapRef.current) return;

        // Initialize map if not exists
        if (!mapInstanceRef.current) {
            const defaultCenter: [number, number] = [-6.2088, 106.8456]; // Jakarta
            const center: [number, number] = initialLat && initialLng ? [initialLat, initialLng] : defaultCenter;

            const map = L.map(mapRef.current).setView(center, 13);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            mapInstanceRef.current = map;

            // Add click handler
            map.on('click', (e) => {
                const { lat, lng } = e.latlng;
                onLocationSelect(lat, lng);

                // Update marker
                if (markerRef.current) {
                    markerRef.current.setLatLng([lat, lng]);
                } else {
                    markerRef.current = L.marker([lat, lng]).addTo(map);
                }

                // Fly to location
                map.flyTo([lat, lng], map.getZoom());
            });

            // Initial marker
            if (initialLat && initialLng) {
                markerRef.current = L.marker([initialLat, initialLng]).addTo(map);
            }
        }

        // Cleanup
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
                markerRef.current = null;
            }
        };
    }, []); // Run once on mount

    // Update view if props change (optional, but good for keeping sync if external updates happen)
    useEffect(() => {
        if (mapInstanceRef.current && initialLat && initialLng) {
            // Only update if significantly different to avoid loops, or just rely on internal state
            // For now, we trust the map's internal state unless it's a fresh load
        }
    }, [initialLat, initialLng]);

    return (
        <div className="h-[300px] w-full rounded-xl overflow-hidden border border-white/10 relative z-0 group">
            <div className="absolute top-2 left-12 z-[1000] flex gap-2 w-[240px]">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search location..."
                    className="flex-1 bg-dark-900/90 text-white text-xs px-3 py-2 rounded-lg border border-white/20 focus:outline-none focus:border-primary-500 backdrop-blur-sm shadow-lg"
                />
                <button
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-3 py-1 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 shadow-lg"
                >
                    {isSearching ? '...' : 'Go'}
                </button>
            </div>
            <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
        </div>
    );
}
