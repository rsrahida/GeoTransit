export const busRoutesData = [
  {
    id: "route-1",
    name: "Nərimanov - Sahil",
    color: "#3b8526",
    start: { lon: 49.8746, lat: 40.4093 },
    end: { lon: 49.8419, lat: 40.3707 },

    type: "standart",
    isNightRoute: false,
    isAccessible: true,
    frequencyMinutes: 8,
    firstDeparture: "06:00",
    lastDeparture: "23:30",
    ticketPrice: 0.3,
    operatingDays: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],

    vehicleType: "electric",
    capacity: 80,
    operator: "Bakı Nəqliyyat Agentliyi",

    description:
      "Nərimanov metrosunu Sahil bulvarı ilə birləşdirən, iş günləri ən sıx istifadə olunan xətlərdən biri.",
    highlights: ["Nərimanov metrosu", "Gənclik Mall", "Bakı Bulvarı"],
    coverImage: "/images/routes/route-1.jpg",

    liveTrackingEnabled: true,
    nextArrivalMinutes: 4,
    crowdLevel: "medium",

    connectingRoutes: ["route-5", "route-8"],
    metroConnections: ["Nərimanov", "Sahil"],

    avgDailyPassengers: 4200,
    rating: 4.3,
    reviewCount: 128,

    status: "active",
    alerts: [
      {
        type: "delay",
        message: "Təmir işləri səbəbindən gecikmə mümkündür",
        from: "2026-07-20",
        to: "2026-08-01",
      },
    ],
  },
  {
    id: "route-2",
    name: "20 Yanvar - Xətai",
    color: "#fc56ee",
    start: { lon: 49.8177, lat: 40.3934 },
    end: { lon: 49.859, lat: 40.366 },

    type: "ekspres",
    isNightRoute: false,
    isAccessible: true,
    frequencyMinutes: 12,
    firstDeparture: "06:30",
    lastDeparture: "22:45",
    ticketPrice: 0.3,
    operatingDays: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],

    vehicleType: "diesel",
    capacity: 90,
    operator: "Bakı Nəqliyyat Agentliyi",

    description:
      "20 Yanvar metrostansiyasından Xətai rayonuna sürətli çatım təmin edən ekspres tipli marşrut.",
    highlights: ["20 Yanvar metrosu", "Xətai bazarı", "28 May küçəsi"],
    coverImage: "/images/routes/route-2.jpg",

    liveTrackingEnabled: true,
    nextArrivalMinutes: 6,
    crowdLevel: "high",

    connectingRoutes: ["route-6", "route-10"],
    metroConnections: ["20 Yanvar"],

    avgDailyPassengers: 5100,
    rating: 4.1,
    reviewCount: 96,

    status: "active",
    alerts: [],
  },
  {
    id: "route-3",
    name: "Dərnəgül - Badamdar",
    color: "#42C5F5",
    start: { lon: 49.8619, lat: 40.4256 },
    end: { lon: 49.8039, lat: 40.3394 },

    type: "standart",
    isNightRoute: false,
    isAccessible: false,
    frequencyMinutes: 15,
    firstDeparture: "06:00",
    lastDeparture: "22:00",
    ticketPrice: 0.3,
    operatingDays: ["mon", "tue", "wed", "thu", "fri", "sat"],

    vehicleType: "diesel",
    capacity: 70,
    operator: "Bakı Nəqliyyat Agentliyi",

    description:
      "Dərnəgül qəsəbəsini şəhərin cənub hissəsindəki Badamdar ilə birləşdirən uzun marşrut.",
    highlights: [
      "Dərnəgül metrosu",
      "Badamdar parkı",
      "Şıxov çimərliyinə yaxın",
    ],
    coverImage: "/images/routes/route-3.jpg",

    liveTrackingEnabled: false,
    nextArrivalMinutes: null,
    crowdLevel: "low",

    connectingRoutes: ["route-8"],
    metroConnections: ["Dərnəgül"],

    avgDailyPassengers: 2800,
    rating: 3.9,
    reviewCount: 54,

    status: "active",
    alerts: [],
  },
  {
    id: "route-4",
    name: "Həzi Aslanov - Neftçilər",
    color: "#A742F5",
    start: { lon: 49.9418, lat: 40.3717 },
    end: { lon: 49.937, lat: 40.4062 },

    type: "standart",
    isNightRoute: false,
    isAccessible: true,
    frequencyMinutes: 10,
    firstDeparture: "05:45",
    lastDeparture: "23:00",
    ticketPrice: 0.3,
    operatingDays: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],

    vehicleType: "electric",
    capacity: 80,
    operator: "Bakı Nəqliyyat Agentliyi",

    description:
      "Həzi Aslanov metrosunu Neftçilər prospekti boyunca sənaye zonasına bağlayan işçi marşrutu.",
    highlights: [
      "Həzi Aslanov metrosu",
      "Neftçilər prospekti",
      "Sənaye rayonu",
    ],
    coverImage: "/images/routes/route-4.jpg",

    liveTrackingEnabled: true,
    nextArrivalMinutes: 3,
    crowdLevel: "high",

    connectingRoutes: [],
    metroConnections: ["Həzi Aslanov"],

    avgDailyPassengers: 3900,
    rating: 4.0,
    reviewCount: 71,

    status: "active",
    alerts: [],
  },
  {
    id: "route-5",
    name: "Qara Qarayev - Nərimanov",
    color: "#4296f5",
    start: { lon: 49.9236, lat: 40.4184 },
    end: { lon: 49.8746, lat: 40.4093 },

    type: "ekspres",
    isNightRoute: false,
    isAccessible: true,
    frequencyMinutes: 9,
    firstDeparture: "06:00",
    lastDeparture: "23:15",
    ticketPrice: 0.3,
    operatingDays: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],

    vehicleType: "electric",
    capacity: 85,
    operator: "Bakı Nəqliyyat Agentliyi",

    description:
      "İki mühüm metrostansiyanı - Qara Qarayev və Nərimanovu - birbaşa bağlayan sürətli xətt.",
    highlights: ["Qara Qarayev metrosu", "Nərimanov metrosu"],
    coverImage: "/images/routes/route-5.jpg",

    liveTrackingEnabled: true,
    nextArrivalMinutes: 5,
    crowdLevel: "medium",

    connectingRoutes: ["route-1"],
    metroConnections: ["Qara Qarayev", "Nərimanov"],

    avgDailyPassengers: 4600,
    rating: 4.4,
    reviewCount: 112,

    status: "active",
    alerts: [],
  },
  {
    id: "route-6",
    name: "İçərişəhər - 28 May",
    color: "#42F5A7",
    start: { lon: 49.8347, lat: 40.3656 },
    end: { lon: 49.848, lat: 40.3776 },

    type: "gecə",
    isNightRoute: true,
    isAccessible: false,
    frequencyMinutes: 20,
    firstDeparture: "23:00",
    lastDeparture: "05:00",
    ticketPrice: 0.4,
    operatingDays: ["fri", "sat"],

    vehicleType: "diesel",
    capacity: 60,
    operator: "Bakı Nəqliyyat Agentliyi",

    description:
      "Şəhər mərkəzini gecə saatlarında xidmət edən, İçərişəhər ilə 28 May meydanını bağlayan gecə marşrutu.",
    highlights: ["İçərişəhər", "Fəvvarələr meydanı", "28 May meydanı"],
    coverImage: "/images/routes/route-6.jpg",

    liveTrackingEnabled: false,
    nextArrivalMinutes: null,
    crowdLevel: "low",

    connectingRoutes: ["route-2"],
    metroConnections: ["İçərişəhər", "28 May"],

    avgDailyPassengers: 900,
    rating: 4.2,
    reviewCount: 33,

    status: "active",
    alerts: [
      {
        type: "info",
        message: "Yalnız cümə və şənbə gecələri fəaliyyət göstərir",
        from: "2026-01-01",
        to: "2026-12-31",
      },
    ],
  },
  {
    id: "route-7",
    name: "Gənclik - İnşaatçılar",
    color: "#F58442",
    start: { lon: 49.8419, lat: 40.3959 },
    end: { lon: 49.8248, lat: 40.3843 },

    type: "standart",
    isNightRoute: false,
    isAccessible: true,
    frequencyMinutes: 14,
    firstDeparture: "06:15",
    lastDeparture: "22:30",
    ticketPrice: 0.3,
    operatingDays: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],

    vehicleType: "hybrid",
    capacity: 75,
    operator: "Bakı Nəqliyyat Agentliyi",

    description:
      "Gənclik metrosundan İnşaatçılar qəsəbəsinə qədər yaşayış massivlərini əhatə edən qısa marşrut.",
    highlights: ["Gənclik metrosu", "İnşaatçılar meydanı"],
    coverImage: "/images/routes/route-7.jpg",

    liveTrackingEnabled: true,
    nextArrivalMinutes: 7,
    crowdLevel: "medium",

    connectingRoutes: [],
    metroConnections: ["Gənclik", "İnşaatçılar"],

    avgDailyPassengers: 2400,
    rating: 3.8,
    reviewCount: 41,

    status: "active",
    alerts: [],
  },
  {
    id: "route-8",
    name: "Badamdar - Sahil",
    color: "#d984f6",
    start: { lon: 49.8039, lat: 40.3394 },
    end: { lon: 49.8419, lat: 40.3707 },

    type: "standart",
    isNightRoute: false,
    isAccessible: false,
    frequencyMinutes: 16,
    firstDeparture: "06:30",
    lastDeparture: "22:00",
    ticketPrice: 0.3,
    operatingDays: ["mon", "tue", "wed", "thu", "fri", "sat"],

    vehicleType: "diesel",
    capacity: 70,
    operator: "Bakı Nəqliyyat Agentliyi",

    description:
      "Badamdar yüksəkliklərini şəhər mərkəzindəki Sahil bulvarı ilə birləşdirən mənzərəli marşrut.",
    highlights: ["Badamdar parkı", "Şıxov yolu", "Sahil bulvarı"],
    coverImage: "/images/routes/route-8.jpg",

    liveTrackingEnabled: false,
    nextArrivalMinutes: null,
    crowdLevel: "low",

    connectingRoutes: ["route-1", "route-3"],
    metroConnections: ["Sahil"],

    avgDailyPassengers: 2100,
    rating: 3.7,
    reviewCount: 29,

    status: "active",
    alerts: [],
  },
  {
    id: "route-9",
    name: "Xocəsən - Nizami",
    color: "#6BF5C9",
    start: { lon: 49.781, lat: 40.437 },
    end: { lon: 49.8544, lat: 40.383 },

    type: "ekspres",
    isNightRoute: false,
    isAccessible: true,
    frequencyMinutes: 18,
    firstDeparture: "06:00",
    lastDeparture: "21:45",
    ticketPrice: 0.35,
    operatingDays: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],

    vehicleType: "diesel",
    capacity: 90,
    operator: "Bakı Nəqliyyat Agentliyi",

    description:
      "Şəhərin şimal-qərb ətraf ərazisi Xocəsəni Nizami metrostansiyası ilə bağlayan uzun məsafəli ekspres xətt.",
    highlights: ["Xocəsən qəsəbəsi", "Nizami metrosu"],
    coverImage: "/images/routes/route-9.jpg",

    liveTrackingEnabled: true,
    nextArrivalMinutes: 11,
    crowdLevel: "medium",

    connectingRoutes: [],
    metroConnections: ["Nizami"],

    avgDailyPassengers: 3300,
    rating: 4.0,
    reviewCount: 58,

    status: "active",
    alerts: [],
  },
  {
    id: "route-10",
    name: "Avtovağzal - Memar Əcəmi",
    color: "#F5426B",
    start: { lon: 49.796, lat: 40.4295 },
    end: { lon: 49.8085, lat: 40.402 },

    type: "standart",
    isNightRoute: false,
    isAccessible: true,
    frequencyMinutes: 11,
    firstDeparture: "05:30",
    lastDeparture: "23:45",
    ticketPrice: 0.3,
    operatingDays: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],

    vehicleType: "electric",
    capacity: 80,
    operator: "Bakı Nəqliyyat Agentliyi",

    description:
      "Beynəlxalq Avtovağzalı Memar Əcəmi metrostansiyası ilə birləşdirən, gündəlik sərnişin dövriyyəsi yüksək marşrut.",
    highlights: ["Beynəlxalq Avtovağzal", "Memar Əcəmi metrosu"],
    coverImage: "/images/routes/route-10.jpg",

    liveTrackingEnabled: true,
    nextArrivalMinutes: 2,
    crowdLevel: "high",

    connectingRoutes: ["route-2"],
    metroConnections: ["Memar Əcəmi"],

    avgDailyPassengers: 4800,
    rating: 4.2,
    reviewCount: 87,

    status: "active",
    alerts: [
      {
        type: "delay",
        message: "Avtovağzal qarşısında yol işləri davam edir",
        from: "2026-07-15",
        to: "2026-08-10",
      },
    ],
  },
];
