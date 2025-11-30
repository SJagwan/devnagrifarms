import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";

// Fix Leaflet default icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function PolygonMapEditor({ initialCoordinates, onChange }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const drawnItemsRef = useRef(null);
  const [currentPolygon, setCurrentPolygon] = useState(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map centered on Dehradun, India
    const map = L.map(mapRef.current).setView([30.3165, 78.0322], 12);
    mapInstanceRef.current = map;

    // Add OpenStreetMap tiles (free)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Initialize FeatureGroup for drawn items
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    drawnItemsRef.current = drawnItems;

    // Add draw control - only polygon allowed
    const drawControl = new L.Control.Draw({
      position: "topright",
      draw: {
        polygon: {
          allowIntersection: false,
          drawError: {
            color: "#e74c3c",
            timeout: 1000,
          },
          shapeOptions: {
            stroke: true,
            color: "#3b82f6",
            weight: 4,
            opacity: 0.5,
            fill: true,
            fillColor: "#3b82f6",
            fillOpacity: 0.2,
            clickable: true,
          },
          showArea: true,
          metric: true,
          feet: false,
          repeatMode: false,
        },
        polyline: false,
        circle: false,
        rectangle: false,
        marker: false,
        circlemarker: false,
      },
      edit: {
        featureGroup: drawnItems,
        remove: true,
      },
    });
    map.addControl(drawControl);

    // Handle polygon creation
    map.on(L.Draw.Event.CREATED, (e) => {
      const layer = e.layer;
      drawnItems.clearLayers();
      drawnItems.addLayer(layer);

      const geoJSON = layer.toGeoJSON();
      setCurrentPolygon(geoJSON.geometry);
      if (onChange) {
        onChange(geoJSON.geometry);
      }
    });

    // Handle polygon edit
    map.on(L.Draw.Event.EDITED, (e) => {
      const layers = e.layers;
      layers.eachLayer((layer) => {
        const geoJSON = layer.toGeoJSON();
        setCurrentPolygon(geoJSON.geometry);
        if (onChange) {
          onChange(geoJSON.geometry);
        }
      });
    });

    // Handle polygon delete
    map.on(L.Draw.Event.DELETED, () => {
      setCurrentPolygon(null);
      if (onChange) {
        onChange(null);
      }
    });

    // Load initial coordinates if provided
    if (initialCoordinates) {
      try {
        const geoJSON =
          typeof initialCoordinates === "string"
            ? JSON.parse(initialCoordinates)
            : initialCoordinates;

        if (geoJSON && geoJSON.type === "Polygon" && geoJSON.coordinates) {
          const layer = L.geoJSON(geoJSON, {
            style: {
              color: "#3b82f6",
              fillColor: "#3b82f6",
              fillOpacity: 0.3,
              weight: 2,
            },
          });

          drawnItems.clearLayers();
          layer.eachLayer((l) => drawnItems.addLayer(l));
          map.fitBounds(drawnItems.getBounds(), { padding: [50, 50] });
          setCurrentPolygon(geoJSON);
        }
      } catch (error) {
        console.error("Failed to load initial coordinates:", error);
      }
    }

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map when initialCoordinates change (for edit mode)
  useEffect(() => {
    if (
      !mapInstanceRef.current ||
      !drawnItemsRef.current ||
      !initialCoordinates
    )
      return;

    try {
      const geoJSON =
        typeof initialCoordinates === "string"
          ? JSON.parse(initialCoordinates)
          : initialCoordinates;

      if (geoJSON && geoJSON.type === "Polygon" && geoJSON.coordinates) {
        const layer = L.geoJSON(geoJSON, {
          style: {
            color: "#3b82f6",
            fillColor: "#3b82f6",
            fillOpacity: 0.3,
            weight: 2,
          },
        });

        drawnItemsRef.current.clearLayers();
        layer.eachLayer((l) => drawnItemsRef.current.addLayer(l));
        mapInstanceRef.current.fitBounds(drawnItemsRef.current.getBounds(), {
          padding: [50, 50],
        });
      }
    } catch (error) {
      console.error("Failed to update coordinates:", error);
    }
  }, [initialCoordinates]);

  return (
    <div className="space-y-3">
      <div
        ref={mapRef}
        className="w-full h-96 rounded-lg border-2 border-gray-300 shadow-sm"
        style={{ zIndex: 1 }}
      />
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
        <p className="font-semibold text-blue-900 mb-1">📍 How to use:</p>
        <ul className="text-blue-800 space-y-1 ml-4 list-disc">
          <li>
            <strong>Draw Polygon:</strong> Click the polygon icon (⬟) on the
            right. Click on the map to add corner points (you can add as many
            points as needed).
            <span className="font-semibold text-red-600">
              {" "}
              Click the FIRST point again to close the polygon
            </span>
            , or double-click the last point.
          </li>
          <li>
            <strong>Edit:</strong> Click the edit icon (✎), then drag vertices
            to adjust the shape. Click "Save" when done.
          </li>
          <li>
            <strong>Delete:</strong> Click the trash icon (🗑) to remove the
            polygon and start over.
          </li>
        </ul>
        {currentPolygon && (
          <p className="mt-2 text-green-700 font-medium">
            ✓ Polygon drawn successfully! Coordinates will be saved
            automatically.
          </p>
        )}
      </div>
    </div>
  );
}
