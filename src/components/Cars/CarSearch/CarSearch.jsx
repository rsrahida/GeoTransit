import React from "react";
import styles from "./CarSearch.module.css";
import CarsSidebar from "../CarsSidebar/CarsSidebar";

const CarSearch = () => {
  return (
    <div className={styles.page}>
      <CarsSidebar />
      <main className={styles.content}></main>
    </div>
  );
};

export default CarSearch;
