import React, { useEffect, useMemo, useRef } from "react";
import Chart from "chart.js/auto";
import styles from "./CarStatistics.module.css";
import CarsSidebar from "../CarsSidebar/CarsSidebar";
import {
  parkings,
  reservations as mockReservations,
  statistics,
} from "../../../data/mockData";
import { seedIfEmpty } from "../../../services/storage";

const RESERVATIONS_KEY = "reservations";

const STATUS_ORDER = ["active", "upcoming", "completed", "cancelled"];

const STATUS_LABELS = {
  active: "Aktiv",
  upcoming: "Gözlənilən",
  completed: "Tamamlanmış",
  cancelled: "Ləğv edilmiş",
};

const STATUS_COLORS = {
  active: "#b6ff3f",
  upcoming: "#ffcf5c",
  completed: "#9a958a",
  cancelled: "#ff5c5c",
};

const FONT_FAMILY = "'JetBrains Mono', monospace";
const GRID_COLOR = "rgba(154, 149, 138, 0.15)";
const TICK_COLOR = "#837f73";

const tooltipTheme = {
  backgroundColor: "#221f1b",
  titleColor: "#f8f6ee",
  bodyColor: "#c3beb2",
  borderColor: "#3a3831",
  borderWidth: 1,
  padding: 10,
};

const CarStatistics = () => {
  const reservations = useMemo(
    () => seedIfEmpty(RESERVATIONS_KEY, mockReservations),
    [],
  );

  const occupancyCanvasRef = useRef(null);
  const statusCanvasRef = useRef(null);
  const parkingCanvasRef = useRef(null);
  const revenueCanvasRef = useRef(null);
  const chartsRef = useRef({});

  const summary = useMemo(() => {
    const totalParkings = parkings.length;
    const totalSpots = parkings.reduce(
      (sum, p) => sum + (p.totalSpots || 0),
      0,
    );

    const statusCounts = reservations.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {});

    const totalRevenue = reservations
      .filter((r) => r.status === "completed")
      .reduce((sum, r) => sum + (r.totalPrice || 0), 0);

    const avgOccupancy =
      statistics.hourlyOccupancy.reduce((sum, h) => sum + h.occupancy, 0) /
      (statistics.hourlyOccupancy.length || 1);

    return {
      totalParkings,
      totalSpots,
      activeCount: statusCounts.active || 0,
      upcomingCount: statusCounts.upcoming || 0,
      completedCount: statusCounts.completed || 0,
      cancelledCount: statusCounts.cancelled || 0,
      totalRevenue,
      avgOccupancy: Math.round(avgOccupancy),
    };
  }, [reservations]);

  const parkingUsage = useMemo(() => {
    const map = {};
    reservations.forEach((r) => {
      map[r.parkingId] = (map[r.parkingId] || 0) + 1;
    });
    return parkings
      .map((p) => ({ name: p.name, count: map[p.id] || 0 }))
      .sort((a, b) => b.count - a.count);
  }, [reservations]);

  const revenueByParking = useMemo(() => {
    const map = {};
    reservations
      .filter((r) => r.status === "completed")
      .forEach((r) => {
        map[r.parkingId] = (map[r.parkingId] || 0) + (r.totalPrice || 0);
      });
    return parkings
      .map((p) => ({ name: p.name, revenue: +(map[p.id] || 0).toFixed(2) }))
      .filter((p) => p.revenue > 0)
      .sort((a, b) => b.revenue - a.revenue);
  }, [reservations]);

  useEffect(() => {
    Object.values(chartsRef.current).forEach((c) => c && c.destroy());
    chartsRef.current = {};

    if (occupancyCanvasRef.current) {
      chartsRef.current.occupancy = new Chart(occupancyCanvasRef.current, {
        type: "line",
        data: {
          labels: statistics.hourlyOccupancy.map((h) => h.hour),
          datasets: [
            {
              label: "Doluluq (%)",
              data: statistics.hourlyOccupancy.map((h) => h.occupancy),
              borderColor: "#b6ff3f",
              backgroundColor: "rgba(182, 255, 63, 0.12)",
              pointBackgroundColor: "#b6ff3f",
              pointBorderColor: "#17150f",
              pointRadius: 3.5,
              pointHoverRadius: 5,
              tension: 0.35,
              fill: true,
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: tooltipTheme,
          },
          scales: {
            x: {
              grid: { color: GRID_COLOR },
              ticks: {
                color: TICK_COLOR,
                font: { family: FONT_FAMILY, size: 10.5 },
              },
            },
            y: {
              grid: { color: GRID_COLOR },
              ticks: {
                color: TICK_COLOR,
                font: { family: FONT_FAMILY, size: 10.5 },
              },
              beginAtZero: true,
              max: 100,
            },
          },
        },
      });
    }

    if (statusCanvasRef.current) {
      const counts = STATUS_ORDER.map(
        (s) => reservations.filter((r) => r.status === s).length,
      );
      chartsRef.current.status = new Chart(statusCanvasRef.current, {
        type: "doughnut",
        data: {
          labels: STATUS_ORDER.map((s) => STATUS_LABELS[s]),
          datasets: [
            {
              data: counts,
              backgroundColor: STATUS_ORDER.map((s) => STATUS_COLORS[s]),
              borderColor: "#221f1b",
              borderWidth: 2,
              hoverOffset: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "62%",
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                color: "#c3beb2",
                font: { family: FONT_FAMILY, size: 10.5 },
                padding: 14,
                usePointStyle: true,
                pointStyle: "circle",
              },
            },
            tooltip: tooltipTheme,
          },
        },
      });
    }

    if (parkingCanvasRef.current) {
      chartsRef.current.parking = new Chart(parkingCanvasRef.current, {
        type: "bar",
        data: {
          labels: parkingUsage.map((p) => p.name),
          datasets: [
            {
              label: "Rezervasiya sayı",
              data: parkingUsage.map((p) => p.count),
              backgroundColor: "#ffcf5c",
              borderRadius: 6,
              maxBarThickness: 26,
            },
          ],
        },
        options: {
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: tooltipTheme,
          },
          scales: {
            x: {
              grid: { color: GRID_COLOR },
              ticks: {
                color: TICK_COLOR,
                font: { family: FONT_FAMILY, size: 10 },
                precision: 0,
              },
              beginAtZero: true,
            },
            y: {
              grid: { display: false },
              ticks: {
                color: "#c3beb2",
                font: { family: FONT_FAMILY, size: 10 },
              },
            },
          },
        },
      });
    }

    if (revenueCanvasRef.current) {
      chartsRef.current.revenue = new Chart(revenueCanvasRef.current, {
        type: "bar",
        data: {
          labels: revenueByParking.map((p) => p.name),
          datasets: [
            {
              label: "Gəlir (AZN)",
              data: revenueByParking.map((p) => p.revenue),
              backgroundColor: "#b6ff3f",
              borderRadius: 6,
              maxBarThickness: 30,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: tooltipTheme,
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: {
                color: TICK_COLOR,
                font: { family: FONT_FAMILY, size: 9.5 },
              },
            },
            y: {
              grid: { color: GRID_COLOR },
              ticks: {
                color: TICK_COLOR,
                font: { family: FONT_FAMILY, size: 10 },
              },
              beginAtZero: true,
            },
          },
        },
      });
    }

    return () => {
      Object.values(chartsRef.current).forEach((c) => c && c.destroy());
    };
  }, [reservations, parkingUsage, revenueByParking]);

  return (
    <div className={styles.page}>
      <CarsSidebar />
      <main className={styles.content}>
        <div className={styles.topBar}></div>
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Ümumi dayanacaq</span>
            <strong className={styles.summaryValue}>
              {summary.totalParkings}
            </strong>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Ümumi yer</span>
            <strong className={styles.summaryValue}>
              {summary.totalSpots}
            </strong>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Aktiv</span>
            <strong className={`${styles.summaryValue} ${styles.accentAmber}`}>
              {summary.activeCount}
            </strong>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Gözlənilən</span>
            <strong className={`${styles.summaryValue} ${styles.accentCyan}`}>
              {summary.upcomingCount}
            </strong>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Ləğv edilmiş</span>
            <strong className={`${styles.summaryValue} ${styles.accentRed}`}>
              {summary.cancelledCount}
            </strong>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Ümumi gəlir</span>
            <strong className={`${styles.summaryValue} ${styles.accentAmber}`}>
              {summary.totalRevenue.toFixed(2)} ₼
            </strong>
          </div>
        </div>

        <div className={styles.chartsGrid}>
          <div className={`${styles.chartCard} ${styles.chartWide}`}>
            <div className={styles.chartHeader}>
              <h3>Saatlıq doluluq</h3>
              <span>24 saat ərzində doluluq faizi</span>
            </div>
            <div className={styles.chartCanvasWrap}>
              <canvas ref={occupancyCanvasRef}></canvas>
            </div>
          </div>

          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h3>Rezervasiya statusları</h3>
              <span>Bütün rezervasiyaların bölgüsü</span>
            </div>
            <div className={styles.chartCanvasWrap}>
              <canvas ref={statusCanvasRef}></canvas>
            </div>
          </div>

          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h3>Dayanacaqlar üzrə rezervasiya</h3>
              <span>Ən çox istifadə olunan dayanacaqlar</span>
            </div>
            <div className={styles.chartCanvasWrap}>
              <canvas ref={parkingCanvasRef}></canvas>
            </div>
          </div>

          <div className={`${styles.chartCard} ${styles.chartWide}`}>
            <div className={styles.chartHeader}>
              <h3>Dayanacaqlar üzrə gəlir</h3>
              <span>Tamamlanmış rezervasiyalardan gəlir</span>
            </div>
            <div className={styles.chartCanvasWrap}>
              <canvas ref={revenueCanvasRef}></canvas>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CarStatistics;
