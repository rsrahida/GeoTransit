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

import BusMap from "./components/Buses/BusMap/BusMap";
import BusRouteDetails from "./components/Buses/BusRouteDetails/BusRouteDetails";
import BusLiveTracking from "./components/Buses/BusLiveTracking/BusLiveTracking";
import BusStatistics from "./components/Buses/BusStatistics/BusStatistics";
import BusSchedule from "./components/Buses/BusSchedule/BusSchedule";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ModuleSelectionPage />} />
        <Route path="/cars" element={<Cars />} />
        <Route path="/cars/parking" element={<CarParking />} />
        <Route
          path="/cars/reservations"
          element={<CarReservationsList />}
        />
        <Route
          path="/cars/reservations/:parkingId"
          element={<CarReservations />}
        />
        <Route path="/cars/search" element={<CarSearch />} />
        <Route path="/cars/statistics" element={<CarStatistics />} />
        <Route path="/cars/reports" element={<CarReports />} />

        <Route path="/buses" element={<Buses />} />
        <Route path="/buses/map" element={<BusMap />} />
        <Route path="/buses/route" element={<BusRouteDetails />} />
        <Route path="/buses/tracking" element={<BusLiveTracking />} />
        <Route path="/buses/statistics" element={<BusStatistics />} />
        <Route path="/buses/schedule" element={<BusSchedule />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;