import React, { useEffect, useState } from "react";
import styles from "./BusMap.module.css";
import BusSidebar from "../BusSidebar/BusSidebar";
import BusLoading from "../BusLoading/BusLoading";

const BusMap = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={styles.page}>
      <BusSidebar />
      <main className={styles.content}>
        {isLoading ? <BusLoading /> : <div className={styles.mapWrapper}></div>}
      </main>
    </div>
  );
};

export default BusMap;
