import React from "react";
import styles from "./Cars.module.css";
import CarsSidebar from "./CarsSidebar/CarsSidebar";
import {
  parkings as mockParkings,
  parkingSpots,
  getAvailableCount,
} from "../../data/mockData";
import { seedIfEmpty } from "../../services/storage";
import { useReservations } from "../../components/hooks/useReservations";

const PARKINGS_KEY = "parkings";

const STATUS_LABELS = {
  active: "Aktiv",
  upcoming: "Gözlənilən",
  completed: "Tamamlanıb",
  cancelled: "Ləğv edilib",
};

const STATUS_ACCENT = {
  active: styles.accentAmber,
  upcoming: styles.accentCyan,
  completed: "",
  cancelled: styles.accentRed,
};

const RESERVATION_FILTERS = [
  { key: "all", label: "Hamısı" },
  { key: "active", label: "Aktiv" },
  { key: "upcoming", label: "Gözlənilən" },
  { key: "completed", label: "Tamamlanıb" },
  { key: "cancelled", label: "Ləğv edilib" },
];

function formatTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("az-AZ", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPrice(price) {
  return price != null ? `${price.toFixed(2)} ₼` : "—";
}

function getAvailable(p) {
  return parkingSpots[p.id] ? getAvailableCount(p.id) : p.totalSpots;
}

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <circle cx="10.5" cy="10.5" r="6" stroke="currentColor" strokeWidth="1.8" />
    <path
      d="M19 19l-4.3-4.3"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const StopIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
    <rect x="5" y="5" width="14" height="14" rx="2" fill="currentColor" />
  </svg>
);

const Cars = () => {
  const [parkingList] = React.useState(() =>
    seedIfEmpty(
      PARKINGS_KEY,
      mockParkings.map((p) => ({ ...p, isActive: true })),
    ),
  );
  const [search, setSearch] = React.useState("");

  const { reservations, stopReservation } = useReservations();
  const [resSearch, setResSearch] = React.useState("");
  const [resStatusFilter, setResStatusFilter] = React.useState("all");

  const activeParkings = parkingList.filter((p) => p.isActive);
  const activeTotalSpots = activeParkings.reduce(
    (sum, p) => sum + p.totalSpots,
    0,
  );
  const activeAvailable = activeParkings.reduce(
    (sum, p) => sum + getAvailable(p),
    0,
  );
  const liveOccupancy =
    activeTotalSpots > 0
      ? Math.round(
          ((activeTotalSpots - activeAvailable) / activeTotalSpots) * 100,
        )
      : 0;
  const activeReservationCount = reservations.filter(
    (r) => r.status === "active",
  ).length;
  const pausedCount = parkingList.filter((p) => !p.isActive).length;
  const evCount = parkingList.filter((p) => p.hasEV).length;
  const disabledCount = parkingList.filter((p) => p.hasDisabledSpots).length;

  const parkingById = Object.fromEntries(parkingList.map((p) => [p.id, p]));

  const filteredParkings = parkingList.filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q)
    );
  });

  const sortedReservations = [...reservations].sort(
    (a, b) => new Date(b.startTime) - new Date(a.startTime),
  );

  const filteredReservations = sortedReservations.filter((r) => {
    const matchesStatus =
      resStatusFilter === "all" || r.status === resStatusFilter;
    if (!matchesStatus) return false;

    const q = resSearch.trim().toLowerCase();
    if (!q) return true;
    const parkingName = parkingById[r.parkingId]?.name || "";
    return (
      r.car.plate.toLowerCase().includes(q) ||
      r.car.brand.toLowerCase().includes(q) ||
      parkingName.toLowerCase().includes(q)
    );
  });

  const handleStopReservation = (r) => {
    const parking = parkingById[r.parkingId];
    stopReservation(r.id, parking?.pricePerHour || 0);
  };

  return (
    <div className={styles.page}>
      <CarsSidebar />
      <main className={styles.content}>
        <div className={styles.topBar}>
          <div>
            <h2>Ümumi baxış</h2>
            <span className={styles.subtitle}>Canlı məlumat</span>
          </div>
        </div>

        <div className={styles.chartsGrid}>
          <div className={`${styles.chartCard} ${styles.chartWide}`}>
            <div className={styles.chartHeader}>
              <h3>Rezervasiyalar</h3>
              <span>
                {filteredReservations.length} / {reservations.length} qeyd
              </span>
            </div>

            <div className={styles.resToolbar}>
              <div className={styles.searchWrap}>
                <SearchIcon />
                <input
                  type="text"
                  placeholder="Nömrə, marka və ya parkinq üzrə axtar..."
                  value={resSearch}
                  onChange={(e) => setResSearch(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
              <div className={styles.resTabs}>
                {RESERVATION_FILTERS.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    className={`${styles.resTab} ${
                      resStatusFilter === f.key ? styles.resTabActive : ""
                    }`}
                    onClick={() => setResStatusFilter(f.key)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.reservationTable}>
              <div
                className={`${styles.reservationRow} ${styles.reservationRowHead}`}
              >
                <span>Avtomobil</span>
                <span>Parkinq</span>
                <span>Başlama</span>
                <span>Bitmə</span>
                <span>Status</span>
                <span>Qiymət</span>
                <span>Əməliyyat</span>
              </div>
              {filteredReservations.map((r, i) => (
                <div
                  key={r.id}
                  className={styles.reservationRow}
                  style={{ animationDelay: `${Math.min(i, 20) * 0.03}s` }}
                >
                  <span className={styles.carCell}>
                    <span className={styles.carPlate}>{r.car.plate}</span>
                    <span className={styles.carMeta}>
                      {r.car.brand} · {r.car.color}
                    </span>
                  </span>
                  <span className={styles.parkingNameText}>
                    {parkingById[r.parkingId]?.name || r.parkingId}
                  </span>
                  <span className={styles.activityTime}>
                    {formatTime(r.startTime)}
                  </span>
                  <span className={styles.activityTime}>
                    {formatTime(r.endTime)}
                  </span>
                  <span>
                    <span
                      className={`${styles.statusBadge} ${STATUS_ACCENT[r.status]}`}
                    >
                      {STATUS_LABELS[r.status] || r.status}
                    </span>
                  </span>
                  <span>{formatPrice(r.totalPrice)}</span>
                  <span className={styles.actions}>
                    {r.status === "active" ? (
                      <button
                        type="button"
                        className={styles.btnStop}
                        onClick={() => handleStopReservation(r)}
                        title="Rezervasiyanı bitir"
                      >
                        <StopIcon />
                        Bitir
                      </button>
                    ) : (
                      <span className={styles.noAction}>—</span>
                    )}
                  </span>
                </div>
              ))}
              {filteredReservations.length === 0 && (
                <div className={styles.emptyState}>
                  Axtarışa uyğun rezervasiya tapılmadı.
                </div>
              )}
            </div>
          </div>

          <div className={`${styles.chartCard} ${styles.chartWide}`}>
            <div className={styles.chartHeader}>
              <h3>Parkinqlar</h3>
              <span>
                {filteredParkings.length} / {parkingList.length} obyekt
              </span>
            </div>

            <div className={styles.searchWrap}>
              <SearchIcon />
              <input
                type="text"
                placeholder="Ad və ya ünvan üzrə axtar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.parkingTable}>
              <div className={`${styles.parkingRow} ${styles.parkingRowHead}`}>
                <span>Ad</span>
                <span>Ünvan</span>
                <span>Doluluq</span>
                <span>Qiymət</span>
                <span>Status</span>
              </div>
              {filteredParkings.map((p, i) => {
                const available = getAvailable(p);
                const pct = p.totalSpots
                  ? Math.round(
                      ((p.totalSpots - available) / p.totalSpots) * 100,
                    )
                  : 0;
                return (
                  <div
                    key={p.id}
                    className={`${styles.parkingRow} ${!p.isActive ? styles.rowPaused : ""}`}
                    style={{ animationDelay: `${i * 0.04}s` }}
                  >
                    <span className={styles.parkingRowName}>
                      {p.name}
                      <span className={styles.tagRow}>
                        {p.hasEV && <em className={styles.tagEv}>EV</em>}
                        {p.hasDisabledSpots && (
                          <em className={styles.tagDisabled}>Əlil</em>
                        )}
                      </span>
                    </span>
                    <span className={styles.parkingRowAddress}>
                      {p.address}
                    </span>
                    <span className={styles.occupancyCell}>
                      <div className={styles.miniBarTrack}>
                        <div
                          className={`${styles.miniBarFill} ${
                            pct > 80 ? styles.miniBarFillWarn : ""
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <small>
                        {available} / {p.totalSpots}
                      </small>
                    </span>
                    <span>{p.pricePerHour.toFixed(2)} ₼/saat</span>
                    <span>
                      <span
                        className={`${styles.statusPill} ${
                          p.isActive
                            ? styles.statusPillOn
                            : styles.statusPillOff
                        }`}
                      >
                        {p.isActive ? "Aktiv" : "Dayandırılıb"}
                      </span>
                    </span>
                  </div>
                );
              })}
              {filteredParkings.length === 0 && (
                <div className={styles.emptyState}>
                  Axtarışa uyğun dayanacaq tapılmadı.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Cars;
