import React, { useEffect, useRef, useState } from "react";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from "@arcgis/core/Graphic";
import Polyline from "@arcgis/core/geometry/Polyline";
import "@arcgis/core/assets/esri/themes/light/main.css";

import { busRoutesData } from "../../../data/busRoutesData";
import { fetchRouteGeometry } from "../../../services/osrmService";
import { findBusStopsAlongRoute } from "../../../services/overpassService";
import BusSidebar from "../BusSidebar/BusSidebar";
import BusLoading from "../BusLoading/BusLoading";
import styles from "./BusMap.module.css";

const BusMap = () => {
  const mapDivRef = useRef(null);
  const viewRef = useRef(null);
  const layersRef = useRef({}); 
  const loadedRoutesRef = useRef(new Set()); 

  const [isMapReady, setIsMapReady] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [loadingRouteId, setLoadingRouteId] = useState(null);
  const [status, setStatus] = useState("");

  
  useEffect(() => {
    const map = new Map({ basemap: "osm" });

    const view = new MapView({
      container: mapDivRef.current,
      map: map,
      center: [49.8671, 40.3891],
      zoom: 12,
    });

    viewRef.current = view;

    busRoutesData.forEach((route) => {
      const layer = new GraphicsLayer({ visible: false });
      layersRef.current[route.id] = layer;
      map.add(layer);
    });

    view.when(() => {
      setIsMapReady(true);
      if (busRoutesData.length > 0) {
        selectRoute(busRoutesData[0].id);
      }
    });

    return () => {
      if (viewRef.current) viewRef.current.destroy();
    };
  }, []);

  const selectRoute = async (routeId) => {
    const route = busRoutesData.find((r) => r.id === routeId);
    if (!route) return;
    Object.entries(layersRef.current).forEach(([id, layer]) => {
      layer.visible = id === routeId;
    });

    setSelectedRouteId(routeId);

    const layer = layersRef.current[routeId];

    if (loadedRoutesRef.current.has(routeId)) {
      zoomToLayer(layer);
      return; 
    }
    try {
      setLoadingRouteId(routeId);
      setStatus(`${route.name} — marşrut hesablanır...`);

      const routeGeometry = await fetchRouteGeometry(route.start, route.end);
      drawBusRoute(layer, routeGeometry.coordinates, route.color);

      setStatus(`${route.name} — dayanacaqlar tapılır...`);
      const stops = await findBusStopsAlongRoute(routeGeometry.coordinates, 40);
      drawStops(layer, stops);

      loadedRoutesRef.current.add(routeId);
      setStatus(`${route.name} — hazırdır (${stops.length} dayanacaq)`);
      zoomToLayer(layer);
    } catch (err) {
      console.error(`${route.name} yüklənərkən xəta:`, err);
      setStatus(`Xəta: ${err.message}`);
    } finally {
      setLoadingRouteId(null);
    }
  };

  const zoomToLayer = (layer) => {
    if (viewRef.current && layer.graphics.length > 0) {
      viewRef.current.goTo(layer.graphics, { duration: 600 }).catch(() => {});
    }
  };

  const drawBusRoute = (layer, coordinates, color) => {
    const polyline = new Polyline({
      paths: [coordinates],
      spatialReference: { wkid: 4326 },
    });

    layer.add(
      new Graphic({
        geometry: polyline,
        symbol: {
          type: "simple-line",
          color: color,
          width: 4,
          cap: "round",
          join: "round",
        },
      }),
    );
  };

  const drawStops = (layer, stops) => {
    stops.forEach((stop) => {
      layer.add(
        new Graphic({
          geometry: { type: "point", longitude: stop.lon, latitude: stop.lat },
          symbol: {
            type: "simple-marker",
            color: "#ffffff",
            size: 9,
            outline: { color: "#222222", width: 1.5 },
          },
          attributes: { name: stop.name },
          popupTemplate: { title: "{name}" },
        }),
      );
    });
  };

  return (
    <div className={styles.pageLayout}>
      <BusSidebar />

      <div className={styles.mapWrapper}>
        {!isMapReady && <BusLoading />}
        {status && <div className={styles.statusBar}>{status}</div>}
        <div ref={mapDivRef} className={styles.mapContainer}></div>
      </div>

      <aside className={styles.routePanel}>
        <div className={styles.routePanelHeader}>
          <h3>Marşrutlar</h3>
          <span>{busRoutesData.length} marşrut</span>
        </div>

        <div className={styles.routeList}>
          {busRoutesData.map((route) => {
            const isActive = route.id === selectedRouteId;
            const isLoadingThis = route.id === loadingRouteId;

            return (
              <button
                key={route.id}
                className={`${styles.routeItem} ${isActive ? styles.routeItemActive : ""}`}
                onClick={() => selectRoute(route.id)}
                disabled={isLoadingThis}
              >
                <span
                  className={styles.routeBadge}
                  style={{ background: route.color }}
                >
                  {route.id.replace("route-", "")}
                </span>
                <span className={styles.routeName}>{route.name}</span>
                {isLoadingThis && <span className={styles.routeSpinner} />}
              </button>
            );
          })}
        </div>
      </aside>
    </div>
  );
};

export default BusMap;
