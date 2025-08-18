import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import * as turf from '@turf/turf';

interface ServiceLocation {
  id: string;
  lat: number;
  lng: number;
  address: string;
  radius: number;
  suburbs: any[];
}

interface MapboxLocationSelectorProps {
  onLocationsUpdate?: (locations: ServiceLocation[]) => void;
  accessToken: string;
}

const MapboxLocationSelector: React.FC<MapboxLocationSelectorProps> = ({
  // onLocationsUpdate,
  accessToken
}) => {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const [locations, setLocations] = useState<ServiceLocation[]>([]);

  // Search functionality state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loadingSuburbs, setLoadingSuburbs] = useState<Set<string>>(new Set());

  // Store confirmed markers and radius circles
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const circlesRef = useRef<Map<string, string>>(new Map()); // store circle layer IDs
  const suburbPolygonsRef = useRef<Map<string, string[]>>(new Map()); // store suburb polygon layer IDs per location
  // @ts-ignore
  const radiusTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Global suburb tracking for unique suburbs across all markers
  const globalSuburbsRef = useRef<
    Map<
      string,
      {
        name: string;
        fullName: string;
        coordinates: [number, number];
        assignedToMarkers: Set<string>;
        distances: Map<string, number>;
      }
    >
  >(new Map());

  // Cache for suburb boundary data
  const suburbCacheRef = useRef<
    Map<
      string,
      {
        data: any[];
        timestamp: number;
        center: [number, number];
        radius: number;
      }
    >
  >(new Map());

  // Function to fetch suburbs from Overpass API with retry logic and multiple servers
  const fetchSuburbsFromOverpass = async (lat: number, lng: number, radiusKm: number) => {
    const radiusMeters = radiusKm * 1000;

    // Optimized Overpass API query - faster and simpler
    const overpassQuery = `
      [out:json][timeout:15];
      (
        // Primary: Suburb/locality nodes with postcodes (fastest)
        node["place"~"suburb|locality"]["name"]["postal_code"](around:${radiusMeters},${lat},${lng});
        
        // Secondary: Major admin boundaries with postcodes (limit to most relevant)
        relation["admin_level"="9"]["boundary"="administrative"]["name"]["postal_code"](around:${radiusMeters},${lat},${lng});
      );
      out center meta;
    `;

    // Multiple Overpass API servers for redundancy
    const overpassServers = [
      'https://overpass-api.de/api/interpreter',
      'https://overpass.kumi.systems/api/interpreter',
      'https://overpass.openstreetmap.fr/api/interpreter'
    ];

    const maxRetries = 2;
    let lastError: Error | null = null;

    // Try each server with retry logic
    for (const serverUrl of overpassServers) {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout

          const response = await fetch(serverUrl, {
            method: 'POST',
            body: overpassQuery,
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            const errorText = await response.text();

            // Check if it's a server overload error
            if (
              response.status === 504 ||
              response.status === 503 ||
              errorText.includes('too busy')
            ) {
              throw new Error(`Server overloaded: ${response.status}`);
            }

            throw new Error(`API error: ${response.status}`);
          }

          const data = await response.json();

          return data.elements || [];
        } catch (error) {
          lastError = error instanceof Error ? error : new Error('Unknown error');

          // Wait before retry (exponential backoff)
          if (attempt < maxRetries) {
            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      }
    }

    console.error('All Overpass API servers failed. Last error:', lastError?.message);
    return [];
  };

  // Function to convert Overpass element to GeoJSON polygon
  const overpassElementToGeoJSON = (element: any) => {
    try {
      if (element.type === 'relation') {
        // For relations, we need to construct polygons from ways
        const outerWays: any[] = [];
        const innerWays: any[] = [];

        element.members?.forEach((member: any) => {
          if (member.type === 'way') {
            if (member.role === 'outer' || member.role === '') {
              outerWays.push(member);
            } else if (member.role === 'inner') {
              innerWays.push(member);
            }
          }
        });

        // For simplicity, we'll use the first outer way if available
        if (outerWays.length > 0 && element.geometry) {
          const coordinates = element.geometry.map((node: any) => [node.lon, node.lat]);
          if (coordinates.length > 3) {
            // Close the polygon if not already closed
            if (
              coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
              coordinates[0][1] !== coordinates[coordinates.length - 1][1]
            ) {
              coordinates.push(coordinates[0]);
            }

            return turf.polygon([coordinates]);
          }
        }
      } else if (element.type === 'way' && element.geometry) {
        const coordinates = element.geometry.map((node: any) => [node.lon, node.lat]);
        if (coordinates.length > 3) {
          // Close the polygon if not already closed
          if (
            coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
            coordinates[0][1] !== coordinates[coordinates.length - 1][1]
          ) {
            coordinates.push(coordinates[0]);
          }

          return turf.polygon([coordinates]);
        }
      }
    } catch (error) {
      console.error('Error converting Overpass element to GeoJSON:', error);
    }

    return null;
  };

  // Function to render suburb polygons on the map
  const renderSuburbPolygons = (locationId: string, suburbs: any[]) => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    // Remove existing suburb polygon layers for this location
    const existingLayers = suburbPolygonsRef.current.get(locationId) || [];
    existingLayers.forEach((layerId) => {
      if (map.getLayer(`${layerId}-fill`)) {
        map.removeLayer(`${layerId}-fill`);
      }
      if (map.getLayer(`${layerId}-stroke`)) {
        map.removeLayer(`${layerId}-stroke`);
      }
      if (map.getSource(layerId)) {
        map.removeSource(layerId);
      }
    });

    const newLayerIds: string[] = [];

    // Add new suburb polygon layers
    suburbs.forEach((suburb, index) => {
      if (!suburb.polygon) return;

      const sourceId = `suburb-${locationId}-${index}`;
      const layerId = `suburb-layer-${locationId}-${index}`;

      try {
        // Add source for suburb polygon
        map.addSource(sourceId, {
          type: 'geojson',
          data: suburb.polygon
        });

        // Add fill layer for suburb
        map.addLayer({
          id: `${layerId}-fill`,
          type: 'fill',
          source: sourceId,
          paint: {
            'fill-color':
              suburb.overlapType === 'fully_contained'
                ? '#22c55e'
                : suburb.overlapType === 'overlaps'
                  ? '#f59e0b'
                  : suburb.overlapType === 'intersects'
                    ? '#3b82f6'
                    : '#94a3b8',
            'fill-opacity': 0.15
          }
        });

        // Add stroke layer for suburb boundary
        map.addLayer({
          id: `${layerId}-stroke`,
          type: 'line',
          source: sourceId,
          paint: {
            'line-color':
              suburb.overlapType === 'fully_contained'
                ? '#16a34a'
                : suburb.overlapType === 'overlaps'
                  ? '#d97706'
                  : suburb.overlapType === 'intersects'
                    ? '#2563eb'
                    : '#6b7280',
            'line-width': 1.5,
            'line-opacity': 0.8
          }
        });

        // Add click handler to show suburb info
        map.on('click', `${layerId}-fill`, (e) => {
          if (e.features && e.features[0]) {
            const coordinates = e.lngLat;
            const popup = new mapboxgl.Popup()
              .setLngLat(coordinates)
              .setHTML(
                `
                <div class="p-2">
                  <h3 class="font-semibold text-sm">${suburb.name}</h3>
                  <p class="text-xs text-gray-600">${suburb.distance.toFixed(2)}km from marker</p>
                  <p class="text-xs text-gray-500 capitalize">${suburb.overlapType.replace('_', ' ')}</p>
                </div>
              `
              )
              .addTo(map);
          }
        });

        // Change cursor on hover
        map.on('mouseenter', `${layerId}-fill`, () => {
          map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', `${layerId}-fill`, () => {
          map.getCanvas().style.cursor = '';
        });

        newLayerIds.push(sourceId);
      } catch (error) {
        console.error(`Error rendering suburb polygon ${suburb.name}:`, error);
      }
    });

    // Store layer IDs for cleanup
    suburbPolygonsRef.current.set(locationId, newLayerIds);
  };

  // Function to fetch suburbs within radius using Overpass API + geometric intersection
  const fetchSuburbsInRadius = async (
    locationId: string,
    lat: number,
    lng: number,
    radiusKm: number
  ) => {
    try {
      setLoadingSuburbs((prev) => new Set([...prev, locationId]));

      // Check cache first (5 minutes cache)
      const cacheKey = `${lat.toFixed(4)}_${lng.toFixed(4)}_${radiusKm}`;
      const cached = suburbCacheRef.current.get(cacheKey);
      const now = Date.now();

      if (cached && now - cached.timestamp < 5 * 60 * 1000) {
        const locationSuburbs = cached.data.map((suburb) => ({
          ...suburb,
          distance: calculateDistance(lat, lng, suburb.coordinates[1], suburb.coordinates[0])
        }));

        setLocations((prev) =>
          prev.map((loc) => {
            if (loc.id === locationId) {
              return { ...loc, suburbs: locationSuburbs };
            }
            return loc;
          })
        );
        return;
      }

      // Create circle for intersection testing
      const centerPoint = turf.point([lng, lat]);
      const circle = turf.circle(centerPoint, radiusKm, { units: 'kilometers' });

      // Fetch suburb boundaries from Overpass API
      const overpassElements = await fetchSuburbsFromOverpass(lat, lng, radiusKm * 1.2); // Buffer for edge cases

      const validSuburbs: any[] = [];

      // Process each Overpass element
      for (const element of overpassElements) {
        if (!element.tags?.name) continue;

        const suburbName = element.tags.name;

        // Filter out non-suburban results (housing estates, colleges, etc.)
        // Note: Many valid Australian suburbs have "Park" in name, so be more specific
        const excludePatterns = [
          /estate/i,
          /college/i,
          /university/i,
          /housing/i,
          /apartments?/i,
          /tower/i,
          /village/i,
          /gardens/i,
          /square/i,
          /house/i,
          /hall/i,
          /\bplace\b/i,
          /terrace/i,
          /court/i,
          /mews/i,
          /complex/i,
          /development/i,
          /residence/i,
          /manor/i,
          /\bview\b/i,
          /aged care/i,
          /retirement/i,
          /student/i,
          /display/i,
          /suite/i,
          /flats/i,
          /quarter/i,
          /precinct/i,
          /shopping/i,
          /medical/i,
          /hospital/i,
          /centre/i,
          /center/i
        ];

        // Allow common Australian suburb patterns that end with Park, Heights, etc.
        const validSuburbPatterns = [
          /\b\w+\s+Park$/i, // Albert Park, Noble Park, etc.
          /\b\w+\s+Heights$/i, // Heidelberg Heights, etc.
          /\b\w+\s+Gardens$/i, // Some Gardens are valid suburbs
          /\b\w+\s+Village$/i // Some Villages are valid suburbs
        ];

        const isValidSuburb = validSuburbPatterns.some((pattern) => pattern.test(suburbName));
        const shouldExclude =
          !isValidSuburb && excludePatterns.some((pattern) => pattern.test(suburbName));

        if (shouldExclude) {
          continue;
        }

        // Convert to GeoJSON polygon
        const suburbPolygon = overpassElementToGeoJSON(element);

        if (suburbPolygon) {
          try {
            // Test geometric intersection with circle
            const intersects = turf.booleanIntersects(circle, suburbPolygon);
            const overlaps = turf.booleanOverlap(circle, suburbPolygon);
            const circleContainsSuburb = turf.booleanContains(circle, suburbPolygon);
            const suburbContainsCircle = turf.booleanContains(suburbPolygon, circle);

            if (intersects || overlaps || circleContainsSuburb || suburbContainsCircle) {
              // Calculate centroid for distance measurement
              const centroid = turf.centroid(suburbPolygon);
              const distance = turf.distance(centerPoint, centroid, { units: 'kilometers' });

              const postcode = element.tags.postal_code || element.tags.postcode || '';

              validSuburbs.push({
                name: suburbName,
                fullName: postcode
                  ? `${suburbName} ${postcode}, Australia`
                  : `${suburbName}, Australia`,
                coordinates: centroid.geometry.coordinates,
                distance: distance,
                postcode: postcode,
                polygon: suburbPolygon, // Store for map rendering
                overlapType: circleContainsSuburb
                  ? 'fully_contained'
                  : suburbContainsCircle
                    ? 'contains_circle'
                    : overlaps
                      ? 'overlaps'
                      : 'intersects'
              });
            }
          } catch (error) {
            console.error(`Error processing suburb ${suburbName}:`, error);
          }
        } else {
          // Extract coordinates using optimized 'out center' format
          let suburbLat = null;
          let suburbLng = null;

          // Method 1: Direct lat/lng (for nodes)
          if (element.lat && element.lon) {
            suburbLat = element.lat;
            suburbLng = element.lon;
          }
          // Method 2: Use center coordinates (from 'out center' for relations)
          else if (element.center) {
            suburbLat = element.center.lat;
            suburbLng = element.center.lon;
          }

          if (suburbLat && suburbLng) {
            const distance = calculateDistance(lat, lng, suburbLat, suburbLng);

            if (distance <= radiusKm) {
              const postcode = element.tags.postal_code || element.tags.postcode || '';

              validSuburbs.push({
                name: suburbName,
                fullName: postcode
                  ? `${suburbName} ${postcode}, Australia`
                  : `${suburbName}, Australia`,
                coordinates: [suburbLng, suburbLat],
                distance: distance,
                postcode: postcode,
                polygon: null,
                overlapType: 'point_in_radius'
              });
            }
          }
        }
      }

      // Remove duplicates and sort by distance
      const uniqueSuburbs = Array.from(
        new Map(validSuburbs.map((s) => [s.name.toLowerCase(), s])).values()
      ).sort((a, b) => a.distance - b.distance);

      // If Overpass returned no results, automatically fall back to Mapbox
      if (uniqueSuburbs.length === 0) {
        await fetchSuburbsFallback(locationId, lat, lng, radiusKm);
        return;
      }

      // Cache the results
      suburbCacheRef.current.set(cacheKey, {
        data: uniqueSuburbs,
        timestamp: now,
        center: [lng, lat],
        radius: radiusKm
      });

      // Update the location with suburbs
      setLocations((prev) =>
        prev.map((loc) => {
          if (loc.id === locationId) {
            const updatedLoc = { ...loc, suburbs: uniqueSuburbs };
            // Render suburb polygons on map
            renderSuburbPolygons(locationId, uniqueSuburbs);
            return updatedLoc;
          }
          return loc;
        })
      );
    } catch (error) {
      console.error('Error fetching suburbs with Overpass API:', error);

      // Fallback to Mapbox Geocoding if Overpass fails
      await fetchSuburbsFallback(locationId, lat, lng, radiusKm);
    } finally {
      setLoadingSuburbs((prev) => {
        const newSet = new Set(prev);
        newSet.delete(locationId);
        return newSet;
      });
    }
  };

  // Fallback function using Mapbox Geocoding (simplified version of original)
  const fetchSuburbsFallback = async (
    locationId: string,
    lat: number,
    lng: number,
    radiusKm: number
  ) => {
    try {
      const centerPoint = turf.point([lng, lat]);
      const allSuburbs = new Map();

      // Create more systematic grid points for better coverage
      const gridPoints: [number, number][] = [];

      // Add center point
      gridPoints.push([lng, lat]);

      // Create concentric circles with points
      const rings = Math.max(2, Math.ceil(radiusKm / 8));
      for (let ring = 1; ring <= rings; ring++) {
        const ringRadius = (radiusKm * ring) / rings;
        const pointsInRing = Math.max(8, ring * 6); // More points in outer rings

        for (let i = 0; i < pointsInRing; i++) {
          const angle = (i / pointsInRing) * 2 * Math.PI;
          const pointLng = lng + (ringRadius / 111.32) * Math.cos(angle);
          const pointLat = lat + (ringRadius / 110.54) * Math.sin(angle);

          const distance = calculateDistance(lat, lng, pointLat, pointLng);
          if (distance <= radiusKm) {
            gridPoints.push([pointLng, pointLat]);
          }
        }
      }

      // Query Mapbox Geocoding API for each grid point
      const apiCalls = gridPoints
        .slice(0, 12)
        .map(([pointLng, pointLat]) =>
          fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${pointLng},${pointLat}.json?access_token=${accessToken}&country=au&types=locality,place,neighborhood&limit=3`
          )
        );

      const responses = await Promise.all(apiCalls);
      const dataArrays = await Promise.all(responses.map((r) => r.json()));

      dataArrays.forEach((data) => {
        if (data.features) {
          data.features.forEach((feature: any) => {
            const featurePoint = turf.point(feature.center);
            const distance = turf.distance(centerPoint, featurePoint, { units: 'kilometers' });

            if (distance <= radiusKm && feature.text && feature.text.length > 2) {
              const key = feature.text.toLowerCase().trim();

              if (!allSuburbs.has(key) || distance < allSuburbs.get(key).distance) {
                allSuburbs.set(key, {
                  name: feature.text,
                  fullName: feature.place_name,
                  coordinates: feature.center,
                  distance: distance,
                  polygon: null,
                  overlapType: 'mapbox_fallback'
                });
              }
            }
          });
        }
      });

      const fallbackSuburbs = Array.from(allSuburbs.values()).sort(
        (a, b) => a.distance - b.distance
      );

      setLocations((prev) =>
        prev.map((loc) => {
          if (loc.id === locationId) {
            const updatedLoc = { ...loc, suburbs: fallbackSuburbs };
            // Render suburb polygons (fallback won't have polygons, but keeping consistent)
            renderSuburbPolygons(locationId, fallbackSuburbs);
            return updatedLoc;
          }
          return loc;
        })
      );
    } catch (error) {
      console.error('Fallback method also failed:', error);
      setLocations((prev) =>
        prev.map((loc) => {
          if (loc.id === locationId) {
            return { ...loc, suburbs: [] };
          }
          return loc;
        })
      );
    }
  };

  // Function to calculate distance between two points using Turf.js precision
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const point1 = turf.point([lng1, lat1]);
    const point2 = turf.point([lng2, lat2]);
    return turf.distance(point1, point2, { units: 'kilometers' });
  };

  // Function to create radius circle
  const createRadiusCircle = (locationId: string, lat: number, lng: number, radiusKm: number) => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    const sourceId = `circle-source-${locationId}`;
    const layerId = `circle-layer-${locationId}`;

    // Remove existing layers and source completely
    if (circlesRef.current.has(locationId)) {
      const existingLayerId = circlesRef.current.get(locationId)!;
      // Remove stroke layer first
      if (map.getLayer(`${existingLayerId}-stroke`)) {
        map.removeLayer(`${existingLayerId}-stroke`);
      }
      // Remove fill layer
      if (map.getLayer(existingLayerId)) {
        map.removeLayer(existingLayerId);
      }
      // Remove source
      if (map.getSource(sourceId)) {
        map.removeSource(sourceId);
      }
    }

    // Create circle geometry (approximate circle using polygon)
    const points = 64;
    const coords = [];
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * 2 * Math.PI;
      const radiusInDegrees = radiusKm / 111.32; // approximate conversion
      const x = lng + radiusInDegrees * Math.cos(angle);
      const y = lat + radiusInDegrees * Math.sin(angle);
      coords.push([x, y]);
    }
    coords.push(coords[0]); // close the polygon

    // Add new source
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
      id: layerId,
      type: 'fill',
      source: sourceId,
      paint: {
        'fill-color': '#762c85',
        'fill-opacity': 0.1
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

    circlesRef.current.set(locationId, layerId);
  };

  // Function to update location radius
  const updateLocationRadius = (locationId: string, newRadius: number) => {
    // Clear existing timeout for this location immediately
    const existingTimeout = radiusTimeoutRef.current.get(locationId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Update the location and create radius circle
    setLocations((prev) =>
      prev.map((loc) => {
        if (loc.id === locationId) {
          const updatedLoc = { ...loc, radius: newRadius };
          createRadiusCircle(locationId, loc.lat, loc.lng, newRadius);
          return updatedLoc;
        }
        return loc;
      })
    );

    // Set new timeout to fetch suburbs after 1 second
    const timeout = setTimeout(() => {
      // Get the current location data
      setLocations((currentLocations) => {
        const location = currentLocations.find((loc) => loc.id === locationId);
        if (location) {
          fetchSuburbsInRadius(locationId, location.lat, location.lng, newRadius);
        }
        return currentLocations; // Don't change locations array
      });
    }, 1000);

    radiusTimeoutRef.current.set(locationId, timeout);
  };

  // Search function
  const handleSearch = async (query: string) => {
    if (!query.trim() || !accessToken) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${accessToken}&country=au&limit=5`
      );
      const data = await response.json();
      setSearchResults(data.features || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    }
    setIsSearching(false);
  };

  // Handle search result selection - directly add location
  const handleSearchResultClick = (result: any) => {
    const [lng, lat] = result.center;

    if (mapRef.current) {
      // Zoom to the location
      mapRef.current.flyTo({
        center: [lng, lat],
        zoom: 10
      });

      // Add location directly
      addLocationDirect(lat, lng, result.place_name);
    }

    // Clear search
    setSearchQuery('');
    setSearchResults([]);
  };

  // Function to update marker numbers
  const updateMarkerNumbers = () => {
    setLocations((currentLocations) => {
      currentLocations.forEach((location, index) => {
        const marker = markersRef.current.get(location.id);
        if (marker) {
          const markerElement = marker.getElement();
          const numberDiv = markerElement.querySelector('div');
          if (numberDiv) {
            numberDiv.textContent = (index + 1).toString();
          }
        }
      });
      return currentLocations;
    });
  };

  // Function to add location directly
  const addLocationDirect = (lat: number, lng: number, address: string) => {
    const newLocation: ServiceLocation = {
      id: Math.random().toString(36).substr(2, 9),
      lat,
      lng,
      address,
      radius: 10,
      suburbs: []
    };

    // Add to locations first
    setLocations((prev) => {
      const newLocations = [...prev, newLocation];

      if (mapRef.current) {
        // Create draggable marker with correct number
        const markerNumber = newLocations.length;
        const markerElement = document.createElement('div');
        markerElement.innerHTML = `
          <div style="
            width: 30px;
            height: 30px;
            background: #762c85;
            border: 3px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;
            font-weight: bold;
            cursor: grab;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          ">${markerNumber}</div>
        `;

        const marker = new mapboxgl.Marker(markerElement, { draggable: true })
          .setLngLat([lng, lat])
          .addTo(mapRef.current);

        // Handle drag events
        marker.on('dragend', async () => {
          const lngLat = marker.getLngLat();

          try {
            // Reverse geocode new position
            const response = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${lngLat.lng},${lngLat.lat}.json?access_token=${accessToken}&limit=1&country=au`
            );
            const data = await response.json();

            let newAddress = `${lngLat.lat.toFixed(4)}, ${lngLat.lng.toFixed(4)}`;
            if (data.features && data.features.length > 0) {
              newAddress = data.features[0].place_name;
            }

            // Update location
            setLocations((currentLocations) =>
              currentLocations.map((loc) => {
                if (loc.id === newLocation.id) {
                  const updatedLoc = {
                    ...loc,
                    lat: lngLat.lat,
                    lng: lngLat.lng,
                    address: newAddress
                  };
                  // Update radius circle
                  createRadiusCircle(newLocation.id, lngLat.lat, lngLat.lng, loc.radius);

                  // Fetch suburbs for new location after a short delay
                  setTimeout(() => {
                    fetchSuburbsInRadius(newLocation.id, lngLat.lat, lngLat.lng, loc.radius);
                  }, 1000);

                  return updatedLoc;
                }
                return loc;
              })
            );
          } catch (error) {
            console.error('Error updating location:', error);
          }
        });

        markersRef.current.set(newLocation.id, marker);

        // Create radius circle
        createRadiusCircle(newLocation.id, lat, lng, 10);
      }

      return newLocations;
    });

    // Fetch suburbs after a short delay
    setTimeout(() => {
      fetchSuburbsInRadius(newLocation.id, lat, lng, 10);
    }, 500);
  };

  useEffect(() => {
    if (!mapContainerRef.current || !accessToken || accessToken === 'YOUR_MAPBOX_ACCESS_TOKEN')
      return;

    mapboxgl.accessToken = accessToken;

    // Initialize map
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [149.1244, -35.3075], // Canberra, Australia
      zoom: 4,
      attributionControl: false
    });

    mapRef.current = map;

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Handle map clicks - directly add location
    map.on('click', async (e) => {
      const { lng, lat } = e.lngLat;

      try {
        // Reverse geocode to get address
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${accessToken}&limit=1&country=au`
        );
        const data = await response.json();

        let address = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        if (data.features && data.features.length > 0) {
          address = data.features[0].place_name;
        }

        // Add location directly
        addLocationDirect(lat, lng, address);
      } catch (error) {
        console.error('Error handling map click:', error);
      }
    });

    return () => {
      // Clear all timeouts
      radiusTimeoutRef.current.forEach((timeout) => clearTimeout(timeout));
      radiusTimeoutRef.current.clear();

      if (map) {
        map.remove();
      }
    };
  }, [accessToken]);

  // Update parent component when locations change
  // useEffect(() => {
  //   if (onLocationsUpdate) {
  //     onLocationsUpdate(locations);
  //   }
  // }, [locations, onLocationsUpdate]);

  // Function to remove a location
  const removeLocation = (locationId: string) => {
    // Remove marker
    const marker = markersRef.current.get(locationId);
    if (marker) {
      marker.remove();
      markersRef.current.delete(locationId);
    }

    // Remove circle
    if (circlesRef.current.has(locationId) && mapRef.current) {
      const layerId = circlesRef.current.get(locationId)!;
      if (mapRef.current.getLayer(layerId)) mapRef.current.removeLayer(layerId);
      if (mapRef.current.getLayer(`${layerId}-stroke`))
        mapRef.current.removeLayer(`${layerId}-stroke`);
      if (mapRef.current.getSource(`circle-source-${locationId}`))
        mapRef.current.removeSource(`circle-source-${locationId}`);
      circlesRef.current.delete(locationId);
    }

    // Remove suburb polygons
    if (suburbPolygonsRef.current.has(locationId) && mapRef.current) {
      const suburbLayers = suburbPolygonsRef.current.get(locationId)!;
      suburbLayers.forEach((layerId) => {
        if (mapRef.current!.getLayer(`${layerId}-fill`))
          mapRef.current!.removeLayer(`${layerId}-fill`);
        if (mapRef.current!.getLayer(`${layerId}-stroke`))
          mapRef.current!.removeLayer(`${layerId}-stroke`);
        if (mapRef.current!.getSource(layerId)) mapRef.current!.removeSource(layerId);
      });
      suburbPolygonsRef.current.delete(locationId);
    }

    // Clean up global suburb tracking
    globalSuburbsRef.current.forEach((suburb, key) => {
      suburb.assignedToMarkers.delete(locationId);
      suburb.distances.delete(locationId);

      // Remove suburb from global registry if no markers use it
      if (suburb.assignedToMarkers.size === 0) {
        globalSuburbsRef.current.delete(key);
      }
    });

    // Clear any pending timeout
    const timeout = radiusTimeoutRef.current.get(locationId);
    if (timeout) {
      clearTimeout(timeout);
      radiusTimeoutRef.current.delete(locationId);
    }

    // Remove from locations
    setLocations((prev) => {
      const newLocations = prev.filter((loc) => loc.id !== locationId);
      // Update marker numbers after removal
      setTimeout(() => updateMarkerNumbers(), 100);
      return newLocations;
    });
  };

  if (!accessToken || accessToken === 'YOUR_MAPBOX_ACCESS_TOKEN') {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gray-100 rounded-lg border">
        <div className="text-center p-6">
          <p className="text-gray-600 mb-2">Map requires Mapbox access token</p>
          <p className="text-sm text-gray-500">
            Get your free token at{' '}
            <a
              href="https://mapbox.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              mapbox.com
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Instructions */}
      <div className="text-sm text-gray-600 space-y-1">
        <p>
          Search for locations or click anywhere on the map to add service areas. Drag markers to
          reposition them.
        </p>
        <p className="text-xs">
          Accurate Australian suburb boundaries with geometric intersection detection.
        </p>
      </div>

      {/* Map */}
      <div className="relative">
        <div
          ref={mapContainerRef}
          className="w-full rounded-lg border border-gray-300"
          style={{ height: '400px' }}
        />

        {/* Search Box Overlay */}
        <div className="absolute top-4 left-4 right-4 z-auto pe-10">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for places in Australia..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.length > 2) {
                  handleSearch(e.target.value);
                } else {
                  setSearchResults([]);
                }
              }}
              className="placeholder:font-light w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
            {isSearching && (
              <div className="absolute right-3 top-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              </div>
            )}

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto z-20">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => handleSearchResultClick(result)}
                  >
                    <div className="font-medium text-sm text-gray-900">{result.text}</div>
                    <div className="text-xs text-gray-600">{result.place_name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      {locations.some((loc) => loc.suburbs && loc.suburbs.length > 0) && (
        <div className="bg-gray-50 rounded-lg p-3 border">
          <h4 className="text-xs font-semibold text-gray-700 mb-2">Suburb Detection Info:</h4>
          <div className="flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-400 rounded"></div>
              <span className="text-gray-600">Official Suburbs</span>
            </div>
          </div>
        </div>
      )}

      {/* Location list with radius controls */}
      {locations.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">
            Service Locations ({locations.length})
          </h3>
          <div className="space-y-3">
            {locations.map((location, index) => (
              <div key={location.id} className="p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {location.address}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                        </p>
                      </div>
                      <button
                        onClick={() => removeLocation(location.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>

                    {/* Radius Control */}
                    <div className="mt-3 space-y-2">
                      <label className="text-xs font-medium text-gray-700">
                        Service Radius: {location.radius} km
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="50"
                        value={location.radius}
                        onChange={(e) =>
                          updateLocationRadius(location.id, parseInt(e.target.value))
                        }
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        style={{
                          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(location.radius / 50) * 100}%, #e5e7eb ${(location.radius / 50) * 100}%, #e5e7eb 100%)`
                        }}
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>1km</span>
                        <span>25km</span>
                        <span>50km</span>
                      </div>
                    </div>

                    {/* Suburbs List */}
                    <div className="mt-3">
                      <div className="flex items-center gap-2 mb-2">
                        <label className="text-xs font-medium text-gray-700">
                          Covered Suburbs ({location.suburbs?.length || 0}):
                        </label>
                        {loadingSuburbs.has(location.id) && (
                          <div className="flex gap-4">
                            <div className="animate-spin rounded-full h-3 w-3 border-b border-primary"></div>
                            <div className="text-xs text-primary">Please wait...</div>
                          </div>
                        )}
                      </div>

                      {location.suburbs && location.suburbs.length > 0 ? (
                        <div className="max-h-28 overflow-y-auto bg-gray-100 rounded p-2">
                          <div className="flex flex-wrap gap-1">
                            {location.suburbs
                              .sort((a, b) => a.distance - b.distance)
                              .map((suburb: any, idx: number) => {
                                const colorClass =
                                  suburb.overlapType === 'point_in_radius'
                                    ? 'bg-blue-100 text-blue-800' // Official suburbs from Overpass
                                    : suburb.overlapType === 'mapbox_fallback'
                                      ? 'bg-gray-100 text-gray-800' // Fallback data from Mapbox
                                      : 'bg-blue-100 text-blue-800'; // Default to official
                                return (
                                  <span
                                    key={idx}
                                    className={`inline-block px-2 py-1 text-xs rounded-full ${colorClass}`}
                                    title={`${suburb.fullName} (${suburb.distance.toFixed(1)}km away) - ${suburb.overlapType.replace('_', ' ')}`}
                                  >
                                    {suburb.postcode
                                      ? `${suburb.name} ${suburb.postcode}`
                                      : suburb.name}
                                  </span>
                                );
                              })}
                          </div>
                        </div>
                      ) : !loadingSuburbs.has(location.id) ? (
                        <div className="text-xs text-gray-500 bg-gray-100 rounded p-2">
                          No suburbs found in this radius
                        </div>
                      ) : (
                        <div className="text-xs text-primary bg-gray-100 rounded p-2">
                          Loading suburbs...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapboxLocationSelector;
