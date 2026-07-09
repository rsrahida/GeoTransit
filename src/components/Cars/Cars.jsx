import React from "react";
import styles from "./Cars.module.css";
import CarsSidebar from "./CarsSidebar/CarsSidebar";
import CarsLoading from "./CarsLoading/CarsLoading";

const Cars = () => {
  const [isLoading, setIsLoading] = React.useState(true);

  return (
    <div className={styles.page}>
      <CarsSidebar />
      <main className={styles.content}>
        {isLoading ? <CarsLoading /> : null}
      </main>
    </div>
  );
};

export default Cars;
