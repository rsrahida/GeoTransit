import { useState, useEffect, useCallback } from "react";
import { reservations as mockReservations } from "../../data/mockData";
import { seedIfEmpty, writeStorage } from "../../services/storage";

const KEY = "reservations";

export function useReservations() {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    const loaded = seedIfEmpty(KEY, mockReservations);
    setReservations(loaded);
  }, []);

  const addReservation = useCallback((reservation) => {
    setReservations((prev) => {
      const updated = [...prev, reservation];
      writeStorage(KEY, updated);
      return updated;
    });
  }, []);

  return { reservations, addReservation };
}
