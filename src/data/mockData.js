const METERS_PER_DEGREE_LAT = 111320;

function metersToLatLng(centerLat, centerLng, offsetEastM, offsetNorthM) {
  const metersPerDegreeLng =
    METERS_PER_DEGREE_LAT * Math.cos((centerLat * Math.PI) / 180);

  const deltaLat = offsetNorthM / METERS_PER_DEGREE_LAT;
  const deltaLng = offsetEastM / metersPerDegreeLng;

  return {
    lat: centerLat + deltaLat,
    lng: centerLng + deltaLng,
  };
}

function buildSpotPolygon(
  parkingLat,
  parkingLng,
  centerOffsetEastM,
  centerOffsetNorthM,
  widthM,
  lengthM,
) {
  const halfW = widthM / 2;
  const halfL = lengthM / 2;

  const localCorners = [
    { e: -halfW, n: -halfL },
    { e: halfW, n: -halfL },
    { e: halfW, n: halfL },
    { e: -halfW, n: halfL },
  ];

  const ring = localCorners.map(({ e, n }) => {
    const point = metersToLatLng(
      parkingLat,
      parkingLng,
      centerOffsetEastM + e,
      centerOffsetNorthM + n,
    );
    return [point.lng, point.lat];
  });

  ring.push(ring[0]);
  return ring;
}

const SPOT_WIDTH_M = 2.5;
const SPOT_LENGTH_M = 5;
const SPOT_GAP_M = 0.6;
const ROW_AISLE_M = 6;
const SPOTS_PER_ROW = 5;

const ZONE_OFFSETS = {
  A: { e: -35, n: 0 },
  B: { e: 0, n: 0 },
  C: { e: 35, n: 0 },
};

const carBrands = [
  "Mercedes",
  "BMW",
  "Toyota",
  "Hyundai",
  "Kia",
  "Chevrolet",
  "Nissan",
  "Lexus",
];
const carColors = ["Ağ", "Qara", "Boz", "Gümüşü", "Göy", "Qırmızı"];

function generateFakeCar() {
  const letters = "ABCDEFGHIJKLMN";
  const plate = `${10 + Math.floor(Math.random() * 89)}-${letters[Math.floor(Math.random() * letters.length)]}${letters[Math.floor(Math.random() * letters.length)]}-${100 + Math.floor(Math.random() * 899)}`;
  return {
    plate,
    brand: carBrands[Math.floor(Math.random() * carBrands.length)],
    color: carColors[Math.floor(Math.random() * carColors.length)],
    ownerPhone: `+994 ${50 + Math.floor(Math.random() * 20)} ${100 + Math.floor(Math.random() * 899)} ${10 + Math.floor(Math.random() * 89)} ${10 + Math.floor(Math.random() * 89)}`,
  };
}

function generateSpots(
  parkingId,
  parkingLat,
  parkingLng,
  zoneLetter,
  count,
  occupiedRatio = 0.4,
) {
  const spots = [];
  const zoneOffset = ZONE_OFFSETS[zoneLetter] || { e: 0, n: 0 };

  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / SPOTS_PER_ROW);
    const col = i % SPOTS_PER_ROW;

    const localEast = col * (SPOT_WIDTH_M + SPOT_GAP_M) + SPOT_WIDTH_M / 2;
    const localNorth = row * (SPOT_LENGTH_M + ROW_AISLE_M) + SPOT_LENGTH_M / 2;

    const centerOffsetEast = zoneOffset.e + localEast;
    const centerOffsetNorth = zoneOffset.n + localNorth;

    const polygon = buildSpotPolygon(
      parkingLat,
      parkingLng,
      centerOffsetEast,
      centerOffsetNorth,
      SPOT_WIDTH_M,
      SPOT_LENGTH_M,
    );

    const center = metersToLatLng(
      parkingLat,
      parkingLng,
      centerOffsetEast,
      centerOffsetNorth,
    );

    const rand = Math.random();
    let status = "empty";
    if (rand < occupiedRatio) status = "occupied";
    else if (rand < occupiedRatio + 0.1) status = "reserved";

    spots.push({
      id: `${parkingId}-${zoneLetter}${i + 1}`,
      parkingId,
      zone: zoneLetter,
      label: `${zoneLetter}${i + 1}`,
      status,
      type: i % 8 === 0 ? "disabled" : i % 5 === 0 ? "ev" : "regular",
      center,
      polygon,
      car:
        status === "occupied" || status === "reserved"
          ? generateFakeCar()
          : null,
    });
  }
  return spots;
}

export const parkings = [
  {
    id: "prk-001",
    name: "28 Mall Parking",
    address: "Nizami küç. 203, Bakı",
    coordinates: { lat: 40.3777, lng: 49.892 },
    totalSpots: 45,
    pricePerHour: 2,
    workingHours: "08:00 - 24:00",
    zones: ["A", "B", "C"],
    hasEV: true,
    hasDisabledSpots: true,
  },
  {
    id: "prk-002",
    name: "Park Bulvar Parking",
    address: "Neftçilər prospekti 3, Bakı",
    coordinates: { lat: 40.3672, lng: 49.8407 },
    totalSpots: 60,
    pricePerHour: 1.5,
    workingHours: "24 saat",
    zones: ["A", "B"],
    hasEV: true,
    hasDisabledSpots: true,
  },
  {
    id: "prk-003",
    name: "Gənclik Mall Parking",
    address: "Bakıxanov küç., Bakı",
    coordinates: { lat: 40.3853, lng: 49.8497 },
    totalSpots: 30,
    pricePerHour: 1,
    workingHours: "09:00 - 23:00",
    zones: ["A", "B"],
    hasEV: false,
    hasDisabledSpots: true,
  },
  {
    id: "prk-004",
    name: "Dəniz Mall Parking",
    address: "Neftçilər prospekti 90, Bakı",
    coordinates: { lat: 40.3598, lng: 49.8272 },
    totalSpots: 40,
    pricePerHour: 2,
    workingHours: "10:00 - 23:00",
    zones: ["A", "B", "C"],
    hasEV: true,
    hasDisabledSpots: true,
  },
  {
    id: "prk-005",
    name: "Sahil Metro Parking",
    address: "İçərişəhər ətrafı, Bakı",
    coordinates: { lat: 40.3661, lng: 49.8353 },
    totalSpots: 25,
    pricePerHour: 1,
    workingHours: "06:00 - 01:00",
    zones: ["A"],
    hasEV: false,
    hasDisabledSpots: true,
  },
  {
    id: "prk-006",
    name: "Ganjlik Mall Parking",
    address: "Atatürk prospekti, Bakı",
    coordinates: { lat: 40.4021, lng: 49.8698 },
    totalSpots: 35,
    pricePerHour: 1.5,
    workingHours: "09:00 - 22:00",
    zones: ["A", "B"],
    hasEV: false,
    hasDisabledSpots: true,
  },
  {
    id: "prk-007",
    name: "Koroğlu Metro Parking",
    address: "Koroğlu qəs., Bakı",
    coordinates: { lat: 40.4193, lng: 49.9187 },
    totalSpots: 20,
    pricePerHour: 1,
    workingHours: "06:00 - 24:00",
    zones: ["A"],
    hasEV: false,
    hasDisabledSpots: false,
  },
  {
    id: "prk-008",
    name: "White City Parking",
    address: "Heydər Əliyev prospekti, Bakı",
    coordinates: { lat: 40.3711, lng: 49.8598 },
    totalSpots: 50,
    pricePerHour: 2.5,
    workingHours: "24 saat",
    zones: ["A", "B", "C"],
    hasEV: true,
    hasDisabledSpots: true,
  },
];

export const parkingSpots = {};

parkings.forEach((p) => {
  const spotsForParking = [];
  const spotsPerZone = Math.ceil(p.totalSpots / p.zones.length);

  p.zones.forEach((zoneLetter, idx) => {
    const occupiedRatio = 0.3 + idx * 0.15;
    spotsForParking.push(
      ...generateSpots(
        p.id,
        p.coordinates.lat,
        p.coordinates.lng,
        zoneLetter,
        spotsPerZone,
        occupiedRatio,
      ),
    );
  });

  parkingSpots[p.id] = spotsForParking;
});

export function getAvailableCount(parkingId) {
  const spots = parkingSpots[parkingId] || [];
  return spots.filter((s) => s.status === "empty").length;
}

export const reservations = [
  {
    id: "res-1001",
    parkingId: "prk-001",
    spotId: "prk-001-A3",
    car: {
      plate: "10-AB-234",
      brand: "Toyota",
      color: "Ağ",
      ownerPhone: "+994 50 234 12 34",
    },
    startTime: "2026-07-10T09:00:00",
    endTime: "2026-07-10T12:00:00",
    status: "active",
    totalPrice: 6,
  },
  {
    id: "res-1002",
    parkingId: "prk-002",
    spotId: "prk-002-B7",
    car: {
      plate: "77-CD-901",
      brand: "BMW",
      color: "Qara",
      ownerPhone: "+994 55 678 45 67",
    },
    startTime: "2026-07-09T14:00:00",
    endTime: "2026-07-09T18:00:00",
    status: "completed",
    totalPrice: 6,
  },
  {
    id: "res-1003",
    parkingId: "prk-003",
    spotId: "prk-003-A5",
    car: {
      plate: "90-EF-112",
      brand: "Hyundai",
      color: "Boz",
      ownerPhone: "+994 51 890 78 90",
    },
    startTime: "2026-07-10T18:00:00",
    endTime: "2026-07-10T20:00:00",
    status: "pending",
    totalPrice: 2,
  },
  {
    id: "res-1004",
    parkingId: "prk-004",
    spotId: "prk-004-C2",
    car: {
      plate: "33-GH-556",
      brand: "Kia",
      color: "Göy",
      ownerPhone: "+994 70 345 23 45",
    },
    startTime: "2026-07-08T10:00:00",
    endTime: "2026-07-08T11:00:00",
    status: "cancelled",
    totalPrice: 2,
  },
];

export const statistics = {
  hourlyOccupancy: [
    { hour: "00:00", occupancy: 20 },
    { hour: "03:00", occupancy: 15 },
    { hour: "06:00", occupancy: 25 },
    { hour: "09:00", occupancy: 70 },
    { hour: "12:00", occupancy: 85 },
    { hour: "15:00", occupancy: 78 },
    { hour: "18:00", occupancy: 92 },
    { hour: "21:00", occupancy: 60 },
  ],

  mostUsedParkings: [
    { parkingId: "prk-001", name: "28 Mall Parking", usageCount: 340 },
    { parkingId: "prk-002", name: "Park Bulvar Parking", usageCount: 290 },
    { parkingId: "prk-004", name: "Dəniz Mall Parking", usageCount: 210 },
    { parkingId: "prk-003", name: "Gənclik Mall Parking", usageCount: 150 },
    { parkingId: "prk-005", name: "Sahil Metro Parking", usageCount: 95 },
  ],

  dailyRevenue: [
    { date: "2026-07-04", revenue: 145 },
    { date: "2026-07-05", revenue: 168 },
    { date: "2026-07-06", revenue: 132 },
    { date: "2026-07-07", revenue: 190 },
    { date: "2026-07-08", revenue: 175 },
    { date: "2026-07-09", revenue: 210 },
    { date: "2026-07-10", revenue: 98 },
  ],

  summary: {
    totalParkings: parkings.length,
    totalSpots: parkings.reduce((sum, p) => sum + p.totalSpots, 0),
    totalReservationsToday: 24,
    averageOccupancyRate: 68,
    totalRevenueThisMonth: 4230,
  },
};
