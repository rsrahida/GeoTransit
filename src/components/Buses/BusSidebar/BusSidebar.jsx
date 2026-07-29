import React from "react";
import { NavLink } from "react-router-dom";
import { busRoutesData } from "../../../data/busRoutesData";
import styles from "./BusSidebar.module.css";

const MapIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M9 4.5 4 6.5v13l5-2 6 2 5-2v-13l-5 2-6-2z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
    <path
      d="M9 4.5v13M15 6.5v13"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
  </svg>
);

const RouteIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle cx="6" cy="6" r="2.2" stroke="currentColor" strokeWidth="1.7" />
    <circle cx="18" cy="18" r="2.2" stroke="currentColor" strokeWidth="1.7" />
    <path
      d="M6 8.2v3a3 3 0 003 3h6a3 3 0 013 3v.6"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeDasharray="2 2.5"
    />
  </svg>
);

const LiveTrackingIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect
      x="4.5"
      y="8"
      width="15"
      height="8.5"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    <path
      d="M7 8V6a1 1 0 011-1h8a1 1 0 011 1v2"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
    <circle cx="8" cy="18.5" r="1.3" fill="currentColor" />
    <circle cx="16" cy="18.5" r="1.3" fill="currentColor" />
    <path d="M4.5 12h15" stroke="currentColor" strokeWidth="1.7" />
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

const ScheduleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect
      x="4.5"
      y="5"
      width="15"
      height="14.5"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    <path
      d="M4.5 9.5h15M8.5 3.5v3M15.5 3.5v3"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
    <path
      d="M8.5 13h2M14 13h2M8.5 16h2M14 16h2"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
);


const defaultRouteId = busRoutesData.length > 0 ? busRoutesData[0].id : null;

const menuItems = [
  { id: 1, title: "Xəritə", icon: MapIcon, path: "/buses/map", end: true },
  {
    id: 2,
    title: "Marşrut Məlumatları",
    icon: RouteIcon,
    path: defaultRouteId ? `/buses/route/${defaultRouteId}` : "/buses/route",
    matchPrefix: "/buses/route",
  },
  {
    id: 3,
    title: "Canlı İzləmə",
    icon: LiveTrackingIcon,
    path: "/buses/tracking",
    end: true,
  },
  {
    id: 4,
    title: "Statistika",
    icon: ChartIcon,
    path: "/buses/statistics",
    end: true,
  },
  {
    id: 5,
    title: "Cədvəl",
    icon: ScheduleIcon,
    path: "/buses/schedule",
    end: true,
  },
];

const BusSidebar = () => {
  const currentPath =
    typeof window !== "undefined" ? window.location.pathname : "";

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
          <span>Avtobus İdarəetmə Sistemi</span>
        </div>
      </div>

      <nav className={styles.menu}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isPrefixActive = item.matchPrefix
            ? currentPath.startsWith(item.matchPrefix)
            : false;

          return (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `${styles.menuItem} ${
                  isActive || isPrefixActive ? styles.active : ""
                }`
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
        AVTOBUS SİSTEMİ AKTİVDİR
      </div>
    </aside>
  );
};

export default BusSidebar;
