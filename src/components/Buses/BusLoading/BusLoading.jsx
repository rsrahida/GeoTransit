import React, { useState, useEffect } from "react";
import styles from "./BusLoading.module.css";

const BusLoading = ({ onFinish }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onFinish) onFinish();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  if (!visible) return null;

  return (
    <div className={styles.loadingWrap}>
      <svg
        className={styles.busSvg}
        viewBox="0 0 300 160"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line className={styles.road} x1="10" y1="130" x2="290" y2="130" />
        <g className={styles.busBody}>
          <path
            className={styles.busShape}
            d="M45 60
               L235 60
               C 245 60, 253 68, 253 78
               L 253 100
               L 253 108
               L 40 108
               L 40 78
               C 40 68, 45 60, 45 60
               Z"
          />
          <rect
            className={styles.busWindow}
            x="55"
            y="70"
            width="34"
            height="24"
            rx="4"
          />
          <rect
            className={styles.busWindow}
            x="97"
            y="70"
            width="34"
            height="24"
            rx="4"
          />
          <rect
            className={styles.busWindow}
            x="139"
            y="70"
            width="34"
            height="24"
            rx="4"
          />
          <rect
            className={styles.busWindow}
            x="181"
            y="70"
            width="34"
            height="24"
            rx="4"
          />
          <rect
            className={styles.busDoor}
            x="222"
            y="78"
            width="20"
            height="30"
            rx="2"
          />
          <circle cx="85" cy="108" r="16" className={styles.wheel} />
          <circle cx="215" cy="108" r="16" className={styles.wheel} />
        </g>
      </svg>
    </div>
  );
};

export default BusLoading;
