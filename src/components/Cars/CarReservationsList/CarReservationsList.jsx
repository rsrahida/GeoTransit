import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CarReservationsList.module.css";
import CarsSidebar from "../CarsSidebar/CarsSidebar";
import { parkings } from "../../../data/mockData";
import { useReservations } from "../../hooks/useReservations";
import { updateSpotStatusDirect } from "../../hooks/useSpots";

const STATUS_LABELS = {
  active: "Aktiv (davam edir)",
  upcoming: "Planlaşdırılıb",
  completed: "Tamamlanıb",
  pending: "Gözləyir",
  cancelled: "Ləğv olunub",
};

const STATUS_CLASS = {
  active: "statusActive",
  upcoming: "statusPending",
  completed: "statusCompleted",
  pending: "statusPending",
  cancelled: "statusCancelled",
};

function formatDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("az-AZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const s = String(totalSeconds % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

const CarReservationsList = () => {
  const navigate = useNavigate();
  const { reservations, stopReservation } = useReservations();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleStop = (reservation) => {
    const parking = parkings.find((p) => p.id === reservation.parkingId);
    if (!parking) return;

    stopReservation(reservation.id, parking.pricePerHour);
    updateSpotStatusDirect(
      reservation.parkingId,
      reservation.spotId,
      "empty",
      null,
    );
  };

  const sorted = [...reservations].sort(
    (a, b) => new Date(b.startTime) - new Date(a.startTime),
  );

  return (
    <div className={styles.page}>
      <CarsSidebar />
      <main className={styles.content}>
        <div className={styles.topBar}>
          <button
            className={styles.backBtn}
            onClick={() => navigate("/cars/parking")}
          >
            ← Parkinqlərə qayıt
          </button>
        </div>

        {sorted.length === 0 ? (
          <div className={styles.empty}>
            <p>Hələ heç bir rezervasiya yoxdur.</p>
            <button
              className={styles.enterBtn}
              onClick={() => navigate("/cars/parking")}
            >
              Parkinq seç →
            </button>
          </div>
        ) : (
          <ul className={styles.list}>
            {sorted.map((r) => {
              const parking = parkings.find((p) => p.id === r.parkingId);
              const startMs = new Date(r.startTime).getTime();
              const hasStarted = now >= startMs;

              const isRunning = !r.endTime && hasStarted;
              const isWaiting = !r.endTime && !hasStarted;

              let statusKey = STATUS_CLASS[r.status] || "statusPending";
              let statusLabel = STATUS_LABELS[r.status] || r.status;
              if (isRunning) {
                statusKey = "statusActive";
                statusLabel = "Aktiv (davam edir)";
              } else if (isWaiting) {
                statusKey = "statusPending";
                statusLabel = "Planlaşdırılıb";
              }

              return (
                <li key={r.id} className={styles.card}>
                  <div className={styles.cardTop}>
                    <div className={styles.carBlock}>
                      <span className={styles.plate}>{r.car.plate}</span>
                      <span className={styles.carMeta}>
                        {r.car.brand}
                        {r.car.color ? ` · ${r.car.color}` : ""}
                      </span>
                    </div>
                    <span className={`${styles.badge} ${styles[statusKey]}`}>
                      {statusLabel}
                    </span>
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.cardRow}>
                      <span className={styles.rowLabel}>Parkinq</span>
                      <strong>{parking ? parking.name : r.parkingId}</strong>
                    </div>
                    <div className={styles.cardRow}>
                      <span className={styles.rowLabel}>Yer</span>
                      <strong>{r.spotId}</strong>
                    </div>
                    <div className={styles.cardRow}>
                      <span className={styles.rowLabel}>Başlanğıc</span>
                      <strong>{formatDateTime(r.startTime)}</strong>
                    </div>

                    {isWaiting && (
                      <div className={styles.cardRow}>
                        <span className={styles.rowLabel}>
                          Başlamasına qalıb
                        </span>
                        <strong>{formatDuration(startMs - now)}</strong>
                      </div>
                    )}

                    {isRunning && (
                      <div className={styles.cardRow}>
                        <span className={styles.rowLabel}>Keçən vaxt</span>
                        <strong>{formatDuration(now - startMs)}</strong>
                      </div>
                    )}

                    {!isWaiting && !isRunning && (
                      <div className={styles.cardRow}>
                        <span className={styles.rowLabel}>Bitmə</span>
                        <strong>{formatDateTime(r.endTime)}</strong>
                      </div>
                    )}

                    <div className={styles.cardRow}>
                      <span className={styles.rowLabel}>Telefon</span>
                      <strong>{r.car.ownerPhone}</strong>
                    </div>
                  </div>

                  <div className={styles.priceRow}>
                    <span>Qiymət</span>
                    <strong>
                      {r.totalPrice != null
                        ? `${r.totalPrice} AZN`
                        : "Hesablanacaq"}
                    </strong>
                  </div>

                  {isRunning && (
                    <button
                      type="button"
                      className={styles.stopBtn}
                      onClick={() => handleStop(r)}
                    >
                      Dayandır
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
};

export default CarReservationsList;
