import React, { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from "@arcgis/core/Graphic";
import "@arcgis/core/assets/esri/themes/light/main.css";

import styles from "./CarParking.module.css";
import CarsSidebar from "../CarsSidebar/CarsSidebar";
import CarsLoading from "../CarsLoading/CarsLoading";
import { parkings, getAvailableCount } from "../../../data/mockData";
import { haversineDistanceKm } from "../../../utils/geo";

const BAKU_CENTER = { lat: 40.3725, lng: 49.8533 };

const createParkingIcon = (colorHex) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="52" viewBox="0 0 40 52">
      <path d="M20 0C9 0 0 9 0 20c0 13.5 20 32 20 32s20-18.5 20-32C40 9 31 0 20 0z"
            fill="${colorHex}" stroke="white" stroke-width="2"/>
      <circle cx="20" cy="19" r="12.5" fill="white"/>
      <text x="20" y="25" font-size="16" font-weight="bold" font-family="Arial, sans-serif"
            text-anchor="middle" fill="${colorHex}">P</text>
    </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const STATUS_COLORS = {
  green: "#63b814",
  yellow: "#f59e0b",
  red: "#d42727",
};

const CarParking = () => {
  const navigate = useNavigate();

  const mapDivRef = useRef(null);
  const viewRef = useRef(null);
  const parkingLayerRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("loading");
  const [selectedParking, setSelectedParking] = useState(null);
  const [isListOpen, setIsListOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("denied");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocationStatus("granted");
      },
      () => setLocationStatus("denied"),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, []);

  const sortedParkings = useMemo(() => {
    return [...parkings]
      .map((p) => {
        const available = getAvailableCount(p.id);
        const distanceKm = userLocation
          ? haversineDistanceKm(
              userLocation.lat,
              userLocation.lng,
              p.coordinates.lat,
              p.coordinates.lng,
            )
          : null;
        return { ...p, available, distanceKm };
      })
      .sort((a, b) => {
        if (a.distanceKm == null || b.distanceKm == null) return 0;
        return a.distanceKm - b.distanceKm;
      });
  }, [userLocation]);

  // Xəritəni yalnız loading bitib DOM elementi mövcud olduqda qururuq
  useEffect(() => {
    if (isLoading || !mapDivRef.current) return;

    const map = new Map({ basemap: "osm" });

    const view = new MapView({
      container: mapDivRef.current,
      map,
      center: [BAKU_CENTER.lng, BAKU_CENTER.lat],
      zoom: 15,
    });

    const parkingLayer = new GraphicsLayer();
    map.add(parkingLayer);
    parkingLayerRef.current = parkingLayer;

    parkings.forEach((p) => {
      const available = getAvailableCount(p.id);
      const ratio = available / p.totalSpots;
      const colorHex =
        ratio > 0.4
          ? STATUS_COLORS.green
          : ratio > 0.15
            ? STATUS_COLORS.yellow
            : STATUS_COLORS.red;

      const graphic = new Graphic({
        geometry: {
          type: "point",
          longitude: p.coordinates.lng,
          latitude: p.coordinates.lat,
          spatialReference: { wkid: 4326 },
        },
        symbol: {
          type: "picture-marker",
          url: createParkingIcon(colorHex),
          width: "34px",
          height: "44px",
          yoffset: "18px",
        },
        attributes: { parkingId: p.id },
      });
      parkingLayer.add(graphic);
    });

    view.on("click", (event) => {
      view.hitTest(event).then((response) => {
        const result = response.results.find(
          (r) => r.graphic?.attributes?.parkingId,
        );
        if (!result) return;
        const parking = parkings.find(
          (p) => p.id === result.graphic.attributes.parkingId,
        );
        setSelectedParking(parking);
      });
    });

    view.popup.autoOpenEnabled = false;
    viewRef.current = view;

    return () => view.destroy();
  }, [isLoading]);

  useEffect(() => {
    if (!userLocation || !parkingLayerRef.current) return;

    const userGraphic = new Graphic({
      geometry: {
        type: "point",
        longitude: userLocation.lng,
        latitude: userLocation.lat,
        spatialReference: { wkid: 4326 },
      },
      symbol: {
        type: "simple-marker",
        style: "circle",
        color: [239, 68, 68],
        size: 14,
        outline: { color: [255, 255, 255], width: 3 },
      },
      attributes: { isUser: true },
    });
    parkingLayerRef.current.add(userGraphic);
  }, [userLocation]);

  const handleSelectParkingFromList = (parking) => {
    setSelectedParking(parking);
    if (viewRef.current) {
      viewRef.current.goTo(
        {
          center: [parking.coordinates.lng, parking.coordinates.lat],
          zoom: 16,
        },
        { duration: 600 },
      );
    }
  };

  const enterSpotMode = (parkingId) => {
    navigate(`/cars/reservations/${parkingId}`);
  };

  return (
    <div className={styles.page}>
      <CarsSidebar />
      <main className={styles.content}>
        {isLoading ? (
          <CarsLoading />
        ) : (
          <>
            <aside
              className={`${styles.listPanel} ${
                !isListOpen ? styles.listPanelClosed : ""
              }`}
            >
              <div className={styles.listHeader}>
                <h2>Parkinqlər</h2>
                <span className={styles.listSubtitle}>
                  {locationStatus === "loading" && "Lokasiya alınır..."}
                  {locationStatus === "granted" &&
                    "Sizin üçün məsafəyə görə sıralanmış parkinqlər"}
                  {locationStatus === "denied" && "Bütün parkinqlər"}
                </span>
              </div>

              <ul className={styles.list}>
                {sortedParkings.map((p, index) => {
                  const ratio = p.available / p.totalSpots;
                  const badgeClass =
                    ratio > 0.4
                      ? styles.badgeGreen
                      : ratio > 0.15
                        ? styles.badgeYellow
                        : styles.badgeRed;

                  return (
                    <li
                      key={p.id}
                      className={`${styles.listItem} ${
                        selectedParking?.id === p.id
                          ? styles.listItemActive
                          : ""
                      }`}
                      onClick={() => handleSelectParkingFromList(p)}
                    >
                      <div className={styles.listItemTop}>
                        <span className={styles.parkingName}>
                          {index === 0 && p.distanceKm != null && (
                            <span className={styles.nearestTag}>Ən yaxın</span>
                          )}
                          {p.name}
                        </span>
                        <span className={`${styles.badge} ${badgeClass}`}>
                          {p.available}/{p.totalSpots}
                        </span>
                      </div>
                      <div className={styles.listItemBottom}>
                        <span className={styles.address}>{p.address}</span>
                        {p.distanceKm != null && (
                          <span className={styles.distance}>
                            {p.distanceKm.toFixed(1)} km
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </aside>

            <div className={styles.mapWrapper}>
              <button
                className={styles.hamburgerBtn}
                onClick={() => setIsListOpen((prev) => !prev)}
                aria-label="Parkinq siyahısını aç/bağla"
                type="button"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 6h16M4 12h16M4 18h16"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>

              <div ref={mapDivRef} className={styles.mapContainer} />

              {selectedParking && (
                <div className={styles.infoCard}>
                  <button
                    className={styles.closeBtn}
                    onClick={() => setSelectedParking(null)}
                  >
                    ✕
                  </button>
                  <h3>{selectedParking.name}</h3>
                  <p className={styles.infoAddress}>
                    {selectedParking.address}
                  </p>
                  <div className={styles.infoRow}>
                    <span>Boş yer:</span>
                    <strong>
                      {getAvailableCount(selectedParking.id)}/
                      {selectedParking.totalSpots}
                    </strong>
                  </div>
                  <div className={styles.infoRow}>
                    <span>Qiymət:</span>
                    <strong>{selectedParking.pricePerHour} AZN/saat</strong>
                  </div>
                  <div className={styles.infoRow}>
                    <span>İş saatları:</span>
                    <strong>{selectedParking.workingHours}</strong>
                  </div>
                  <button
                    className={styles.enterBtn}
                    onClick={() => enterSpotMode(selectedParking.id)}
                  >
                    Parkinqə keç →
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default CarParking;
