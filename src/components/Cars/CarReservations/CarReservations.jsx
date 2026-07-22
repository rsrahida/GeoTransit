import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from "@arcgis/core/Graphic";
import Zoom from "@arcgis/core/widgets/Zoom";
import "@arcgis/core/assets/esri/themes/light/main.css";

import styles from "./CarReservations.module.css";
import CarsSidebar from "../CarsSidebar/CarsSidebar";
import { parkings } from "../../../data/mockData";
import { useSpots } from "../../hooks/useSpots";
import { useReservations } from "../../hooks/useReservations";

const STATUS_COLORS = {
  empty: [120, 196, 30, 0.62],
  occupied: [196, 58, 46, 0.65],
  reserved: [196, 150, 40, 0.65],
};
const STATUS_OUTLINE = {
  empty: [140, 214, 40, 1],
  occupied: [214, 70, 55, 1],
  reserved: [214, 165, 45, 1],
};
const STATUS_HOVER_FILL = {
  empty: [132, 214, 35, 0.85],
  occupied: [214, 78, 62, 0.85],
  reserved: [214, 168, 48, 0.85],
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

const buildExtendedLODs = (maxLevel = 25) => {
  const lods = [];
  let resolution = 156543.03392804097;
  for (let level = 0; level <= maxLevel; level++) {
    lods.push({
      level,
      resolution,
      scale: (resolution * 96) / 0.0254,
    });
    resolution /= 2;
  }
  return lods;
};

const EXTENDED_LODS = buildExtendedLODs(25);

const CAR_ICON_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 40">
  <rect x="3" y="2" width="18" height="36" rx="7" fill="#2a2621" stroke="#f8f6ee" stroke-width="1.4"/>
  <rect x="6" y="7" width="12" height="9" rx="2.5" fill="#f8f6ee" opacity="0.9"/>
  <rect x="6" y="24" width="12" height="7" rx="2.5" fill="#f8f6ee" opacity="0.5"/>
  <rect x="6.5" y="17" width="11" height="6" rx="1.5" fill="#f8f6ee" opacity="0.15"/>
  <circle cx="5.3" cy="10" r="1.7" fill="#f8f6ee"/>
  <circle cx="18.7" cy="10" r="1.7" fill="#f8f6ee"/>
  <circle cx="5.3" cy="30" r="1.7" fill="#f8f6ee"/>
  <circle cx="18.7" cy="30" r="1.7" fill="#f8f6ee"/>
</svg>
`);

const computeSpotAngleDeg = (ring) => {
  if (!ring || ring.length < 3) return 0;
  const p1 = ring[1];
  const p2 = ring[2];
  const latAvgRad = ((p1[1] + p2[1]) / 2) * (Math.PI / 180);
  const dx = (p2[0] - p1[0]) * Math.cos(latAvgRad);
  const dy = p2[1] - p1[1];
  let angle = (Math.atan2(dx, dy) * 180) / Math.PI;
  if (angle < 0) angle += 360;
  return angle;
};

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

const toLocalDatetimeValue = (date) => toLocalValueDT(date);

const IconPlate = (props) => (
  <svg width="15" height="15" viewBox="0 0 24 24" {...props}>
    <rect
      x="2.5"
      y="6"
      width="19"
      height="12"
      rx="2.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    <path
      d="M6.5 10h4M6.5 14h7"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
);

const IconCar = (props) => (
  <svg width="15" height="15" viewBox="0 0 24 24" {...props}>
    <path
      d="M4 15.5 5.6 10a2 2 0 0 1 1.9-1.4h9a2 2 0 0 1 1.9 1.4L20 15.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect
      x="3"
      y="15.5"
      width="18"
      height="4"
      rx="1.4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    <circle cx="7.5" cy="19.5" r="1.4" fill="currentColor" />
    <circle cx="16.5" cy="19.5" r="1.4" fill="currentColor" />
  </svg>
);

const IconPalette = (props) => (
  <svg width="15" height="15" viewBox="0 0 24 24" {...props}>
    <path
      d="M12 3a9 9 0 1 0 0 18c1.2 0 1.8-.9 1.8-1.8 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-.9.7-1.6 1.6-1.6H16a4 4 0 0 0 4-4c0-4.4-3.6-8.2-8-8.2Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <circle cx="7.3" cy="10.3" r="1.1" fill="currentColor" />
    <circle cx="9.8" cy="7" r="1.1" fill="currentColor" />
    <circle cx="14.3" cy="7.3" r="1.1" fill="currentColor" />
  </svg>
);

const IconPhone = (props) => (
  <svg width="15" height="15" viewBox="0 0 24 24" {...props}>
    <path
      d="M6 3.5h2.4l1.3 3.7-1.7 1.5a10.5 10.5 0 0 0 5.3 5.3l1.5-1.7 3.7 1.3V16a2.5 2.5 0 0 1-2.5 2.5h-.7C9.9 18.5 5.5 14.1 5.3 8.7v-.7A2.5 2.5 0 0 1 6 3.5Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
  </svg>
);

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

  const setTomorrow = () => {
    const base = new Date();
    base.setDate(base.getDate() + 1);
    const next =
      min && base < min
        ? new Date(min)
        : new Date(
            base.getFullYear(),
            base.getMonth(),
            base.getDate(),
            selected.getHours(),
            selected.getMinutes(),
          );
    setViewDate(new Date(next.getFullYear(), next.getMonth(), 1));
    commit(next);
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
              className={styles.dtQuickBtn}
              onClick={setTomorrow}
            >
              Sabah
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
  const labelsLayerRef = useRef(null);
  const spotsRef = useRef(spots);

  const [selectedSpot, setSelectedSpot] = useState(null);
  const [reservationType, setReservationType] = useState("now");
  const [form, setForm] = useState({
    plate: "",
    brand: "",
    color: "",
    phone: "",
    startTime: "",
  });

  const [submitStep, setSubmitStep] = useState("idle");

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
      zoom: 20,
      constraints: {
        minZoom: 15,
        maxZoom: 25,
        lods: EXTENDED_LODS,
        snapToZoom: false,
        rotationEnabled: false,
      },
    });

    const graphicsLayer = new GraphicsLayer();
    const labelsLayer = new GraphicsLayer();
    map.addMany([graphicsLayer, labelsLayer]);
    graphicsLayerRef.current = graphicsLayer;
    labelsLayerRef.current = labelsLayer;

    let hoveredId = null;

    const setSpotSymbol = (graphic, hovered) => {
      const status = graphic.attributes.status;
      graphic.symbol = {
        type: "simple-fill",
        color: hovered
          ? STATUS_HOVER_FILL[status] || STATUS_HOVER_FILL.empty
          : STATUS_COLORS[status] || STATUS_COLORS.empty,
        outline: {
          color: STATUS_OUTLINE[status] || [255, 255, 255, 0.8],
          width: hovered ? 2.2 : 1.2,
        },
      };
    };

    view.on("pointer-move", (event) => {
      view.hitTest(event).then((response) => {
        const result = response.results.find(
          (r) => r.graphic?.attributes?.spotId,
        );
        const layer = graphicsLayerRef.current;
        if (!layer) return;

        const nextHoveredId = result?.graphic?.attributes?.spotId || null;

        if (hoveredId && hoveredId !== nextHoveredId) {
          const prev = layer.graphics.find(
            (g) => g.attributes.spotId === hoveredId,
          );
          if (prev) setSpotSymbol(prev, false);
          hoveredId = null;
        }

        if (result) {
          hoveredId = nextHoveredId;
          setSpotSymbol(result.graphic, true);
          mapDivRef.current.style.cursor = "pointer";
        } else {
          mapDivRef.current.style.cursor = "default";
        }
      });
    });

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
            view.goTo(
              { target: result.graphic.geometry, scale: view.scale * 0.55 },
              { duration: 450, easing: "ease-in-out" },
            );

            setSelectedSpot(spot);
            setReservationType("now");
            setSubmitStep("idle");
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

    view.watch("zoom", (zoom) => {
      if (labelsLayerRef.current) {
        labelsLayerRef.current.visible = zoom >= 20;
      }
    });

    const zoomWidget = new Zoom({ view, layout: "vertical" });
    view.ui.add(zoomWidget, "bottom-right");

    view.popup.autoOpenEnabled = false;
    viewRef.current = view;

    return () => view.destroy();
  }, [parkingId]);

  useEffect(() => {
    const layer = graphicsLayerRef.current;
    const labelsLayer = labelsLayerRef.current;
    if (!layer || !labelsLayer) return;

    layer.removeAll();
    labelsLayer.removeAll();

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
          outline: {
            color: STATUS_OUTLINE[spot.status] || [255, 255, 255, 0.8],
            width: 1.2,
          },
        },
        attributes: { spotId: spot.id, status: spot.status },
      });
      layer.add(graphic);

      if (spot.status === "occupied") {
        const carIcon = new Graphic({
          geometry: {
            type: "point",
            longitude: spot.center.lng,
            latitude: spot.center.lat,
          },
          symbol: {
            type: "picture-marker",
            url: CAR_ICON_SVG,
            width: 11,
            height: 18,
            angle: computeSpotAngleDeg(spot.polygon),
          },
        });
        labelsLayer.add(carIcon);
      } else {
        const label = new Graphic({
          geometry: {
            type: "point",
            longitude: spot.center.lng,
            latitude: spot.center.lat,
          },
          symbol: {
            type: "text",
            text: spot.label,
            color: [26, 24, 21, 1],
            haloColor: [255, 255, 255, 0.85],
            haloSize: 1,
            font: { size: 8, family: "JetBrains Mono", weight: "bold" },
          },
        });
        labelsLayer.add(label);
      }
    });
  }, [spots]);

  const closeModal = () => {
    if (submitStep === "submitting") return;
    setSelectedSpot(null);
    setSubmitStep("idle");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (submitStep !== "idle") return;
    if (!form.plate || !form.brand || !form.phone) return;
    if (reservationType === "later" && !form.startTime) return;

    setSubmitStep("submitting");

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

    setTimeout(() => {
      addReservation(reservation);
      updateSpotStatus(selectedSpot.id, spotStatus, reservation.car);
      setSubmitStep("success");

      setTimeout(() => {
        navigate("/cars/reservations");
      }, 1150);
    }, 550);
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

  const totalCount = spots.length || 1;
  const emptyCount = spots.filter((s) => s.status === "empty").length;
  const occupiedCount = spots.filter((s) => s.status === "occupied").length;
  const reservedCount = spots.filter((s) => s.status === "reserved").length;

  const badgeClass = (status) =>
    status === "occupied"
      ? styles.badgeRed
      : status === "reserved"
        ? styles.badgeCyan
        : "";

  return (
    <div className={styles.page}>
      <CarsSidebar />
      <main className={styles.content}>
        <div className={styles.mapWrapper}>
          <div ref={mapDivRef} className={styles.mapContainer} />
        </div>

        <div className={styles.topBar}>
          <div className={styles.topBarMain}>
            <div className={styles.parkingMark}>P</div>
            <div>
              <h2>{parking.name}</h2>
              <span className={styles.liveTag}>
                <span className={styles.liveDot} /> canlı status
              </span>
            </div>
          </div>

          <div className={styles.topBarDivider} />

          <div className={styles.statsBlock}>
            <div className={styles.statsHeadRow}>
              <span className={styles.statsCount}>
                {emptyCount}
                <span> / {totalCount} boş</span>
              </span>
            </div>
            <div className={styles.availabilityBar}>
              <div
                className={`${styles.availabilitySeg} ${styles.segEmpty}`}
                style={{ flexBasis: `${(emptyCount / totalCount) * 100}%` }}
              />
              <div
                className={`${styles.availabilitySeg} ${styles.segOccupied}`}
                style={{ flexBasis: `${(occupiedCount / totalCount) * 100}%` }}
              />
              <div
                className={`${styles.availabilitySeg} ${styles.segReserved}`}
                style={{ flexBasis: `${(reservedCount / totalCount) * 100}%` }}
              />
            </div>
            <span className={styles.statsLabel}>
              {parking.pricePerHour} AZN/saat
            </span>
          </div>
        </div>

        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <i className={styles.dotGreen} />
            <span className={styles.legendLabel}>Boş</span>
            <span className={styles.legendCount}>{emptyCount}</span>
          </div>
          <div className={styles.legendItem}>
            <i className={styles.dotRed} />
            <span className={styles.legendLabel}>Dolu</span>
            <span className={styles.legendCount}>{occupiedCount}</span>
          </div>
          <div className={styles.legendItem}>
            <i className={styles.dotYellow} />
            <span className={styles.legendLabel}>Rezerv</span>
            <span className={styles.legendCount}>{reservedCount}</span>
          </div>
        </div>

        {selectedSpot && (
          <div className={styles.modalOverlay} onClick={closeModal}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              {submitStep !== "success" && (
                <button className={styles.closeBtn} onClick={closeModal}>
                  ✕
                </button>
              )}

              {selectedSpot.status !== "empty" ? (
                <>
                  <div className={styles.modalHeader}>
                    <div
                      className={`${styles.spotBadge} ${badgeClass(selectedSpot.status)}`}
                    >
                      {selectedSpot.label}
                    </div>
                    <div>
                      <h3>Yer {selectedSpot.label}</h3>
                      <div className={styles.modalSub}>
                        {selectedSpot.status === "reserved"
                          ? "Rezerv olunub"
                          : "Tutulub"}
                      </div>
                    </div>
                  </div>
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
              ) : submitStep === "success" ? (
                <div className={styles.successWrap}>
                  <div className={styles.successRing}>
                    <svg width="30" height="30" viewBox="0 0 24 24">
                      <path
                        d="M5 12.5 10 17.5 19 7"
                        className={styles.successCheck}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className={styles.successTitle}>
                    Rezervasiya təsdiqləndi
                  </div>
                  <div className={styles.successSub}>
                    Yer {selectedSpot.label} · {form.plate.toUpperCase()}
                  </div>
                </div>
              ) : (
                <>
                  <div className={styles.modalHeader}>
                    <div className={styles.spotBadge}>{selectedSpot.label}</div>
                    <div>
                      <h3>Yer {selectedSpot.label}</h3>
                      <div className={styles.modalSub}>Rezervasiya</div>
                    </div>
                  </div>

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
                    <div className={styles.inputWrap}>
                      <span className={styles.inputIcon}>
                        <IconPlate />
                      </span>
                      <input
                        placeholder="Dövlət nömrəsi (10-AB-234)"
                        value={form.plate}
                        onChange={(e) =>
                          setForm({ ...form, plate: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className={styles.inputWrap}>
                      <span className={styles.inputIcon}>
                        <IconCar />
                      </span>
                      <input
                        placeholder="Marka (Toyota, BMW...)"
                        value={form.brand}
                        onChange={(e) =>
                          setForm({ ...form, brand: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className={styles.inputWrap}>
                      <span className={styles.inputIcon}>
                        <IconPalette />
                      </span>
                      <input
                        placeholder="Rəng"
                        value={form.color}
                        onChange={(e) =>
                          setForm({ ...form, color: e.target.value })
                        }
                      />
                    </div>

                    <div className={styles.inputWrap}>
                      <span className={styles.inputIcon}>
                        <IconPhone />
                      </span>
                      <input
                        placeholder="Telefon nömrəsi"
                        value={form.phone}
                        onChange={(e) =>
                          setForm({ ...form, phone: e.target.value })
                        }
                        required
                      />
                    </div>

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
                      disabled={submitStep !== "idle"}
                    >
                      {submitStep === "submitting" && (
                        <span className={styles.spinner} />
                      )}
                      {submitStep === "submitting"
                        ? "Göndərilir..."
                        : reservationType === "now"
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
