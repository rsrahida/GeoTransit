import React from "react";
import styles from "./CarParking.module.css";
import CarsSidebar from "../CarsSidebar/CarsSidebar";

const CarParking = () => {
  return (
    <div className={styles.page}>
      <CarsSidebar />
      <main className={styles.content}></main>
    </div>
  );
};

export default CarParking;
