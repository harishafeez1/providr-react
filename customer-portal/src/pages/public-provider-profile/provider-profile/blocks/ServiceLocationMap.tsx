import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import * as turf from '@turf/turf';

interface ServiceLocation {
  lat: number;
  lng: number;
  radius_km: number;
}

interface ServiceLocationMapProps {
  addresses_collection: ServiceLocation[];
  accessToken: string;
}

const ServiceLocationMap: React.FC<ServiceLocationMapProps> = ({
  addresses_collection,
  accessToken
}) => {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const circlesRef = useRef<string[]>([]);

  // Ensure addresses_collection is valid array
  const validAddresses = React.useMemo(() => {
    if (!addresses_collection || !Array.isArray(addresses_collection)) {
      return [];
    }
    return addresses_collection.filter(location => 
      location && 
      typeof location === 'object' && 
      !isNaN(Number(location.lat)) && 
      !isNaN(Number(location.lng)) && 
      !isNaN(Number(location.radius_km))
    );
  }, [addresses_collection]);

  // Clean up existing markers and circles
  const clearMapElements = () => {
    // Remove markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Remove circle layers and sources
    if (mapRef.current) {
      circlesRef.current.forEach(layerId => {
        if (mapRef.current!.getLayer(`${layerId}-fill`)) {
          mapRef.current!.removeLayer(`${layerId}-fill`);
        }
        if (mapRef.current!.getLayer(`${layerId}-stroke`)) {
          mapRef.current!.removeLayer(`${layerId}-stroke`);
        }
        if (mapRef.current!.getSource(layerId)) {
          mapRef.current!.removeSource(layerId);
        }
      });
      circlesRef.current = [];
    }
  };

  // Function to create marker element
  const createMarkerElement = (markerNumber: number) => {
    const markerElement = document.createElement('div');
    markerElement.innerHTML = `
      <div style="
        width: 32px;
        height: 32px;
        background: #762c85;
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 14px;
        font-weight: bold;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      ">${markerNumber}</div>
    `;
    return markerElement;
  };

  // Function to create radius circle
  const createRadiusCircle = (locationIndex: number, lat: number, lng: number, radiusKm: number) => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    const sourceId = `circle-source-${locationIndex}`;
    const layerId = `circle-layer-${locationIndex}`;

    // Create circle geometry using turf.js
    const centerPoint = turf.point([lng, lat]);
    const circle = turf.circle(centerPoint, radiusKm, { units: 'kilometers', steps: 64 });
    const coords = circle.geometry.coordinates[0];

    // Add source
    map.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [coords]
        }
      }
    });

    // Add fill layer
    map.addLayer({
      id: `${layerId}-fill`,
      type: 'fill',
      source: sourceId,
      paint: {
        'fill-color': '#762c85',
        'fill-opacity': 0.15
      }
    });

    // Add stroke layer
    map.addLayer({
      id: `${layerId}-stroke`,
      type: 'line',
      source: sourceId,
      paint: {
        'line-color': '#762c85',
        'line-width': 2,
        'line-opacity': 0.8
      }
    });

    circlesRef.current.push(layerId);
  };

  // Add markers and circles to map
  const addMarkersAndCircles = () => {
    if (!mapRef.current || !validAddresses.length) return;

    clearMapElements();

    const bounds = new mapboxgl.LngLatBounds();

    validAddresses.forEach((location, index) => {
      // Defensive destructuring with type conversion
      if (!location || typeof location !== 'object') return;
      
      const lat = Number(location.lat);
      const lng = Number(location.lng);
      const radius_km = Number(location.radius_km);
      
      // Skip invalid coordinates
      if (isNaN(lat) || isNaN(lng) || isNaN(radius_km)) {
        console.warn(`Invalid location data at index ${index}:`, location);
        return;
      }

      // Create and add marker
      const markerElement = createMarkerElement(index + 1);
      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([lng, lat])
        .addTo(mapRef.current!);

      // Add popup with location info
      const popup = new mapboxgl.Popup({ offset: 35 })
        .setHTML(`
          <div class="p-2">
            <h3 class="font-semibold text-sm">Service Location ${index + 1}</h3>
            <p class="text-xs text-gray-600">Lat: ${Number(lat).toFixed(6)}, Lng: ${Number(lng).toFixed(6)}</p>
            <p class="text-xs text-gray-600">Service radius: ${Number(radius_km)}km</p>
          </div>
        `);

      marker.setPopup(popup);
      markersRef.current.push(marker);

      // Create radius circle
      createRadiusCircle(index, lat, lng, radius_km);

      // Extend bounds to include this location and its radius
      const radiusInDegrees = radius_km / 111; // Rough conversion km to degrees
      bounds.extend([lng - radiusInDegrees, lat - radiusInDegrees]);
      bounds.extend([lng + radiusInDegrees, lat + radiusInDegrees]);
    });

    // Fit map to show all locations with padding
    if (validAddresses.length > 0) {
      mapRef.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 12
      });
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || !accessToken) return;

    mapboxgl.accessToken = accessToken;

    // Initialize map
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [144.9631, -37.8136], // Melbourne, Australia as default
      zoom: 10,
      attributionControl: false
    });

    mapRef.current = map;

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add markers and circles once map is loaded
    map.on('load', () => {
      addMarkersAndCircles();
    });

    return () => {
      clearMapElements();
      if (map) {
        map.remove();
      }
    };
  }, [accessToken]);

  // Update markers and circles when addresses change
  useEffect(() => {
    if (mapRef.current && mapRef.current.isStyleLoaded()) {
      addMarkersAndCircles();
    }
  }, [validAddresses]);

  if (!accessToken) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gray-100 rounded-lg border">
        <div className="text-center p-6">
          <p className="text-gray-600 mb-2">Map requires Mapbox access token</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Map */}
      <div
        ref={mapContainerRef}
        className="w-full rounded-lg border border-gray-300"
        style={{ height: '500px' }}
      />


      {/* Legend */}
      <div className="rounded-lg p-3 border" style={{ backgroundColor: '#f8f4fd', borderColor: '#d4a6e8' }}>
        <h4 className="text-sm font-semibold mb-2" style={{ color: '#762c85' }}>Map Legend:</h4>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-white" style={{ backgroundColor: '#762c85' }}></div>
            <span style={{ color: '#762c85' }}>Service Location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 opacity-30 rounded" style={{ backgroundColor: '#762c85' }}></div>
            <span style={{ color: '#762c85' }}>Service Coverage Area</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceLocationMap;