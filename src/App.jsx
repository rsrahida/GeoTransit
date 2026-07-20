import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ModuleSelectionPage from "./components/ModuleSelectionPage/ModuleSelectionPage";
import Cars from "./components/Cars/Cars";
import Buses from "./components/Buses/Buses";
import CarParking from "./components/Cars/CarParking/CarParking";
import CarReservations from "./components/Cars/CarReservations/CarReservations";
import CarReservationsList from "./components/Cars/CarReservationsList/CarReservationsList";
import CarSearch from "./components/Cars/CarSearch/CarSearch";
import CarStatistics from "./components/Cars/CarStatistics/CarStatistics";
import CarReports from "./components/Cars/CarReports/CarReports";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ModuleSelectionPage />} />
        <Route path="/cars" element={<Cars />} />
        <Route path="/cars/parking" element={<CarParking />} />
        <Route path="/cars/reservations" element={<CarReservationsList />} />
        <Route path="/cars/reservations/:parkingId" element={<CarReservations />} />
        <Route path="/cars/search" element={<CarSearch />} />
        <Route path="/cars/statistics" element={<CarStatistics />} />
        <Route path="/cars/reports" element={<CarReports />} />

        <Route path="/buses" element={<Buses />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;