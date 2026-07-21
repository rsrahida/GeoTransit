import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from "@arcgis/core/Graphic";
import "@arcgis/core/assets/esri/themes/light/main.css";

import styles from "./CarReservations.module.css";
import CarsSidebar from "../CarsSidebar/CarsSidebar";
import { parkings } from "../../../data/mockData";
import { useSpots } from "../../hooks/useSpots";
import { useReservations } from "../../hooks/useReservations";

const STATUS_COLORS = {
  empty: [34, 197, 94, 0.55],
  occupied: [239, 68, 68, 0.55],
  reserved: [245, 158, 11, 0.55],
};

const MONTHS_AZ = [
  "Yanvar",
  "Fevral",
  "Mart",
  "Aprel",
  "May",
  "İyun",
  "İyul",
  "Avqust",
  "Sentyabr",
  "Oktyabr",
  "Noyabr",
  "Dekabr",
];
const WEEKDAYS_AZ = ["B.e", "Ç.a", "Ç", "C.a", "C", "Ş", "B"];

const pad2 = (n) => String(n).padStart(2, "0");

// "YYYY-MM-DDTHH:mm" formatını yerli Date obyektinə çevirir
const parseLocalValue = (value) => {
  if (!value) return null;
  const [datePart, timePart] = value.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  const [hh, mm] = (timePart || "00:00").split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm);
};

const toLocalValueDT = (date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(
    date.getDate(),
  )}T${pad2(date.getHours())}:${pad2(date.getMinutes())}`;

const isSameDay = (a, b) =>
  !!a &&
  !!b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

// Minimum tarix/saat dəyəri — köhnə koddan uyğunluq üçün saxlanılır
const toLocalDatetimeValue = (date) => toLocalValueDT(date);

/**
 * Custom, temaya uyğun tarix/saat seçici.
 * `value`  — "YYYY-MM-DDTHH:mm" formatında string
 * `onChange(nextValue)` — eyni formatda yeni dəyər qaytarır
 * `min`    — Date, bundan əvvəlki tarix/saat seçilə bilməz
 */
const DateTimePicker = ({ value, onChange, min }) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const selected = parseLocalValue(value) || min || new Date();
  const [viewDate, setViewDate] = useState(
    new Date(selected.getFullYear(), selected.getMonth(), 1),
  );

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const minDay = min ? startOfDay(min) : null;
  const today = startOfDay(new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const daysCount = new Date(year, month + 1, 0).getDate();

  // Bazar ertəsi = 0 olacaq şəkildə sürüşdürülür
  let leading = firstOfMonth.getDay() - 1;
  if (leading < 0) leading = 6;

  const cells = [];
  for (let i = 0; i < leading; i++) cells.push(null);
  for (let d = 1; d <= daysCount; d++) cells.push(new Date(year, month, d));

  const prevDisabled =
    !!minDay &&
    (year < minDay.getFullYear() ||
      (year === minDay.getFullYear() && month <= minDay.getMonth()));

  const goPrevMonth = () => {
    if (prevDisabled) return;
    setViewDate(new Date(year, month - 1, 1));
  };
  const goNextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const commit = (nextDate) => {
    let next = nextDate;
    if (min && next < min) next = new Date(min);
    onChange(toLocalValueDT(next));
  };

  const handleSelectDay = (day) => {
    if (!day) return;
    if (minDay && startOfDay(day) < minDay) return;
    commit(
      new Date(
        day.getFullYear(),
        day.getMonth(),
        day.getDate(),
        selected.getHours(),
        selected.getMinutes(),
      ),
    );
  };

  const changeTime = (field, delta) => {
    let h = selected.getHours();
    let m = selected.getMinutes();
    if (field === "hour") h = (h + delta + 24) % 24;
    else m = (m + delta + 60) % 60;
    commit(
      new Date(
        selected.getFullYear(),
        selected.getMonth(),
        selected.getDate(),
        h,
        m,
      ),
    );
  };

  const setNow = () => {
    const now = min && min > new Date() ? new Date(min) : new Date();
    setViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
    commit(now);
  };

  const displayText = value
    ? selected.toLocaleString("az-AZ", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Tarix və saat seçin";

  return (
    <div className={styles.dtField} ref={wrapperRef}>
      <button
        type="button"
        className={styles.dtTrigger}
        onClick={() => setOpen((o) => !o)}
      >
        <span>{displayText}</span>
        <span className={styles.dtTriggerIcon}>📅</span>
      </button>

      {open && (
        <div className={styles.dtPopover}>
          <div className={styles.dtHeader}>
            <button
              type="button"
              className={styles.dtNavBtn}
              onClick={goPrevMonth}
              disabled={prevDisabled}
            >
              ‹
            </button>
            <span className={styles.dtMonthLabel}>
              {MONTHS_AZ[month]} {year}
            </span>
            <button
              type="button"
              className={styles.dtNavBtn}
              onClick={goNextMonth}
            >
              ›
            </button>
          </div>

          <div className={styles.dtWeekdays}>
            {WEEKDAYS_AZ.map((w) => (
              <span key={w}>{w}</span>
            ))}
          </div>

          <div className={styles.dtGrid}>
            {cells.map((day, i) => {
              if (!day) {
                return <span key={`e-${i}`} className={styles.dtDayEmpty} />;
              }
              const disabled = !!minDay && startOfDay(day) < minDay;
              const isSelected = isSameDay(day, selected);
              const isToday = isSameDay(day, today);
              const classNames = [styles.dtDay];
              if (disabled) classNames.push(styles.dtDayDisabled);
              if (isSelected) classNames.push(styles.dtDaySelected);
              if (isToday && !isSelected) classNames.push(styles.dtDayToday);

              return (
                <button
                  type="button"
                  key={day.toISOString()}
                  className={classNames.join(" ")}
                  disabled={disabled}
                  onClick={() => handleSelectDay(day)}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          <div className={styles.dtTimeRow}>
            <div className={styles.dtTimeBlock}>
              <span className={styles.dtTimeLabel}>Saat</span>
              <div className={styles.dtTimeControls}>
                <button
                  type="button"
                  className={styles.dtTimeBtn}
                  onClick={() => changeTime("hour", -1)}
                >
                  −
                </button>
                <span className={styles.dtTimeValue}>
                  {pad2(selected.getHours())}
                </span>
                <button
                  type="button"
                  className={styles.dtTimeBtn}
                  onClick={() => changeTime("hour", 1)}
                >
                  +
                </button>
              </div>
            </div>

            <span className={styles.dtTimeColon}>:</span>

            <div className={styles.dtTimeBlock}>
              <span className={styles.dtTimeLabel}>Dəqiqə</span>
              <div className={styles.dtTimeControls}>
                <button
                  type="button"
                  className={styles.dtTimeBtn}
                  onClick={() => changeTime("minute", -5)}
                >
                  −
                </button>
                <span className={styles.dtTimeValue}>
                  {pad2(selected.getMinutes())}
                </span>
                <button
                  type="button"
                  className={styles.dtTimeBtn}
                  onClick={() => changeTime("minute", 5)}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className={styles.dtFooter}>
            <button
              type="button"
              className={styles.dtQuickBtn}
              onClick={setNow}
            >
              İndi
            </button>
            <button
              type="button"
              className={styles.dtConfirmBtn}
              onClick={() => setOpen(false)}
            >
              Təsdiqlə
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const CarReservations = () => {
  const { parkingId } = useParams();
  const navigate = useNavigate();

  const parking = parkings.find((p) => p.id === parkingId);
  const { spots, updateSpotStatus } = useSpots(parkingId);
  const { addReservation } = useReservations();

  const mapDivRef = useRef(null);
  const viewRef = useRef(null);
  const graphicsLayerRef = useRef(null);
  const spotsRef = useRef(spots);

  const [selectedSpot, setSelectedSpot] = useState(null);
  const [reservationType, setReservationType] = useState("now"); // "now" | "later"
  const [form, setForm] = useState({
    plate: "",
    brand: "",
    color: "",
    phone: "",
    startTime: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    spotsRef.current = spots;
  }, [spots]);

  useEffect(() => {
    if (!parking || !mapDivRef.current) return;

    const map = new Map({ basemap: "osm" });
    const view = new MapView({
      container: mapDivRef.current,
      map,
      center: [parking.coordinates.lng, parking.coordinates.lat],
      zoom: 20.5,
    });

    const graphicsLayer = new GraphicsLayer();
    map.add(graphicsLayer);
    graphicsLayerRef.current = graphicsLayer;

    view.on("click", (event) => {
      view.hitTest(event).then((response) => {
        const result = response.results.find(
          (r) => r.graphic?.attributes?.spotId,
        );
        if (result) {
          const spot = spotsRef.current.find(
            (s) => s.id === result.graphic.attributes.spotId,
          );
          if (spot) {
            setSelectedSpot(spot);
            setReservationType("now");
            setForm({
              plate: "",
              brand: "",
              color: "",
              phone: "",
              startTime: toLocalDatetimeValue(new Date()),
            });
          }
        }
      });
    });

    view.popup.autoOpenEnabled = false;
    viewRef.current = view;

    return () => view.destroy();
  }, [parkingId]);

  useEffect(() => {
    const layer = graphicsLayerRef.current;
    if (!layer) return;

    layer.removeAll();

    spots.forEach((spot) => {
      const graphic = new Graphic({
        geometry: {
          type: "polygon",
          rings: spot.polygon,
          spatialReference: { wkid: 4326 },
        },
        symbol: {
          type: "simple-fill",
          color: STATUS_COLORS[spot.status] || STATUS_COLORS.empty,
          outline: { color: [255, 255, 255], width: 1 },
        },
        attributes: { spotId: spot.id },
      });
      layer.add(graphic);
    });
  }, [spots]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.plate || !form.brand || !form.phone) return;
    if (reservationType === "later" && !form.startTime) return;

    setSubmitting(true);

    const startTime =
      reservationType === "now" ? new Date() : new Date(form.startTime);
    const spotStatus = reservationType === "now" ? "occupied" : "reserved";
    const reservationStatus = reservationType === "now" ? "active" : "upcoming";

    const reservation = {
      id: `res-${Date.now()}`,
      parkingId: parking.id,
      spotId: selectedSpot.id,
      car: {
        plate: form.plate,
        brand: form.brand,
        color: form.color,
        ownerPhone: form.phone,
      },
      startTime: startTime.toISOString(),
      endTime: null,
      status: reservationStatus,
      totalPrice: null,
    };

    addReservation(reservation);
    updateSpotStatus(selectedSpot.id, spotStatus, reservation.car);

    setSubmitting(false);
    setSelectedSpot(null);

    navigate("/cars/reservations");
  };

  if (!parking) {
    return (
      <div className={styles.page}>
        <CarsSidebar />
        <main className={styles.content}>
          <p className={styles.notFound}>Parkinq tapılmadı.</p>
          <button
            className={styles.backBtn}
            onClick={() => navigate("/cars/parking")}
          >
            ← Geri qayıt
          </button>
        </main>
      </div>
    );
  }

  const availableCount = spots.filter((s) => s.status === "empty").length;

  return (
    <div className={styles.page}>
      <CarsSidebar />
      <main className={styles.content}>
        <div className={styles.mapWrapper}>
          <div ref={mapDivRef} className={styles.mapContainer} />
        </div>

        <div className={styles.topBar}>
          <div>
            <h2>{parking.name}</h2>
          </div>
          <div className={styles.availabilityBadge}>
            <span className={styles.availabilityDot} />
            {availableCount} boş yer
          </div>
        </div>

        <div className={styles.legend}>
          <span>
            <i className={styles.dotGreen} /> Boş
          </span>
          <span>
            <i className={styles.dotRed} /> Dolu
          </span>
          <span>
            <i className={styles.dotYellow} /> Rezerv olunub
          </span>
        </div>

        {selectedSpot && (
          <div
            className={styles.modalOverlay}
            onClick={() => setSelectedSpot(null)}
          >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <button
                className={styles.closeBtn}
                onClick={() => setSelectedSpot(null)}
              >
                ✕
              </button>

              {selectedSpot.status !== "empty" ? (
                <>
                  <h3>Yer {selectedSpot.label}</h3>
                  <p className={styles.occupiedNote}>
                    {selectedSpot.status === "reserved"
                      ? "Bu yer əvvəlcədən rezerv olunub"
                      : "Bu yer artıq tutulmuşdur"}
                  </p>
                  {selectedSpot.car && (
                    <div className={styles.infoRow}>
                      <span>Maşın:</span>
                      <strong>{selectedSpot.car.plate}</strong>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <h3>Yer {selectedSpot.label} — Rezervasiya</h3>

                  <div className={styles.typeToggle}>
                    <button
                      type="button"
                      className={`${styles.typeBtn} ${
                        reservationType === "now" ? styles.typeBtnActive : ""
                      }`}
                      onClick={() => setReservationType("now")}
                    >
                      İndi
                    </button>
                    <button
                      type="button"
                      className={`${styles.typeBtn} ${
                        reservationType === "later" ? styles.typeBtnActive : ""
                      }`}
                      onClick={() => setReservationType("later")}
                    >
                      Əvvəlcədən
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className={styles.form}>
                    <input
                      placeholder="Dövlət nömrəsi (10-AB-234)"
                      value={form.plate}
                      onChange={(e) =>
                        setForm({ ...form, plate: e.target.value })
                      }
                      required
                    />
                    <input
                      placeholder="Marka (Toyota, BMW...)"
                      value={form.brand}
                      onChange={(e) =>
                        setForm({ ...form, brand: e.target.value })
                      }
                      required
                    />
                    <input
                      placeholder="Rəng"
                      value={form.color}
                      onChange={(e) =>
                        setForm({ ...form, color: e.target.value })
                      }
                    />
                    <input
                      placeholder="Telefon nömrəsi"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      required
                    />

                    {reservationType === "later" && (
                      <div className={styles.fieldGroup}>
                        <span className={styles.fieldLabel}>
                          Başlanğıc vaxtı
                        </span>
                        <DateTimePicker
                          value={form.startTime}
                          onChange={(val) =>
                            setForm((f) => ({ ...f, startTime: val }))
                          }
                          min={new Date()}
                        />
                      </div>
                    )}

                    <div className={styles.priceRow}>
                      <span>Qiymət:</span>
                      <p className={styles.timerText}>
                        Dayandırdıqda hesablanacaq ({parking.pricePerHour}{" "}
                        AZN/saat)
                      </p>
                    </div>

                    <button
                      type="submit"
                      className={styles.confirmBtn}
                      disabled={submitting}
                    >
                      {reservationType === "now"
                        ? "İndi rezerv et"
                        : "Əvvəlcədən rezerv et"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CarReservations;
