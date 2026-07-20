import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CarReservationsList.module.css";
import CarsSidebar from "../CarsSidebar/CarsSidebar";
import { parkings } from "../../../data/mockData";
import { useReservations } from "../../hooks/useReservations";

const STATUS_LABELS = {
  active: "Aktiv",
  completed: "Tamamlanıb",
  pending: "Gözləyir",
  cancelled: "Ləğv olunub",
};

const STATUS_CLASS = {
  active: "statusActive",
  completed: "statusCompleted",
  pending: "statusPending",
  cancelled: "statusCancelled",
};

function formatDateTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString("az-AZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const CarReservationsList = () => {
  const navigate = useNavigate();
  const { reservations } = useReservations();

  const sorted = [...reservations].sort(
    (a, b) => new Date(b.startTime) - new Date(a.startTime)
  );

  return (
    <div className={styles.page}>
      <CarsSidebar />
      <main className={styles.content}>
        <div className={styles.topBar}>
          <button className={styles.backBtn} onClick={() => navigate("/cars/parking")}>
            ← Parkinqlərə qayıt
          </button>
          <div>
            <h2>Rezervasiyalar</h2>
            <span className={styles.subtitle}>{reservations.length} rezervasiya</span>
          </div>
        </div>

        {sorted.length === 0 ? (
          <div className={styles.empty}>
            <p>Hələ heç bir rezervasiya yoxdur.</p>
            <button className={styles.enterBtn} onClick={() => navigate("/cars/parking")}>
              Parkinq seç →
            </button>
          </div>
        ) : (
          <ul className={styles.list}>
            {sorted.map((r) => {
              const parking = parkings.find((p) => p.id === r.parkingId);
              const statusKey = STATUS_CLASS[r.status] || "statusPending";

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
                      {STATUS_LABELS[r.status] || r.status}
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
                      <span className={styles.rowLabel}>Başlama</span>
                      <strong>{formatDateTime(r.startTime)}</strong>
                    </div>
                    <div className={styles.cardRow}>
                      <span className={styles.rowLabel}>Bitmə</span>
                      <strong>{formatDateTime(r.endTime)}</strong>
                    </div>
                    <div className={styles.cardRow}>
                      <span className={styles.rowLabel}>Telefon</span>
                      <strong>{r.car.ownerPhone}</strong>
                    </div>
                  </div>

                  <div className={styles.priceRow}>
                    <span>Qiymət</span>
                    <strong>{r.totalPrice} AZN</strong>
                  </div>
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