import React, { useState, useEffect } from "react";
import styles from "./CarsLoading.module.css";

const CarsLoading = ({ onFinish }) => {
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
        className={styles.carSvg}
        viewBox="0 0 300 160"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line className={styles.road} x1="10" y1="130" x2="290" y2="130" />
        <g className={styles.carBody}>
          <path
            className={styles.carShape}
            d="M40 95
               C 55 70, 90 55, 120 55
               L 150 55
               C 165 55, 175 62, 185 75
               L 230 78
               C 245 78, 255 88, 255 100
               L 255 108
               L 40 108
               Z"
          />
          <path
            className={styles.carGlass}
            d="M125 60
               C 138 60, 148 66, 155 76
               L 122 76
               Z"
          />
          <circle cx="85" cy="108" r="16" className={styles.wheel} />
          <circle cx="215" cy="108" r="16" className={styles.wheel} />
        </g>
      </svg>
    </div>
  );
};

export default CarsLoading;
