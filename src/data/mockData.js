import { generateSpotsFromQuad, estimateRowCount } from "./spotGeometry";

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

export const parkings = [
  {
    id: "prk-001",
    name: "Avtomobil dayanacağı",
    address: "Fətəli Xan Xoyski, Bakı",
    coordinates: { lat: 40.4018936, lng: 49.8564804 },
    pricePerHour: 1.5,
    workingHours: "24 saat",
    zones: ["A"],
    hasEV: false,
    hasDisabledSpots: true,
  },
  {
    id: "prk-002",
    name: "Free Parking",
    address: "Bakı",
    coordinates: { lat: 40.38401233, lng: 49.82473281 },
    pricePerHour: 1,
    workingHours: "24 saat",
    zones: ["A"],
    hasEV: false,
    hasDisabledSpots: false,
  },
  {
    id: "prk-003",
    name: "Port Baku Parking",
    address: "Port Baku, Bakı",
    coordinates: { lat: 40.37966774, lng: 49.86112428 },
    pricePerHour: 2,
    workingHours: "24 saat",
    zones: ["A"],
    hasEV: false,
    hasDisabledSpots: true,
  },
  {
    id: "prk-004",
    name: "Diamed Auto Parking",
    address: "Bakı",
    coordinates: { lat: 40.40251145, lng: 49.84760727 },
    pricePerHour: 1.5,
    workingHours: "24 saat",
    zones: ["A"],
    hasEV: false,
    hasDisabledSpots: false,
  },
  {
    id: "prk-005",
    name: "Valet Parking",
    address: "Bakı",
    coordinates: { lat: 40.404616, lng: 49.83832591 },
    pricePerHour: 2.5,
    workingHours: "24 saat",
    zones: ["A"],
    hasEV: false,
    hasDisabledSpots: false,
  },
  {
    id: "prk-006",
    name: "Garage AzParkinq",
    address: "Bakı",
    coordinates: { lat: 40.36997474, lng: 49.83535801 },
    pricePerHour: 1,
    workingHours: "24 saat",
    zones: ["A"],
    hasEV: false,
    hasDisabledSpots: false,
  },
  {
    id: "prk-007",
    name: "Hilton Baku Parking",
    address: "Hilton Baku, Bakı",
    coordinates: { lat: 40.37229124, lng: 49.85028046 },
    pricePerHour: 3,
    workingHours: "24 saat",
    zones: ["A"],
    hasEV: true,
    hasDisabledSpots: true,
  },
  {
    id: "prk-008",
    name: "Lion Group Parking",
    address: "Bakı",
    coordinates: { lat: 40.38252165, lng: 49.83754824 },
    pricePerHour: 1.5,
    workingHours: "24 saat",
    zones: ["A"],
    hasEV: false,
    hasDisabledSpots: false,
  },
];

const PARKING_AREAS = {
  "prk-001": {
    zones: {
      A: {
        corners: {
          TL: { lat: 40.40186807, lng: 49.85622559 },
          TR: { lat: 40.40200083, lng: 49.85681031 },
          BR: { lat: 40.40190892, lng: 49.85681568 },
          BL: { lat: 40.4017639, lng: 49.85625778 },
        },

        rowCount: 2,
        rowOverrides: [
          { insetStartM: 0, insetEndM: 0 },
          { insetStartM: 0, insetEndM: 0 },
        ],
      },
    },
  },

  "prk-002": {
    zones: {
      A: {
        corners: {
          TL: { lat: 40.38402306, lng: 49.82443308 },
          TR: { lat: 40.38414156, lng: 49.82498561 },
          BR: { lat: 40.38400467, lng: 49.82503389 },
          BL: { lat: 40.38388004, lng: 49.82447868 },
        },
      },
    },
  },
  "prk-003": {
    zones: {
      A: {
        corners: {
          TL: { lat: 40.37997678, lng: 49.86112696 },
          TR: { lat: 40.37934134, lng: 49.86128253 },
          BR: { lat: 40.37938834, lng: 49.86110014 },
          BL: { lat: 40.37996452, lng: 49.86098748 },
        },
      },
    },
  },

  "prk-004": {
    zones: {
      A: {
        corners: {
          TL: { lat: 40.40268915, lng: 49.84771657 },
          TR: { lat: 40.40241953, lng: 49.8478319 },
          BR: { lat: 40.40233987, lng: 49.84749663 },
          BL: { lat: 40.40259723, lng: 49.84738397 },
        },
      },
    },
  },

  "prk-005": {
    zones: {
      A: {
        corners: {
          TL: { lat: 40.40472118, lng: 49.83807378 },
          TR: { lat: 40.40481105, lng: 49.8384788 },
          BR: { lat: 40.40451285, lng: 49.83857536 },
          BL: { lat: 40.4044189, lng: 49.83817571 },
        },
      },
    },
  },

  "prk-006": {
    zones: {
      A: {
        corners: {
          TL: { lat: 40.36990629, lng: 49.83481084 },
          TR: { lat: 40.3701842, lng: 49.83584617 },
          BR: { lat: 40.37003911, lng: 49.83591859 },
          BL: { lat: 40.36976937, lng: 49.83485644 },
        },
      },
    },
  },

  "prk-007": {
    zones: {
      A: {
        corners: {
          TL: { lat: 40.37264578, lng: 49.85011148 },
          TR: { lat: 40.37196326, lng: 49.85052186 },
          BR: { lat: 40.3719367, lng: 49.85044139 },
          BL: { lat: 40.37261921, lng: 49.85004711 },
        },
      },
    },
  },

  "prk-008": {
    zones: {
      A: {
        corners: {
          TL: { lat: 40.38282046, lng: 49.83764883 },
          TR: { lat: 40.3823015, lng: 49.83782585 },
          BR: { lat: 40.38222591, lng: 49.83745034 },
          BL: { lat: 40.38273874, lng: 49.83726795 },
        },
      },
    },
  },
};

export const parkingSpots = {};

parkings.forEach((p) => {
  const area = PARKING_AREAS[p.id];
  if (!area) {
    parkingSpots[p.id] = [];
    return;
  }

  const spotsForParking = [];
  Object.entries(area.zones).forEach(([zoneLetter, zoneData]) => {
    spotsForParking.push(
      ...generateSpotsFromQuad(
        p.id,
        zoneLetter,
        zoneData.corners,
        zoneData.rowCount,
        {
          rowOverrides: zoneData.rowOverrides || [],
          spotGapM: 0.25,
        },
        generateFakeCar,
      ),
    );
  });

  parkingSpots[p.id] = spotsForParking;
});

parkings.forEach((p) => {
  p.totalSpots = (parkingSpots[p.id] || []).length;
});

export function getAvailableCount(parkingId) {
  const spots = parkingSpots[parkingId] || [];
  return spots.filter((s) => s.status === "empty").length;
}

export const reservations = [];

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
  mostUsedParkings: [],
  dailyRevenue: [],
  summary: {
    totalParkings: parkings.length,
    totalSpots: parkings.reduce((sum, p) => sum + p.totalSpots, 0),
    totalReservationsToday: 0,
    averageOccupancyRate: 0,
    totalRevenueThisMonth: 0,
  },
};
