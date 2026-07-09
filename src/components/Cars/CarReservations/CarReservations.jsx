import React from "react";
import styles from "./CarReservations.module.css";
import CarsSidebar from "../CarsSidebar/CarsSidebar";

const CarReservations = () => {
  return (
    <div className={styles.page}>
      <CarsSidebar />
      <main className={styles.content}></main>
    </div>
  );
};

export default CarReservations;
