// Disaster Intelligence Multimodal Platform - MapView Component
// Leaflet wrapper with CartoDB Dark Matter, Satellite, Terrain, Light basemaps, Uttarakhand center [30.2, 79.2], hazard markers and polygons

(function() {
  const React = window.React;
  const { useEffect, useRef, useState } = React;

  // Base map tile options
  const BASE_MAPS = {
    dark: {
      name: "Dark Matter",
      url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    },
    satellite: {
      name: "Satellite",
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    },
    terrain: {
      name: "Terrain",
      url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
    },
    light: {
      name: "Light",
      url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>'
    }
  };

  // Hazard color mapping
  const HAZARD_COLORS = {
    'landslide': '#f97316',
    'flood': '#38bdf8',
    'heavy rainfall': '#60a5fa',
    'rainfall': '#60a5fa',
    'earthquake': '#ef4444',
    'severe weather': '#eab308',
    'weather': '#eab308',
    'river rise': '#06b6d4'
  };

  const MapView = ({
    center = [30.2, 79.2],
    zoom = 8,
    markers = [],
    polygons = [],
    stations = [],
    activeLayers = { events: true, warnings: true, rainfall: true, admin: true },
    showBasemapSwitcher = true,
    height = "100%",
    className = "",
    onMarkerClick = null
  }) => {
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const tileLayerRef = useRef(null);
    const markersLayerRef = useRef(null);
    const polygonsLayerRef = useRef(null);
    const stationsLayerRef = useRef(null);

    const [currentBasemap, setCurrentBasemap] = useState("dark");

    // Initialize Map
    useEffect(() => {
      if (!mapContainerRef.current) return;
      if (typeof window.L === "undefined") {
        console.warn("Leaflet library not loaded yet.");
        return;
      }

      // Cleanup existing map if any
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = window.L.map(mapContainerRef.current, {
        center: center,
        zoom: zoom,
        zoomControl: false,
        attributionControl: true
      });

      // Add Zoom Control to bottom-right or top-right
      window.L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Tile layer
      const basemapConfig = BASE_MAPS[currentBasemap] || BASE_MAPS.dark;
      const tiles = window.L.tileLayer(basemapConfig.url, {
        attribution: basemapConfig.attribution,
        maxZoom: 18,
        subdomains: 'abcd'
      }).addTo(map);

      tileLayerRef.current = tiles;

      // Feature Layer Groups
      polygonsLayerRef.current = window.L.layerGroup().addTo(map);
      stationsLayerRef.current = window.L.layerGroup().addTo(map);
      markersLayerRef.current = window.L.layerGroup().addTo(map);

      mapInstanceRef.current = map;

      // Trigger resize after slight delay
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 150);

      return () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      };
    }, []);

    // Handle Basemap Change
    useEffect(() => {
      if (!mapInstanceRef.current || !tileLayerRef.current) return;
      const basemapConfig = BASE_MAPS[currentBasemap] || BASE_MAPS.dark;
      tileLayerRef.current.setUrl(basemapConfig.url);
    }, [currentBasemap]);

    // Handle Center/Zoom changes
    useEffect(() => {
      if (mapInstanceRef.current && center) {
        mapInstanceRef.current.setView(center, zoom);
      }
    }, [center[0], center[1], zoom]);

    // Render Markers & Hazard Beacons
    useEffect(() => {
      if (!mapInstanceRef.current || !markersLayerRef.current || typeof window.L === "undefined") return;

      markersLayerRef.current.clearLayers();

      if (!activeLayers.events) return;

      markers.forEach((m) => {
        const lat = m.latitude || m.lat || (m.coordinates && m.coordinates[1]);
        const lon = m.longitude || m.lon || (m.coordinates && m.coordinates[0]);
        if (!lat || !lon) return;

        const hazardType = String(m.hazard || m.hazard_name || 'landslide').toLowerCase();
        const color = HAZARD_COLORS[hazardType] || '#f97316';
        const isCritical = (m.severity || '').toLowerCase() === 'critical';

        // Animated pulse marker
        const pulseIcon = window.L.divIcon({
          className: 'leaflet-marker-pulse',
          html: `<div style="width: 14px; height: 14px; border-radius: 50%; background-color: ${color}; border: 2px solid #ffffff; box-shadow: 0 0 10px ${color};"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        });

        const marker = window.L.marker([lat, lon], { icon: pulseIcon });

        const title = m.title || m.name || m.hazard_name || "Hazard Event";
        const loc = m.location || m.district || "Uttarakhand";
        const sev = m.severity || "Moderate";

        marker.bindPopup(`
          <div style="font-family: inherit;">
            <div style="font-weight: 700; font-size: 13px; color: #f8fafc; margin-bottom: 4px;">${title}</div>
            <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">📍 ${loc}</div>
            <div style="display: flex; gap: 6px; font-size: 11px;">
              <span style="background: rgba(249, 115, 22, 0.2); color: ${color}; padding: 2px 6px; border-radius: 4px; font-weight: 600;">${sev}</span>
              ${m.status ? `<span style="background: rgba(56, 189, 248, 0.2); color: #38bdf8; padding: 2px 6px; border-radius: 4px;">${m.status}</span>` : ''}
            </div>
          </div>
        `);

        if (onMarkerClick) {
          marker.on('click', () => onMarkerClick(m));
        }

        markersLayerRef.current.addLayer(marker);
      });
    }, [markers, activeLayers.events]);

    // Render Risk Polygons
    useEffect(() => {
      if (!mapInstanceRef.current || !polygonsLayerRef.current || typeof window.L === "undefined") return;

      polygonsLayerRef.current.clearLayers();

      if (!activeLayers.warnings) return;

      // Default sample polygons if none passed
      const polys = polygons.length > 0 ? polygons : [
        // Red warning polygon around Rudraprayag / Kedarnath valley
        {
          coords: [[30.55, 78.95], [30.65, 79.15], [30.45, 79.25], [30.35, 79.05]],
          color: '#ef4444',
          fillOpacity: 0.25,
          label: 'Official Red Alert Zone: Rudraprayag-Chamoli'
        },
        // Orange observed affected area
        {
          coords: [[30.25, 78.85], [30.40, 79.05], [30.28, 79.15], [30.15, 78.95]],
          color: '#f97316',
          fillOpacity: 0.20,
          label: 'Observed Landslide Debris Area (NH-58)'
        },
        // Yellow forecast at-risk area
        {
          coords: [[30.30, 78.35], [30.55, 78.55], [30.45, 78.75], [30.20, 78.50]],
          color: '#eab308',
          fillOpacity: 0.15,
          dashArray: '4, 4',
          label: 'Forecast At-Risk Zone: Tehri Garhwal'
        }
      ];

      polys.forEach((p) => {
        const poly = window.L.polygon(p.coords, {
          color: p.color || '#ef4444',
          weight: 2,
          fillColor: p.color || '#ef4444',
          fillOpacity: p.fillOpacity || 0.2,
          dashArray: p.dashArray || null
        });

        if (p.label) {
          poly.bindTooltip(p.label, { sticky: true, className: 'leaflet-tooltip-dark' });
        }

        polygonsLayerRef.current.addLayer(poly);
      });
    }, [polygons, activeLayers.warnings]);

    // Render Hydrological CWC / IMD Stations
    useEffect(() => {
      if (!mapInstanceRef.current || !stationsLayerRef.current || typeof window.L === "undefined") return;

      stationsLayerRef.current.clearLayers();

      if (stations && stations.length > 0) {
        stations.forEach((s) => {
          const lat = s.lat || (s.coordinates && s.coordinates[1]);
          const lon = s.lon || (s.coordinates && s.coordinates[0]);
          if (!lat || !lon) return;

          const circle = window.L.circleMarker([lat, lon], {
            radius: 5,
            fillColor: '#06b6d4',
            color: '#ffffff',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
          });

          circle.bindPopup(`
            <div style="font-size: 11px;">
              <b>Station:</b> ${s.name || s.station_name || "Telemetry Station"}<br/>
              <b>River:</b> ${s.river || "Alaknanda"}<br/>
              <b>Status:</b> ${s.status || "Active Telemetry"}
            </div>
          `);

          stationsLayerRef.current.addLayer(circle);
        });
      }
    }, [stations]);

    return (
      <div className={`relative w-full h-full min-h-[300px] overflow-hidden rounded-xl border border-slate-700/70 ${className}`} style={{ height }}>
        {/* Leaflet Map Div */}
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Basemap Switcher */}
        {showBasemapSwitcher && (
          <div className="absolute top-3 right-3 z-[400] flex bg-slate-900/85 backdrop-blur-md border border-slate-700/80 rounded-lg p-1 shadow-lg text-[11px] gap-1">
            {Object.keys(BASE_MAPS).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setCurrentBasemap(key)}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  currentBasemap === key
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {BASE_MAPS[key].name}
              </button>
            ))}
          </div>
        )}

        {/* Floating Map Legend (Bottom-Left) */}
        <div className="absolute bottom-3 left-3 z-[400] hidden sm:flex flex-col bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg p-2.5 shadow-lg text-[11px] text-slate-300 gap-1.5 max-w-[200px]">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Map Legend</div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0"></span>
            <span className="truncate">Landslide Event</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shrink-0"></span>
            <span className="truncate">Flood / River Rise</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0"></span>
            <span className="truncate">Earthquake / Severe Alert</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-2 border border-red-500 bg-red-500/30 rounded-sm shrink-0"></span>
            <span className="truncate">Warning Zone</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-2 border border-orange-500 bg-orange-500/25 rounded-sm shrink-0"></span>
            <span className="truncate">Observed Impact</span>
          </div>
        </div>
      </div>
    );
  };

  window.DisasterComponents = window.DisasterComponents || {};
  window.DisasterComponents.MapView = MapView;
  window.MapView = MapView;
})();
