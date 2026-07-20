import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from "@arcgis/core/Graphic";
import "@arcgis/core/assets/esri/themes/light/main.css";

import styles from "./CarReservations.module.css";
import CarsSidebar from "../CarsSidebar/CarsSidebar";
import { parkings } from "../../../data/mockData";
import { useSpots } from "../../hooks/useSpots";
import { useReservations } from "../../hooks/useReservations";

const STATUS_COLORS = {
  empty: [34, 197, 94, 0.55],
  occupied: [239, 68, 68, 0.55],
  reserved: [245, 158, 11, 0.55],
};

const CarReservations = () => {
  const { parkingId } = useParams();
  const navigate = useNavigate();

  const parking = parkings.find((p) => p.id === parkingId);
  const { spots, updateSpotStatus } = useSpots(parkingId);
  const { addReservation } = useReservations();

  const mapDivRef = useRef(null);
  const viewRef = useRef(null);
  const graphicsLayerRef = useRef(null);
  const spotsRef = useRef(spots);

  const [selectedSpot, setSelectedSpot] = useState(null);
  const [form, setForm] = useState({
    plate: "",
    brand: "",
    color: "",
    phone: "",
    hours: 1,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    spotsRef.current = spots;
  }, [spots]);

  useEffect(() => {
    if (!parking || !mapDivRef.current) return;

    const map = new Map({ basemap: "osm" });
    const view = new MapView({
      container: mapDivRef.current,
      map,
      center: [parking.coordinates.lng, parking.coordinates.lat],
      zoom: 20.5,
    });

    const graphicsLayer = new GraphicsLayer();
    map.add(graphicsLayer);
    graphicsLayerRef.current = graphicsLayer;

    view.on("click", (event) => {
      view.hitTest(event).then((response) => {
        const result = response.results.find(
          (r) => r.graphic?.attributes?.spotId,
        );
        if (result) {
          const spot = spotsRef.current.find(
            (s) => s.id === result.graphic.attributes.spotId,
          );
          if (spot) {
            setSelectedSpot(spot);
            setForm({ plate: "", brand: "", color: "", phone: "", hours: 1 });
          }
        }
      });
    });

    view.popup.autoOpenEnabled = false;
    viewRef.current = view;

    return () => view.destroy();
  }, [parkingId]);

  useEffect(() => {
    const layer = graphicsLayerRef.current;
    if (!layer) return;

    layer.removeAll();

    spots.forEach((spot) => {
      const graphic = new Graphic({
        geometry: {
          type: "polygon",
          rings: spot.polygon,
          spatialReference: { wkid: 4326 },
        },
        symbol: {
          type: "simple-fill",
          color: STATUS_COLORS[spot.status] || STATUS_COLORS.empty,
          outline: { color: [255, 255, 255], width: 1 },
        },
        attributes: { spotId: spot.id },
      });
      layer.add(graphic);
    });
  }, [spots]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.plate || !form.brand || !form.phone) return;

    setSubmitting(true);

    const hours = Number(form.hours) || 1;
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + hours * 60 * 60 * 1000);

    const reservation = {
      id: `res-${Date.now()}`,
      parkingId: parking.id,
      spotId: selectedSpot.id,
      car: {
        plate: form.plate,
        brand: form.brand,
        color: form.color,
        ownerPhone: form.phone,
      },
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      status: "active",
      totalPrice: hours * parking.pricePerHour,
    };

    addReservation(reservation);
    updateSpotStatus(selectedSpot.id, "occupied", reservation.car);

    setSubmitting(false);
    setSelectedSpot(null);

    navigate("/cars/reservations");
  };

  if (!parking) {
    return (
      <div className={styles.page}>
        <CarsSidebar />
        <main className={styles.content}>
          <p className={styles.notFound}>Parkinq tapılmadı.</p>
          <button
            className={styles.backBtn}
            onClick={() => navigate("/cars/parking")}
          >
            ← Geri qayıt
          </button>
        </main>
      </div>
    );
  }

  const availableCount = spots.filter((s) => s.status === "empty").length;

  return (
    <div className={styles.page}>
      <CarsSidebar />
      <main className={styles.content}>
        <div className={styles.mapWrapper}>
          <div ref={mapDivRef} className={styles.mapContainer} />
        </div>

        <div className={styles.topBar}>
          <div>
            <h2>{parking.name}</h2>
          </div>
        </div>

        <div className={styles.legend}>
          <span>
            <i className={styles.dotGreen} /> Boş
          </span>
          <span>
            <i className={styles.dotRed} /> Dolu
          </span>
          <span>
            <i className={styles.dotYellow} /> Rezerv olunub
          </span>
        </div>

        {selectedSpot && (
          <div
            className={styles.modalOverlay}
            onClick={() => setSelectedSpot(null)}
          >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <button
                className={styles.closeBtn}
                onClick={() => setSelectedSpot(null)}
              >
                ✕
              </button>

              {selectedSpot.status !== "empty" ? (
                <>
                  <h3>Yer {selectedSpot.label}</h3>
                  <p className={styles.occupiedNote}>
                    Bu yer artıq tutulmuşdur
                  </p>
                  {selectedSpot.car && (
                    <div className={styles.infoRow}>
                      <span>Maşın:</span>
                      <strong>{selectedSpot.car.plate}</strong>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <h3>Yer {selectedSpot.label} — Rezervasiya</h3>
                  <form onSubmit={handleSubmit} className={styles.form}>
                    <input
                      placeholder="Dövlət nömrəsi (10-AB-234)"
                      value={form.plate}
                      onChange={(e) =>
                        setForm({ ...form, plate: e.target.value })
                      }
                      required
                    />
                    <input
                      placeholder="Marka (Toyota, BMW...)"
                      value={form.brand}
                      onChange={(e) =>
                        setForm({ ...form, brand: e.target.value })
                      }
                      required
                    />
                    <input
                      placeholder="Rəng"
                      value={form.color}
                      onChange={(e) =>
                        setForm({ ...form, color: e.target.value })
                      }
                    />
                    <input
                      placeholder="Telefon nömrəsi"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      required
                    />
                    <label className={styles.hoursLabel}>
                      Neçə saat:
                      <input
                        type="number"
                        min="1"
                        max="24"
                        value={form.hours}
                        onChange={(e) =>
                          setForm({ ...form, hours: e.target.value })
                        }
                      />
                    </label>

                    <div className={styles.priceRow}>
                      <span>Qiymət:</span>
                      <strong>
                        {(Number(form.hours) || 1) * parking.pricePerHour} AZN
                      </strong>
                    </div>

                    <button
                      type="submit"
                      className={styles.confirmBtn}
                      disabled={submitting}
                    >
                      Rezervasiyanı təsdiqlə
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CarReservations;
