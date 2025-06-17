import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';

import 'leaflet/dist/leaflet.css';
import 'leaflet.fullscreen/Control.FullScreen.css';
import 'leaflet.fullscreen';
import 'leaflet-geosearch/dist/geosearch.css';

import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';

// Custom icon with label under it
const customIcon = L.divIcon({
  html: `
    <div class="flex flex-col items-center">
      <i class="ki-solid ki-geolocation text-4xl text-black"></i>
      <div class="text-sm text-black bg-white px-2 py-1 rounded shadow mt-1 text-center whitespace-nowrap">
        430 E 6th St, New York
      </div>
    </div>
  `,
  className: 'leaflet-marker',
  iconAnchor: [12, 24] // Adjust to point marker tip at the correct location
});

// Map controls component for search + fullscreen
const MapControls = () => {
  const map = useMap();

  useEffect(() => {
    // Fullscreen control
    const fullscreenControl = L.control.fullscreen({
      position: 'topright'
    });
    fullscreenControl.addTo(map);

    // Search control
    const provider = new OpenStreetMapProvider();
    const searchControl = GeoSearchControl({
      provider,
      showMarker: true,
      autoClose: true,
      retainZoomLevel: false,
      animateZoom: true,
      keepResult: true
    });

    map.addControl(searchControl);

    return () => {
      map.removeControl(searchControl);
      map.removeControl(fullscreenControl);
    };
  }, [map]);

  return null;
};

const ProviderMap = () => {
  return (
    <div className="w-full">
      <MapContainer
        center={[40.724716, -73.984789]}
        zoom={18}
        scrollWheelZoom={true}
        zoomControl={true}
        attributionControl={false}
        className="rounded-xl w-full h-[400px]"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[40.724716, -73.984789]} icon={customIcon} />
        <MapControls />
      </MapContainer>
    </div>
  );
};

export { ProviderMap };
