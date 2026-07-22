import React from "react";
import { NavLink } from "react-router-dom";
import styles from "./CarsSidebar.module.css";

const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M4 11.5 12 4l8 7.5M6 10v9a1 1 0 001 1h3v-5a1 1 0 011-1h2a1 1 0 011 1v5h3a1 1 0 001-1v-9"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ParkingIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect
      x="4"
      y="3.5"
      width="16"
      height="17"
      rx="3"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    <path
      d="M9.5 16V7.7h3a2.6 2.6 0 010 5.2h-3"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ClipboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect
      x="5.5"
      y="4.5"
      width="13"
      height="16"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    <path
      d="M9 4.5V4a2 2 0 014 0v.5"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
    <path
      d="M8.5 11h7M8.5 14.5h7M8.5 18h4.5"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
);

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle cx="10.5" cy="10.5" r="6" stroke="currentColor" strokeWidth="1.7" />
    <path
      d="M19 19l-4.3-4.3"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
);

const ChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M4.5 19.5v-6M11 19.5V8M17.5 19.5v-3.5M4 19.5h16"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DocIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M7 3.5h7l4 4v13a1 1 0 01-1 1H7a1 1 0 01-1-1v-16a1 1 0 011-1z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
    <path
      d="M14 3.5V8h4"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
    <path
      d="M9 12.5h6M9 15.5h6M9 18h3.5"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
);

const menuItems = [
  { id: 1, title: "Admin Panel", icon: HomeIcon, path: "/cars", end: true },
  { id: 2, title: "Axtarış", icon: SearchIcon, path: "/cars/search" },
  { id: 3, title: "Parkinglər", icon: ParkingIcon, path: "/cars/parking" },
  {
    id: 4,
    title: "Rezervasiya",
    icon: ClipboardIcon,
    path: "/cars/reservations",
  },
  { id: 5, title: "Hesabatlar", icon: DocIcon, path: "/cars/reports" },
  { id: 6, title: "Statistika", icon: ChartIcon, path: "/cars/statistics" },
];

const CarsSidebar = () => {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <span className={styles.logoDot}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 16.5 5.2 12a2 2 0 011.9-1.4h9.8a2 2 0 011.9 1.4l1.2 4.5M4 16.5v2.3a1 1 0 001 1h1.3a1 1 0 001-1v-1.3M4 16.5h16M20 16.5v2.3a1 1 0 01-1 1h-1.3a1 1 0 01-1-1v-1.3"
              stroke="#1a1815"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="7.5" cy="16.5" r="1.3" fill="#1a1815" />
            <circle cx="16.5" cy="16.5" r="1.3" fill="#1a1815" />
          </svg>
        </span>
        <div>
          <h2>GeoTransit</h2>
          <span>Parkinq İdarəetmə Sistemi</span>
        </div>
      </div>

      <nav className={styles.menu}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `${styles.menuItem} ${isActive ? styles.active : ""}`
              }
            >
              <span className={styles.icon}>
                <Icon />
              </span>
              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <span className={styles.footerDot} />
        PARKİNG SİSTEMİ AKTİVDİR
      </div>
    </aside>
  );
};

export default CarsSidebar;
