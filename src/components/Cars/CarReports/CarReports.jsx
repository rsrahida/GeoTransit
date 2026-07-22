import React, { useMemo, useState } from "react";
import styles from "./CarReports.module.css";
import CarsSidebar from "../CarsSidebar/CarsSidebar";
import {
  parkings,
  reservations as mockReservations,
} from "../../../data/mockData";
import { seedIfEmpty } from "../../../services/storage";

const RESERVATIONS_KEY = "reservations";

const STATUS_LABELS = {
  active: "Aktiv",
  upcoming: "Gözlənilən",
  completed: "Tamamlanmış",
  cancelled: "Ləğv edilmiş",
};

const STATUS_BADGE_CLASS = {
  active: "statusActive",
  upcoming: "statusPending",
  completed: "statusCompleted",
  cancelled: "statusCancelled",
};

function formatDateTime(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("az-AZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(start, end) {
  if (!end) return "-";
  const totalMin = Math.round((new Date(end) - new Date(start)) / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h} s ${m} d`;
}

const CarReports = () => {
  const reservations = useMemo(
    () => seedIfEmpty(RESERVATIONS_KEY, mockReservations),
    [],
  );

  const [filters, setFilters] = useState({
    parkingId: "all",
    status: "all",
    dateFrom: "",
    dateTo: "",
  });

  const updateFilter = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const resetFilters = () =>
    setFilters({ parkingId: "all", status: "all", dateFrom: "", dateTo: "" });

  const filtered = useMemo(() => {
    return reservations.filter((r) => {
      if (filters.parkingId !== "all" && r.parkingId !== filters.parkingId) {
        return false;
      }
      if (filters.status !== "all" && r.status !== filters.status) {
        return false;
      }

      const start = new Date(r.startTime);
      if (filters.dateFrom && start < new Date(filters.dateFrom)) return false;
      if (filters.dateTo) {
        const to = new Date(filters.dateTo);
        to.setHours(23, 59, 59, 999);
        if (start > to) return false;
      }
      return true;
    });
  }, [reservations, filters]);

  const summary = useMemo(() => {
    const count = filtered.length;
    const revenue = filtered
      .filter((r) => r.status === "completed")
      .reduce((sum, r) => sum + (r.totalPrice || 0), 0);
    const durations = filtered
      .filter((r) => r.endTime)
      .map((r) => (new Date(r.endTime) - new Date(r.startTime)) / 3600000);
    const avgDuration = durations.length
      ? durations.reduce((a, b) => a + b, 0) / durations.length
      : 0;
    return { count, revenue, avgDuration };
  }, [filtered]);

  return (
    <div className={styles.page}>
      <CarsSidebar />
      <main className={styles.content}>
        <div className={styles.topBar}>
          <div>
            <h2>Hesabatlar</h2>
            <span className={styles.subtitle}>REZERVASİYA HESABATLARI</span>
          </div>
        </div>

        <div className={styles.filters}>
          <select
            value={filters.parkingId}
            onChange={(e) => updateFilter("parkingId", e.target.value)}
          >
            <option value="all">Bütün dayanacaqlar</option>
            {parkings.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) => updateFilter("status", e.target.value)}
          >
            <option value="all">Bütün statuslar</option>
            <option value="active">Aktiv</option>
            <option value="upcoming">Gözlənilən</option>
            <option value="completed">Tamamlanmış</option>
            <option value="cancelled">Ləğv edilmiş</option>
          </select>

          <div className={styles.dateGroup}>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => updateFilter("dateFrom", e.target.value)}
            />
            <span className={styles.dateSep}>—</span>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => updateFilter("dateTo", e.target.value)}
            />
          </div>

          <div className={styles.inlineSummary}>
            <div className={styles.inlineSummaryItem}>
              <span>Nəticə</span>
              <strong>{summary.count}</strong>
            </div>
            <div className={styles.inlineSummaryItem}>
              <span>Ümumi gəlir</span>
              <strong className={styles.accentAmber}>
                {summary.revenue.toFixed(2)} ₼
              </strong>
            </div>
            <div className={styles.inlineSummaryItem}>
              <span>Orta müddət</span>
              <strong>{summary.avgDuration.toFixed(1)} saat</strong>
            </div>
          </div>

          <button className={styles.resetBtn} onClick={resetFilters}>
            Sıfırla
          </button>
        </div>

        <section className={styles.tableSection}>
          <h3>Rezervasiyaların siyahısı</h3>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Plaka</th>
                  <th>Marka / Rəng</th>
                  <th>Dayanacaq</th>
                  <th>Başlama</th>
                  <th>Bitmə</th>
                  <th>Müddət</th>
                  <th>Məbləğ</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className={styles.emptyRow}>
                      Filtrə uyğun rezervasiya tapılmadı.
                    </td>
                  </tr>
                )}
                {filtered.map((r) => {
                  const parking = parkings.find((p) => p.id === r.parkingId);
                  return (
                    <tr key={r.id}>
                      <td className={styles.plateCell}>{r.car.plate}</td>
                      <td>
                        {r.car.brand} · {r.car.color}
                      </td>
                      <td>{parking ? parking.name : r.parkingId}</td>
                      <td>{formatDateTime(r.startTime)}</td>
                      <td>{formatDateTime(r.endTime)}</td>
                      <td>{formatDuration(r.startTime, r.endTime)}</td>
                      <td>
                        {r.totalPrice != null
                          ? `${r.totalPrice.toFixed(2)} ₼`
                          : "-"}
                      </td>
                      <td>
                        <span
                          className={`${styles.badge} ${
                            styles[STATUS_BADGE_CLASS[r.status]]
                          }`}
                        >
                          {STATUS_LABELS[r.status]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default CarReports;
