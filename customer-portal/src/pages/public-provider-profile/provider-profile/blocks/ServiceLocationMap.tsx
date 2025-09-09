import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import * as turf from '@turf/turf';
import 'mapbox-gl/dist/mapbox-gl.css';

interface ServiceLocation {
  lat: number;
  lng: number;
  radius?: number; // radius in kilometers
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
  const circleLayersRef = useRef<string[]>([]);
  const [locationNames, setLocationNames] = useState<{ [key: number]: string }>({});

  // Ensure addresses_collection is valid array
  const validAddresses = React.useMemo(() => {
    if (!addresses_collection || !Array.isArray(addresses_collection)) {
      return [];
    }
    return addresses_collection.filter(
      (location) =>
        location &&
        typeof location === 'object' &&
        !isNaN(Number(location.lat)) &&
        !isNaN(Number(location.lng))
    );
  }, [addresses_collection]);

  // Clean up existing markers and circle layers
  const clearMapElements = () => {
    // Remove markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Remove circle layers and sources
    if (mapRef.current) {
      circleLayersRef.current.forEach((layerId) => {
        if (mapRef.current!.getLayer(layerId)) {
          mapRef.current!.removeLayer(layerId);
        }
        if (mapRef.current!.getSource(layerId)) {
          mapRef.current!.removeSource(layerId);
        }
      });
    }
    circleLayersRef.current = [];
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

  // Function to get location name from coordinates
  const getLocationName = async (lat: number, lng: number, index: number) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_APP_API_URL}/mapbox/geocode?lat=${lat}&lng=${lng}`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const locationName =
          data.features[0].place_name || data.features[0].text || `Location ${index + 1}`;
        setLocationNames((prev) => ({ ...prev, [index]: locationName }));
        return locationName;
      }
    } catch (error) {
      console.error('Error fetching location name:', error);
    }
    return `Service Location ${index + 1}`;
  };

  // Function to add radius circle for a location
  const addRadiusCircle = (location: ServiceLocation, index: number) => {
    if (!mapRef.current || !location.radius) return;

    const lat = Number(location.lat);
    const lng = Number(location.lng);
    const radius = location.radius;

    // Create a circle using Turf.js
    const center = turf.point([lng, lat]);
    const circle = turf.circle(center, radius, { units: 'kilometers', steps: 64 });

    const layerId = `radius-circle-${index}`;
    const sourceId = `radius-source-${index}`;

    // Add source and layer to map
    mapRef.current.addSource(sourceId, {
      type: 'geojson',
      data: circle
    });

    mapRef.current.addLayer({
      id: layerId,
      type: 'fill',
      source: sourceId,
      paint: {
        'fill-color': '#762c85',
        'fill-opacity': 0.1
      }
    });

    // Add border for the circle
    mapRef.current.addLayer({
      id: `${layerId}-border`,
      type: 'line',
      source: sourceId,
      paint: {
        'line-color': '#762c85',
        'line-width': 2,
        'line-opacity': 0.6
      }
    });

    circleLayersRef.current.push(layerId, `${layerId}-border`);
  };

  // Add markers to map
  const addMarkers = () => {
    if (!mapRef.current || !validAddresses.length) return;

    clearMapElements();

    const bounds = new mapboxgl.LngLatBounds();

    // First pass: Add all markers immediately and set up bounds
    validAddresses.forEach((location, index) => {
      // Defensive destructuring with type conversion
      if (!location || typeof location !== 'object') return;

      const lat = Number(location.lat);
      const lng = Number(location.lng);

      // Skip invalid coordinates
      if (isNaN(lat) || isNaN(lng)) {
        console.warn(`Invalid location data at index ${index}:`, location);
        return;
      }

      // Create and add marker immediately
      const markerElement = createMarkerElement(index + 1);
      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([lng, lat])
        .addTo(mapRef.current!);

      // Add popup with basic info first (will be updated with location name)
      const radiusText = location.radius
        ? `<p class="text-xs text-gray-600">Radius: ${location.radius} km</p>`
        : '';
      const popup = new mapboxgl.Popup({
        offset: 35,
        closeButton: false // Disable default close button to use custom one
      }).setHTML(`
          <div class="p-2 relative">
            <button class="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary hover:bg-purple-300 flex items-center justify-center text-white hover:text-purple-800 transition-colors duration-200 z-10 border-none outline-none" onclick="this.closest('.mapboxgl-popup').remove()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <h3 class="font-semibold text-sm pr-6">Service Location ${index + 1}</h3>
            <p class="text-xs text-gray-600">Lat: ${Number(lat).toFixed(6)}, Lng: ${Number(lng).toFixed(6)}</p>
            ${radiusText}
          </div>
        `);

      marker.setPopup(popup);
      markersRef.current.push(marker);

      // Add radius circle if radius is provided
      if (location.radius) {
        addRadiusCircle(location, index);
      }

      // Extend bounds to include this location
      bounds.extend([lng, lat]);

      // If there's a radius, extend bounds to include the circle
      if (location.radius) {
        const radiusInDegrees = location.radius / 111; // Rough conversion from km to degrees
        bounds.extend([lng - radiusInDegrees, lat - radiusInDegrees]);
        bounds.extend([lng + radiusInDegrees, lat + radiusInDegrees]);
      }

      // Async: Get location name and update popup
      getLocationName(lat, lng, index).then((locationName) => {
        const radiusText = location.radius
          ? `<p class="text-xs text-gray-600">Radius: ${location.radius} km</p>`
          : '';
        popup.setHTML(`
          <div class="p-2 relative">
            <button class="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary hover:bg-purple-300 flex items-center justify-center text-white hover:text-purple-800 transition-colors duration-200 z-10 border-none outline-none" onclick="this.closest('.mapboxgl-popup').remove()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <h3 class="font-semibold text-sm pr-6">${locationName}</h3>
            <p class="text-xs text-gray-600">Lat: ${Number(lat).toFixed(6)}, Lng: ${Number(lng).toFixed(6)}</p>
            ${radiusText}
          </div>
        `);
      });
    });

    // Immediately fit map to show all locations
    if (validAddresses.length > 0) {
      if (validAddresses.length === 1) {
        // Single location: center on it with good zoom
        const firstLocation = validAddresses[0];
        mapRef.current.flyTo({
          center: [Number(firstLocation.lng), Number(firstLocation.lat)],
          zoom: 12,
          duration: 1000
        });
      } else {
        // Multiple locations: fit all in view
        mapRef.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 12,
          duration: 1000
        });
      }
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

    // Add markers once map is loaded
    map.on('load', () => {
      addMarkers();
    });

    return () => {
      clearMapElements();
      if (map) {
        map.remove();
      }
    };
  }, [accessToken]);

  // Update markers when addresses change
  useEffect(() => {
    if (mapRef.current && mapRef.current.isStyleLoaded()) {
      addMarkers();
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
      <div
        className="rounded-lg p-3 border"
        style={{ backgroundColor: '#f8f4fd', borderColor: '#d4a6e8' }}
      >
        <h4 className="text-sm font-semibold mb-2" style={{ color: '#762c85' }}>
          Map Legend:
        </h4>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full border-2 border-white"
              style={{ backgroundColor: '#762c85' }}
            ></div>
            <span style={{ color: '#762c85' }}>Service Location</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full border-2"
              style={{ borderColor: '#762c85', backgroundColor: 'rgba(118, 44, 133, 0.1)' }}
            ></div>
            <span style={{ color: '#762c85' }}>Service Area</span>
          </div>
        </div>

        {/* Location Names */}
        {Object.keys(locationNames).length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <h5 className="text-xs font-medium mb-2" style={{ color: '#762c85' }}>
              Locations:
            </h5>
            <div className="space-y-1">
              {Object.entries(locationNames).map(([index, name]) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <div
                    className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: '#762c85' }}
                  >
                    {parseInt(index) + 1}
                  </div>
                  <span style={{ color: '#762c85' }}>{name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceLocationMap;
