// Disaster Intelligence Multimodal Platform - MapView Component
// Key-free basemaps (Light OSM default, Topo OpenTopoMap, Satellite Esri, Dark OSM CSS-inverted),
// live cursor coordinate readout, flat technical markers, and clean operational styling.

(function() {
  const React = window.React;
  const { useEffect, useRef, useState } = React;

  // Reliable, key-free basemap tile configurations
  const BASE_MAPS = {
    light: {
      name: "Light",
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      className: ""
    },
    terrain: {
      name: "Topo",
      url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
      className: ""
    },
    satellite: {
      name: "Satellite",
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: '&copy; Esri World Imagery',
      className: ""
    },
    dark: {
      name: "Dark",
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      className: "tiles-dark"
    }
  };

  // Hazard color mapping (high contrast for light/topo maps)
  const HAZARD_COLORS = {
    'landslide': '#D9620F',
    'flood': '#0B6E99',
    'heavy rainfall': '#1F4E79',
    'rainfall': '#1F4E79',
    'earthquake': '#B42318',
    'severe weather': '#B98900',
    'weather': '#B98900',
    'river rise': '#0B6E99'
  };

  const MapView = ({
    center = [30.28, 79.05],
    zoom = 8,
    markers = [],
    polygons = [],
    stations = [],
    activeLayers = { events: true, warnings: true, rainfall: true, admin: true },
    showBasemapSwitcher = true,
    defaultBasemap = "light",
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

    const [currentBasemap, setCurrentBasemap] = useState(defaultBasemap || "light");
    const [cursorCoords, setCursorCoords] = useState({ lat: center[0] || 30.28, lon: center[1] || 79.05 });

    // Initialize Map
    useEffect(() => {
      if (!mapContainerRef.current) return;
      if (typeof window.L === "undefined") {
        console.warn("Leaflet library not loaded yet.");
        return;
      }

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

      window.L.control.zoom({ position: 'bottomright' }).addTo(map);

      const basemapConfig = BASE_MAPS[currentBasemap] || BASE_MAPS.light;
      const tiles = window.L.tileLayer(basemapConfig.url, {
        attribution: basemapConfig.attribution,
        maxZoom: 18,
        className: basemapConfig.className || ""
      }).addTo(map);

      tileLayerRef.current = tiles;

      polygonsLayerRef.current = window.L.layerGroup().addTo(map);
      stationsLayerRef.current = window.L.layerGroup().addTo(map);
      markersLayerRef.current = window.L.layerGroup().addTo(map);

      map.on('mousemove', (e) => {
        if (e.latlng) {
          setCursorCoords({ lat: e.latlng.lat, lon: e.latlng.lng });
        }
      });

      mapInstanceRef.current = map;

      const ro = typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.invalidateSize();
            }
          })
        : null;
      if (ro && mapContainerRef.current) {
        ro.observe(mapContainerRef.current);
      }

      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 150);

      return () => {
        if (ro) ro.disconnect();
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      };
    }, []);

    // Handle Basemap Change
    useEffect(() => {
      if (!mapInstanceRef.current) return;
      if (tileLayerRef.current) {
        mapInstanceRef.current.removeLayer(tileLayerRef.current);
      }
      const basemapConfig = BASE_MAPS[currentBasemap] || BASE_MAPS.light;
      const tiles = window.L.tileLayer(basemapConfig.url, {
        attribution: basemapConfig.attribution,
        maxZoom: 18,
        className: basemapConfig.className || ""
      }).addTo(mapInstanceRef.current);
      if (tiles.bringToBack) tiles.bringToBack();
      tileLayerRef.current = tiles;
    }, [currentBasemap]);

    // Handle Center/Zoom changes
    useEffect(() => {
      if (mapInstanceRef.current && center && center.length === 2) {
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
        const color = HAZARD_COLORS[hazardType] || '#D9620F';
        const isCritical = (m.severity || '').toLowerCase() === 'critical';

        // Crisp square/diamond technical marker
        const shapeStyle = isCritical
          ? `width: 12px; height: 12px; transform: rotate(45deg); background-color: #B42318; border: 1.5px solid #FFFFFF; box-shadow: 0 0 0 1px #14171C;`
          : `width: 11px; height: 11px; border-radius: 2px; background-color: ${color}; border: 1.5px solid #FFFFFF; box-shadow: 0 0 0 1px #14171C;`;

        const techIcon = window.L.divIcon({
          className: 'leaflet-marker-pulse',
          html: `<div style="${shapeStyle}"></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6]
        });

        const marker = window.L.marker([lat, lon], { icon: techIcon });

        const title = m.title || m.name || m.hazard_name || "Hazard Event";
        const loc = m.location || m.district || "Uttarakhand";
        const sev = m.severity || "Moderate";
        const idStr = m.event_id || m.id || "EVT-UK";

        marker.bindPopup(`
          <div style="font-family: var(--font-sans); min-width: 190px;">
            <div style="font-family: var(--font-mono); font-size: 10px; color: #5E6675; text-transform: uppercase; letter-spacing: 0.05em;">${idStr} · ${loc}</div>
            <div style="font-weight: 600; font-size: 12px; color: #14171C; margin: 2px 0 4px 0;">${title}</div>
            <div style="font-family: var(--font-mono); font-size: 10px; color: #5E6675; margin-bottom: 6px;">${Number(lat).toFixed(4)}° N, ${Number(lon).toFixed(4)}° E</div>
            <div style="display: flex; gap: 4px; font-family: var(--font-mono); font-size: 10px; text-transform: uppercase;">
              <span style="background: #FDECEA; color: #B42318; padding: 1px 5px; border-left: 2px solid #B42318;">${sev}</span>
              ${m.status ? `<span style="background: #E7F1F6; color: #0B6E99; padding: 1px 5px; border-left: 2px solid #0B6E99;">${m.status}</span>` : ''}
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

      const polys = polygons.length > 0 ? polygons : [
        {
          coords: [[30.55, 78.95], [30.65, 79.15], [30.45, 79.25], [30.35, 79.05]],
          color: '#B42318',
          fillOpacity: 0.16,
          label: 'IMD Red Alert Zone · Rudraprayag-Chamoli'
        },
        {
          coords: [[30.25, 78.85], [30.40, 79.05], [30.28, 79.15], [30.15, 78.95]],
          color: '#B54708',
          fillOpacity: 0.14,
          label: 'Observed Landslide Impact Zone · NH-58 Corridor'
        },
        {
          coords: [[30.30, 78.35], [30.55, 78.55], [30.45, 78.75], [30.20, 78.50]],
          color: '#8F6100',
          fillOpacity: 0.12,
          dashArray: '4, 4',
          label: 'Model Susceptibility Watch · Tehri Garhwal'
        }
      ];

      polys.forEach((p) => {
        const poly = window.L.polygon(p.coords, {
          color: p.color || '#B42318',
          weight: 1.5,
          fillColor: p.color || '#B42318',
          fillOpacity: p.fillOpacity || 0.15,
          dashArray: p.dashArray || null
        });

        if (p.label) {
          poly.bindTooltip(p.label, { sticky: true });
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
            radius: 4.5,
            fillColor: '#0B6E99',
            color: '#FFFFFF',
            weight: 1.5,
            opacity: 1,
            fillOpacity: 0.9
          });

          circle.bindPopup(`
            <div style="font-size: 11px; font-family: var(--font-sans);">
              <div style="font-family: var(--font-mono); font-size: 10px; color: #5E6675;">CWC TELEMETRY GAUGE</div>
              <b>${s.name || s.station_name || "Station"}</b><br/>
              River: ${s.river || "Alaknanda"} · Status: ${s.status || "Operational"}
            </div>
          `);

          stationsLayerRef.current.addLayer(circle);
        });
      }
    }, [stations]);

    return (
      <div className={`relative w-full h-full min-h-[300px] overflow-hidden bg-surface2 border border-line ${className}`} style={{ height }}>
        {/* Leaflet Map Div */}
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />

        {/* Segmented Basemap Switcher (Top-Right) */}
        {showBasemapSwitcher && (
          <div className="absolute top-2.5 right-2.5 z-[400] flex bg-surface border border-line-strong rounded-[2px] divide-x divide-line font-mono text-[10px] uppercase tracking-wider">
            {Object.keys(BASE_MAPS).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setCurrentBasemap(key)}
                className={`px-2 py-1 transition-colors ${
                  currentBasemap === key
                    ? 'bg-ink text-surface font-semibold'
                    : 'text-muted hover:text-ink hover:bg-surface2'
                }`}
              >
                {BASE_MAPS[key].name}
              </button>
            ))}
          </div>
        )}

        {/* Coordinate Crosshair Readout + Compact Legend (Bottom-Left) */}
        <div className="absolute bottom-2.5 left-2.5 z-[400] flex flex-col gap-1 pointer-events-none">
          <div className="hidden sm:flex items-center gap-3 bg-surface/95 border border-line-strong px-2 py-1 font-mono text-[10px] text-ink2">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-crit inline-block rotate-45"></span>
              <span>Crit</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-[#D9620F] inline-block"></span>
              <span>Landslide</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-accent inline-block"></span>
              <span>Flood/Gauge</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-1.5 border border-crit bg-crit/20 inline-block"></span>
              <span>Alert Zone</span>
            </span>
          </div>
          <div className="bg-surface/95 border border-line-strong px-2 py-0.5 font-mono text-[10px] text-ink tabular-nums">
            CURSOR {Number(cursorCoords.lat).toFixed(4)}° N, {Number(cursorCoords.lon).toFixed(4)}° E · EPSG:4326
          </div>
        </div>
      </div>
    );
  };

  window.DisasterComponents = window.DisasterComponents || {};
  window.DisasterComponents.MapView = MapView;
  window.MapView = MapView;
})();
