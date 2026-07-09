import React from "react";
import styles from "./CarReports.module.css";
import CarsSidebar from "../CarsSidebar/CarsSidebar";

const CarReports = () => {
  return (
    <div className={styles.page}>
      <CarsSidebar />
      <main className={styles.content}></main>
    </div>
  );
};

export default CarReports;
