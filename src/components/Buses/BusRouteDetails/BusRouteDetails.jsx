import React, { useEffect, useRef, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from "@arcgis/core/Graphic";
import Polyline from "@arcgis/core/geometry/Polyline";
import "@arcgis/core/assets/esri/themes/light/main.css";

import { busRoutesData } from "../../../data/busRoutesData";
import { fetchRouteGeometry } from "../../../services/osrmService";
import { findBusStopsAlongRoute } from "../../../services/overpassService";
import { dedupeStopsByName } from "../../../utils/stopUtils";
import BusSidebar from "../BusSidebar/BusSidebar";
import BusLoading from "../BusLoading/BusLoading";
import styles from "./BusRouteDetails.module.css";

const DAY_LABELS = {
  mon: "B.e",
  tue: "Ç.a",
  wed: "Çər",
  thu: "C.a",
  fri: "Cüm",
  sat: "Şən",
  sun: "B",
};

const VEHICLE_LABELS = {
  electric: "Elektrik",
  diesel: "Dizel",
  hybrid: "Hibrid",
};

const TYPE_LABELS = {
  standart: "Standart",
  ekspres: "Ekspres",
  gecə: "Gecə",
};

const CROWD_LABELS = {
  low: "Az sıxlıq",
  medium: "Orta sıxlıq",
  high: "Yüksək sıxlıq",
};

const formatDistance = (meters) =>
  meters == null ? "—" : `${(meters / 1000).toFixed(1)} km`;

const formatDuration = (seconds) =>
  seconds == null ? "—" : `${Math.round(seconds / 60)} dəq`;

const formatMoney = (value) => `${value.toFixed(2)} ₼`;

const BusRouteDetails = () => {
  const { routeId } = useParams();
  const navigate = useNavigate();

  const mapDivRef = useRef(null);
  const viewRef = useRef(null);
  const layerRef = useRef(null);

  const [route, setRoute] = useState(null);
  const [stops, setStops] = useState([]);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStopId, setActiveStopId] = useState(null);
  const [activeTab, setActiveTab] = useState("stops");

  useEffect(() => {
    const found = busRoutesData.find((r) => r.id === routeId);
    if (!found) {
      setError("Marşrut tapılmadı");
      setIsLoading(false);
      return;
    }
    setError(null);
    setRoute(found);
    setActiveTab("stops");
    setActiveStopId(null);
  }, [routeId]);

  useEffect(() => {
    if (!route) return;

    const map = new Map({ basemap: "osm" });
    const view = new MapView({
      container: mapDivRef.current,
      map,
      center: [route.start.lon, route.start.lat],
      zoom: 13,
    });
    viewRef.current = view;

    const layer = new GraphicsLayer();
    layerRef.current = layer;
    map.add(layer);

    let cancelled = false;

    (async () => {
      try {
        setIsLoading(true);

        const geometry = await fetchRouteGeometry(route.start, route.end);
        if (cancelled) return;

        setDistance(geometry.distance);
        setDuration(geometry.duration);

        layer.add(
          new Graphic({
            geometry: new Polyline({
              paths: [geometry.coordinates],
              spatialReference: { wkid: 4326 },
            }),
            symbol: {
              type: "simple-line",
              color: route.color,
              width: 5,
              cap: "round",
              join: "round",
            },
          }),
        );

        const rawStops = await findBusStopsAlongRoute(geometry.coordinates, 40);
        if (cancelled) return;

        const foundStops = dedupeStopsByName(rawStops);
        setStops(foundStops);

        foundStops.forEach((stop) => {
          layer.add(
            new Graphic({
              geometry: {
                type: "point",
                longitude: stop.lon,
                latitude: stop.lat,
              },
              symbol: {
                type: "simple-marker",
                color: "#ffffff",
                size: 9,
                outline: { color: route.color, width: 2 },
              },
              attributes: { id: stop.id, name: stop.name },
              popupTemplate: { title: "{name}" },
            }),
          );
        });

        await view.when();
        if (!cancelled && layer.graphics.length > 0) {
          view.goTo(layer.graphics, { duration: 600 }).catch(() => {});
        }
      } catch (err) {
        console.error("Marşrut detalları yüklənərkən xəta:", err);
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      view.destroy();
    };
  }, [route]);

  const handleStopClick = (stop) => {
    setActiveStopId(stop.id);
    const graphic = layerRef.current?.graphics.find(
      (g) => g.attributes?.id === stop.id,
    );
    if (graphic && viewRef.current) {
      viewRef.current
        .goTo({ target: graphic.geometry, zoom: 16 }, { duration: 400 })
        .catch(() => {});
      viewRef.current.openPopup({
        features: [graphic],
        location: graphic.geometry,
      });
    }
  };

  if (error) {
    return (
      <div className={styles.pageLayout}>
        <BusSidebar />
        <div className={styles.errorState}>
          <p>{error}</p>
          <button onClick={() => navigate("/buses/map")}>Xəritəyə qayıt</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageLayout}>
      <BusSidebar />

      <div className={styles.content}>
        <div className={styles.body}>
          <div className={styles.mapWrapper}>
            {isLoading && <BusLoading />}
            <div ref={mapDivRef} className={styles.mapContainer}></div>

            {route && (
              <header
                className={styles.hero}
                style={{ "--route-color": route.color }}
              >
                <div className={styles.heroTop}>
                  <span className={styles.badge}>
                    {route.id.replace("route-", "")}
                  </span>
                  <h1 className={styles.routeName}>{route.name}</h1>
                </div>

                <div className={styles.statsRow}>
                  <div className={styles.stat}>
                    <span className={styles.statValue}>
                      {formatDistance(distance)}
                    </span>
                    <span className={styles.statLabel}>ümumi məsafə</span>
                  </div>
                  <div className={styles.statDivider} />
                  <div className={styles.stat}>
                    <span className={styles.statValue}>
                      {formatDuration(duration)}
                    </span>
                    <span className={styles.statLabel}>müddət</span>
                  </div>
                  <div className={styles.statDivider} />
                  <div className={styles.stat}>
                    <span className={styles.statValue}>{stops.length}</span>
                    <span className={styles.statLabel}>dayanacaq</span>
                  </div>
                </div>
              </header>
            )}
          </div>

          <aside className={styles.detailsPanel}>
            <div className={styles.tabSwitcher}>
              <button
                className={`${styles.tabButton} ${
                  activeTab === "stops" ? styles.tabButtonActive : ""
                }`}
                onClick={() => setActiveTab("stops")}
              >
                Dayanacaqlar{" "}
                <span className={styles.tabCount}>{stops.length}</span>
              </button>
              <button
                className={`${styles.tabButton} ${
                  activeTab === "info" ? styles.tabButtonActive : ""
                }`}
                onClick={() => setActiveTab("info")}
              >
                Məlumat
              </button>
            </div>

            {activeTab === "stops" ? (
              <div className={styles.stopsList}>
                {stops.map((stop, index) => (
                  <button
                    key={stop.id}
                    className={`${styles.stopItem} ${
                      activeStopId === stop.id ? styles.stopItemActive : ""
                    }`}
                    onClick={() => handleStopClick(stop)}
                  >
                    <span className={styles.stopIndex}>{index + 1}</span>
                    <span className={styles.stopName}>{stop.name}</span>
                  </button>
                ))}
              </div>
            ) : (
              route && (
                <div className={styles.infoContent}>
                  <p className={styles.infoDescription}>{route.description}</p>

                  <div className={styles.ratingRow}>
                    <span className={styles.ratingValue}>
                      {route.rating.toFixed(1)}
                    </span>
                    <span className={styles.reviewCount}>
                      ({route.reviewCount} rəy)
                    </span>
                  </div>

                  <div className={styles.statGrid}>
                    <div className={styles.statGridItem}>
                      <span className={styles.statGridLabel}>Tezlik</span>
                      <span className={styles.statGridValue}>
                        {route.frequencyMinutes} dəq
                      </span>
                    </div>
                    <div className={styles.statGridItem}>
                      <span className={styles.statGridLabel}>İş saatları</span>
                      <span className={styles.statGridValue}>
                        {route.firstDeparture}–{route.lastDeparture}
                      </span>
                    </div>
                    <div className={styles.statGridItem}>
                      <span className={styles.statGridLabel}>
                        Bilet qiyməti
                      </span>
                      <span className={styles.statGridValue}>
                        {formatMoney(route.ticketPrice)}
                      </span>
                    </div>
                    <div className={styles.statGridItem}>
                      <span className={styles.statGridLabel}>Nəqliyyat</span>
                      <span className={styles.statGridValue}>
                        {VEHICLE_LABELS[route.vehicleType]}
                      </span>
                    </div>
                    <div className={styles.statGridItem}>
                      <span className={styles.statGridLabel}>Tutum</span>
                      <span className={styles.statGridValue}>
                        {route.capacity} yer
                      </span>
                    </div>
                    <div className={styles.statGridItem}>
                      <span className={styles.statGridLabel}>
                        Gündəlik sərnişin
                      </span>
                      <span className={styles.statGridValue}>
                        {route.avgDailyPassengers.toLocaleString("az-AZ")}
                      </span>
                    </div>
                  </div>

                  <div className={styles.daysRow}>
                    {Object.entries(DAY_LABELS).map(([key, label]) => (
                      <span
                        key={key}
                        className={`${styles.dayPill} ${
                          route.operatingDays.includes(key)
                            ? styles.dayPillActive
                            : ""
                        }`}
                      >
                        {label}
                      </span>
                    ))}
                  </div>

                  {(route.metroConnections.length > 0 ||
                    route.connectingRoutes.length > 0) && (
                    <>
                      {route.metroConnections.length > 0 && (
                        <div className={styles.connectionsSection}>
                          <span className={styles.sectionLabel}>
                            Metro qovşaqları
                          </span>
                          <div className={styles.chipRow}>
                            {route.metroConnections.map((m) => (
                              <span key={m} className={styles.chip}>
                                {m}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {route.connectingRoutes.length > 0 && (
                        <div className={styles.connectionsSection}>
                          <span className={styles.sectionLabel}>
                            Bağlantılı marşrutlar
                          </span>
                          <div className={styles.chipRow}>
                            {route.connectingRoutes.map((rid) => {
                              const r = busRoutesData.find((x) => x.id === rid);
                              return r ? (
                                <button
                                  key={rid}
                                  className={styles.chipLink}
                                  onClick={() =>
                                    navigate(`/buses/route/${rid}`)
                                  }
                                >
                                  {r.name}
                                </button>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {route.alerts.length > 0 && (
                    <div className={styles.alertsSection}>
                      {route.alerts.map((a, i) => (
                        <div
                          key={i}
                          className={`${styles.alertCard} ${
                            styles[`alert-${a.type}`]
                          }`}
                        >
                          <span className={styles.alertMessage}>
                            {a.message}
                          </span>
                          <span className={styles.alertDates}>
                            {a.from} – {a.to}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default BusRouteDetails;
