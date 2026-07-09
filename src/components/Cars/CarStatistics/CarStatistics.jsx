import React from "react";
import styles from "./CarStatistics.module.css";
import CarsSidebar from "../CarsSidebar/CarsSidebar";

const CarStatistics = () => {
  return (
    <div className={styles.page}>
      <CarsSidebar />
      <main className={styles.content}></main>
    </div>
  );
};

export default CarStatistics;
