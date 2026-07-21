import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CarSearch.module.css";
import CarsSidebar from "../CarsSidebar/CarsSidebar";
import { parkings, getAvailableCount, statistics } from "../../../data/mockData";

const SORT_OPTIONS = [
  { value: "available", label: "Boş yerlərin sayına görə" },
  { value: "price", label: "Qiymətə görə (ucuzdan)" },
  { value: "name", label: "Ada görə (A-Z)" },
];

function gaugeLevel(pct) {
  if (pct > 40) return "high";
  if (pct > 15) return "mid";
  return "low";
}

const CarSearch = () => {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [onlyEV, setOnlyEV] = useState(false);
  const [onlyDisabled, setOnlyDisabled] = useState(false);
  const [sortBy, setSortBy] = useState("available");

  const results = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("az");

    const filtered = parkings.filter((p) => {
      const haystack = `${p.name} ${p.address}`.toLocaleLowerCase("az");
      const matchesQuery = !q || haystack.includes(q);
      const matchesEV = !onlyEV || p.hasEV;
      const matchesDisabled = !onlyDisabled || p.hasDisabledSpots;
      return matchesQuery && matchesEV && matchesDisabled;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "price") return a.pricePerHour - b.pricePerHour;
      if (sortBy === "name") return a.name.localeCompare(b.name, "az");
      return getAvailableCount(b.id) - getAvailableCount(a.id);
    });
  }, [query, onlyEV, onlyDisabled, sortBy]);

  const resetFilters = () => {
    setQuery("");
    setOnlyEV(false);
    setOnlyDisabled(false);
  };

  return (
    <div className={styles.page}>
      <CarsSidebar />
      <main className={styles.content}>
        {/* ---------- Hero / search ---------- */}
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <span className={styles.eyebrow}>Canlı axtarış</span>
            <h1>Bakıda boş parkinq yeri tap</h1>

            <div className={styles.searchBar}>
              <span className={styles.searchIcon} aria-hidden="true">
                ⌕
              </span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ad və ya ünvana görə axtar — məs. “28 Mall”, “Nizami”"
              />
              {query && (
                <button
                  type="button"
                  className={styles.clearBtn}
                  onClick={() => setQuery("")}
                  aria-label="Axtarışı təmizlə"
                >
                  ✕
                </button>
              )}
            </div>

            <div className={styles.statsTicker}>
              <span>
                <strong>{statistics.summary.totalParkings}</strong> parkinq
              </span>
              <i className={styles.tickerDot} />
              <span>
                <strong>{statistics.summary.totalSpots}</strong> yer
              </span>
              <i className={styles.tickerDot} />
              <span>
                <strong>{statistics.summary.averageOccupancyRate}%</strong>{" "}
                orta doluluq
              </span>
              <i className={styles.tickerDot} />
              <span>
                <strong>{statistics.summary.totalReservationsToday}</strong>{" "}
                bugünkü rezervasiya
              </span>
            </div>
          </div>
        </section>

        {/* ---------- Filters ---------- */}
        <section className={styles.filterBar}>
          <div className={styles.chipGroup}>
            <button
              type="button"
              className={`${styles.chip} ${onlyEV ? styles.chipActive : ""}`}
              onClick={() => setOnlyEV((v) => !v)}
              aria-pressed={onlyEV}
            >
              <span className={styles.chipIcon}>⚡</span> Elektromobil
            </button>
            <button
              type="button"
              className={`${styles.chip} ${onlyDisabled ? styles.chipActive : ""}`}
              onClick={() => setOnlyDisabled((v) => !v)}
              aria-pressed={onlyDisabled}
            >
              <span className={styles.chipIcon}>♿</span> Əlillər üçün yer
            </button>
          </div>

          <label className={styles.sortSelect}>
            Sırala
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        </section>

        {/* ---------- Results ---------- */}
        <div className={styles.resultsHeader}>
          <span className={styles.resultsCount}>
            {results.length} nəticə tapıldı
          </span>
          {(query || onlyEV || onlyDisabled) && (
            <button type="button" className={styles.resetLink} onClick={resetFilters}>
              Filterləri sıfırla
            </button>
          )}
        </div>

        {results.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon} aria-hidden="true">
              ⌕
            </span>
            <p>Axtarışa uyğun parkinq tapılmadı.</p>
            <button type="button" className={styles.resetBtn} onClick={resetFilters}>
              Filterləri sıfırla
            </button>
          </div>
        ) : (
          <div className={styles.grid}>
            {results.map((p) => {
              const available = getAvailableCount(p.id);
              const pct = Math.max(
                0,
                Math.min(100, Math.round((available / p.totalSpots) * 100)),
              );
              const level = gaugeLevel(pct);
              const gaugeColor =
                level === "high"
                  ? "var(--amber)"
                  : level === "mid"
                    ? "var(--cyan)"
                    : "var(--red)";

              return (
                <article
                  key={p.id}
                  className={styles.card}
                  onClick={() => navigate(`/cars/parking/${p.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      navigate(`/cars/parking/${p.id}`);
                    }
                  }}
                >
                  <div
                    className={styles.gauge}
                    style={{ "--gauge-pct": pct, "--gauge-color": gaugeColor }}
                  >
                    <div className={styles.gaugeInner}>
                      <strong>{available}</strong>
                      <span>boş</span>
                    </div>
                  </div>

                  <div className={styles.cardMain}>
                    <h3>{p.name}</h3>
                    <p className={styles.address}>{p.address}</p>

                    <div className={styles.tagRow}>
                      {p.zones.map((z) => (
                        <span key={z} className={styles.zoneTag}>
                          {z}
                        </span>
                      ))}
                      {p.hasEV && <span className={styles.evTag}>⚡ EV</span>}
                      {p.hasDisabledSpots && (
                        <span className={styles.aTag}>♿</span>
                      )}
                    </div>

                    <div className={styles.metaRow}>
                      <span className={styles.hours}>{p.workingHours}</span>
                      <span className={styles.price}>
                        {p.pricePerHour} AZN/saat
                      </span>
                    </div>
                  </div>

                  <span className={styles.arrow} aria-hidden="true">
                    →
                  </span>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default CarSearch;