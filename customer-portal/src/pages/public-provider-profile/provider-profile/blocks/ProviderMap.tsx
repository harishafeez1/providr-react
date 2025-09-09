import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Mail, Phone } from 'lucide-react';

interface Premise {
  id: number;
  provider_company_id: number;
  name: string;
  active: number;
  address_line_1: string;
  address_line_2: string | null;
  email: string;
  latitude: string;
  longitude: string;
  phone: string;
  post_code: string | null;
  state: string;
  suburb: string;
}

interface ProviderMapProps {
  premises?: Premise[];
}

const ProviderMap: React.FC<ProviderMapProps> = ({ premises = [] }) => {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Get Mapbox access token from environment variables
  const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';

  // Clean up existing markers
  const clearMarkers = () => {
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
  };

  // Function to create marker element with premise info (3D optimized)
  const createMarkerElement = (premise: Premise, index: number) => {
    const markerElement = document.createElement('div');
    markerElement.innerHTML = `
      <div style="
        width: 36px;
        height: 36px;
        background: #762c85;
        border: 4px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 15px;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(118, 44, 133, 0.4), 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
        transform: translateZ(0);
        position: relative;
        z-index: 1000;
      ">${index + 1}</div>
    `;
    return markerElement;
  };

  // Add markers to map
  const addMarkers = () => {
    if (!mapRef.current || !premises.length) return;

    clearMarkers();

    const bounds = new mapboxgl.LngLatBounds();
    let validPremises = 0;

    premises.forEach((premise, index) => {
      const lat = parseFloat(premise.latitude);
      const lng = parseFloat(premise.longitude);

      // Skip invalid coordinates
      if (isNaN(lat) || isNaN(lng)) {
        console.warn(
          `Invalid coordinates for premise ${premise.name}:`,
          premise.latitude,
          premise.longitude
        );
        return;
      }

      // Create marker element
      const markerElement = createMarkerElement(premise, index);

      // Create marker
      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([lng, lat])
        .addTo(mapRef.current!);

      // Create popup with premise info
      const popup = new mapboxgl.Popup({ offset: 35 }).setHTML(`
          <div class="p-4 max-w-xs">
            <h3 class="font-semibold text-sm mb-3">${premise.name}</h3>
            <p class="text-xs text-gray-600 mb-2">${premise.address_line_1 || ''}</p>
            <div class="space-y-1">
              <p class="text-xs text-gray-600">📞 ${premise.phone}</p>
              <p class="text-xs text-gray-600">✉️ ${premise.email}</p>
            </div>
          </div>
        `);

      marker.setPopup(popup);
      markersRef.current.push(marker);

      // Extend bounds
      bounds.extend([lng, lat]);
      validPremises++;
    });

    // Fit map to show all premises with 3D view
    if (validPremises > 0) {
      if (validPremises === 1) {
        // If only one premise, center on it with 3D view
        const premise = premises.find(
          (p) => !isNaN(parseFloat(p.latitude)) && !isNaN(parseFloat(p.longitude))
        );
        if (premise) {
          mapRef.current.flyTo({
            center: [parseFloat(premise.longitude), parseFloat(premise.latitude)],
            zoom: 16,
            pitch: 55,
            bearing: 20,
            duration: 2000
          });
        }
      } else {
        // If multiple premises, fit bounds with 3D perspective
        mapRef.current.fitBounds(bounds, {
          padding: 60,
          maxZoom: 15,
          pitch: 45,
          bearing: 0
        });
      }
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || !MAPBOX_ACCESS_TOKEN) return;

    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

    // Initialize map with 3D view
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [144.9631, -37.8136], // Melbourne, Australia as default
      zoom: 10,
      pitch: 45, // 3D tilt angle
      bearing: 0, // Rotation angle
      attributionControl: false,
      antialias: true // Enable antialiasing for smoother 3D rendering
    });

    mapRef.current = map;

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add markers and 3D features once map is loaded
    map.on('load', () => {
      // Add 3D buildings layer
      map.addLayer({
        id: '3d-buildings',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', 'extrude', 'true'],
        type: 'fill-extrusion',
        minzoom: 14,
        paint: {
          'fill-extrusion-color': '#aaa',
          'fill-extrusion-height': [
            'interpolate',
            ['linear'],
            ['zoom'],
            14,
            0,
            15.05,
            ['get', 'height']
          ],
          'fill-extrusion-base': [
            'interpolate',
            ['linear'],
            ['zoom'],
            14,
            0,
            15.05,
            ['get', 'min_height']
          ],
          'fill-extrusion-opacity': 0.6
        }
      });

      addMarkers();
    });

    return () => {
      clearMarkers();
      if (map) {
        map.remove();
      }
    };
  }, [MAPBOX_ACCESS_TOKEN]);

  // Update markers when premises change
  useEffect(() => {
    if (mapRef.current && mapRef.current.isStyleLoaded()) {
      addMarkers();
    }
  }, [premises]);

  // Don't render if no premises
  if (!premises || premises.length === 0) {
    return null;
  }

  if (!MAPBOX_ACCESS_TOKEN) {
    return (
      <div className="w-full">
        <h2 className="font-bold text-xl my-6 text-[#222222]">My Locations</h2>
        <div className="w-full h-[400px] flex items-center justify-center bg-gray-100 rounded-2xl border">
          <div className="text-center p-6">
            <p className="text-gray-600 mb-2">Map requires Mapbox access token</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="font-bold text-xl my-6 text-[#222222]">
        My Locations {premises.length > 0 && `(${premises.length})`}
      </h2>
      <div ref={mapContainerRef} className="rounded-2xl w-full h-[400px] border border-gray-300" />

      {/* Premises list */}
      {premises.length > 0 && (
        <div className="mt-6 space-y-3">
          {premises.map((premise, index) => {
            const lat = parseFloat(premise.latitude);
            const lng = parseFloat(premise.longitude);

            if (isNaN(lat) || isNaN(lng)) return null;

            return (
              <div key={premise.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ backgroundColor: '#762c85' }}
                >
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-gray-800 mb-1">{premise.name || ''}</h4>
                  <p className="text-xs text-gray-600 mb-2">{premise.address_line_1 || ''}</p>
                  <div className="flex flex-wrap gap-6">
                    {premise.phone && (
                      <span className="text-xs text-gray-500 flex gap-3">
                        <Phone size={16} />
                        {premise.phone || ''}
                      </span>
                    )}
                    {premise.email && (
                      <span className="text-xs text-gray-500 flex gap-3">
                        <Mail size={16} />
                        {premise.email || ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export { ProviderMap };
