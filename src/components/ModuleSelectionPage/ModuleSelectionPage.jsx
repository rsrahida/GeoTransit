import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./ModuleSelectionPage.module.css";

const CarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M4 15.5V17a1 1 0 001 1h1a1 1 0 001-1v-1M16 15.5V17a1 1 0 001 1h1a1 1 0 001-1v-1M3 15.5l1.6-5.2A2 2 0 016.5 9h11a2 2 0 011.9 1.3L21 15.5M3 15.5h18M3 15.5v-1a1 1 0 011-1h16a1 1 0 011 1v1"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="7.5" cy="15.5" r="1.4" fill="currentColor" />
    <circle cx="16.5" cy="15.5" r="1.4" fill="currentColor" />
  </svg>
);

const BusIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect
      x="4"
      y="4"
      width="16"
      height="13"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <path d="M4 10h16" stroke="currentColor" strokeWidth="1.6" />
    <path d="M8 10v7M16 10v7" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="7.5" cy="19.5" r="1.4" fill="currentColor" />
    <circle cx="16.5" cy="19.5" r="1.4" fill="currentColor" />
  </svg>
);

const ArrowIcon = () => (
  <svg
    className={styles.arrow}
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
  >
    <path
      d="M3 8h10M9 4l4 4-4 4"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MapBackground = () => (
  <div className={styles.mapLayer} aria-hidden="true">
    <svg viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice">
      {Array.from({ length: 18 }).map((_, row) =>
        Array.from({ length: 30 }).map((__, col) => (
          <circle
            key={`${row}-${col}`}
            className={styles.gridDot}
            cx={20 + col * 42}
            cy={20 + row * 42}
            r="1.2"
          />
        )),
      )}
      <path
        className={styles.routeCar}
        d="M-20,470 C 220,470 260,380 420,380 S 620,300 900,300 S 1100,220 1240,220"
      />
      <path
        className={styles.routeBus}
        d="M-20,220 C 200,220 300,260 460,260 S 700,420 940,420 S 1080,480 1240,480"
      />
    </svg>
  </div>
);

const ModuleSelectionPage = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const formatted = time.toLocaleTimeString("az-AZ", { hour12: false });

  return (
    <div className={styles.page}>
      <MapBackground />
      <div className={styles.vignette} aria-hidden="true" />

      <header className={styles.topBar}>
        <div className={styles.brand}>
          <span className={styles.brandDot} />
          GeoTransit
        </div>
        <div className={styles.telemetry}>
          <span>{formatted}</span>
        </div>
      </header>

      <main className={styles.hero}>
        <span className={styles.eyebrow}>
          GeoTransit · ŞƏHƏR NƏQLİYYATININ İDARƏETMƏ SİSTEMİ
        </span>
        <h1 className={styles.headline}>
          Şəhərin hər hərəkətini <em>bir xəritədə</em> canlandırın
        </h1>
        <p className={styles.subtitle}>
          GeoTransit nəqliyyat və parkinq xidmətlərinin interaktiv xəritə
          üzərində idarə olunması və izlənilməsi üçün hazırlanmış GIS əsaslı
          platformadır.
          <br /> Parkinq sahələrini, ictimai nəqliyyatı və gələcək şəhər
          xidmətlərini vahid interaktiv xəritə üzərində
          <br /> izləməyə, idarə etməyə və analiz etməyə imkan yaradır.
        </p>

        <div className={styles.modules}>
          <Link
            to="/cars/parking"
            className={`${styles.card} ${styles.cardCars}`}
          >
            <div className={styles.cardTop}>
              <span className={styles.iconWrap}>
                <CarIcon />
              </span>
            </div>
            <h2 className={styles.cardTitle}>Avtomobillər</h2>
            <p className={styles.cardDesc}>
              Şəhər üzrə bütün parking sahələrini interaktiv xəritə üzərində
              idarə edin. Parking yerlərinin doluluğunu izləyin, sürücülər üçün
              rezervasiya yaradın, giriş və çıxış əməliyyatlarını idarə edin,
              dayanma müddətini və ödəniş məbləğini avtomatik hesablayın.
            </p>
            <div className={styles.cardFooter}>
              <span>Keçid edin</span>
              <ArrowIcon />
            </div>
          </Link>

          <Link
            to="/buses/map"
            className={`${styles.card} ${styles.cardBuses}`}
          >
            <div className={styles.cardTop}>
              <span className={styles.iconWrap}>
                <BusIcon />
              </span>
            </div>
            <h2 className={styles.cardTitle}>Avtobuslar</h2>
            <p className={styles.cardDesc}>
              Avtobus marşrutlarını, dayanacaqları və nəqliyyat vasitələrinin
              hərəkətini interaktiv xəritə üzərində izləyin. Marşrut
              məlumatlarını idarə edin, avtobusların cari vəziyyətini analiz
              edin və ictimai nəqliyyat proseslərini vahid platformadan
              nəzarətdə saxlayın.
            </p>
            <div className={styles.cardFooter}>
              <span>Keçid edin</span>
              <ArrowIcon />
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default ModuleSelectionPage;
