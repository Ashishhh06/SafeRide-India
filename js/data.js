/**
 * SafeRide India v3.0 — Multi-City Centralized Data Store
 * Supports: Hyderabad, Bengaluru
 * All pages read exclusively from this file via getCityData().
 */

/* ============================================================
   UTILITIES — SEAT & CROWD ENGINE
   ============================================================ */

/** Returns realistic occupancy % for a bus based on time + variance */
/** Returns realistic occupancy % based on time + variance */
function getOccupancyPercent(variance = 0, specificHour = null) {
    const h = specificHour !== null ? specificHour : new Date().getHours();
    let base;

    // 7 AM – 10 AM → Peak (High)
    if (h >= 7 && h <= 10) base = 85;
    // 5 PM – 9 PM → Peak (High)
    else if (h >= 17 && h <= 21) base = 85;
    // 11 AM – 4 PM → Medium
    else if (h >= 11 && h <= 16) base = 55;
    // Late night → Low
    else if (h < 6 || h >= 22) base = 15;
    else base = 40;

    const rand = Math.floor(Math.random() * 15) - 7;
    return Math.max(2, Math.min(100, base + variance + rand));
}

/** Returns crowd label + seat info for a vehicle */
function getSeatsInfo(totalSeats, occupancyPct) {
    const occupied = Math.round(totalSeats * occupancyPct / 100);
    const available = Math.max(0, totalSeats - occupied);
    return {
        total: totalSeats, occupied, available,
        standingOnly: occupancyPct > 75 && available === 0,
        isFull: available === 0
    };
}

/** Returns crowd details from occupancy % */
function getCrowdDetails(pct) {
    if (pct <= 40) return { label: "Low", color: "success", pct, message: "Comfortable — Plenty of seats", canBoard: true, icon: "✅" };
    if (pct <= 75) return { label: "Medium", color: "warning", pct, message: "Moderate — Some seats available", canBoard: true, icon: "⚠️" };
    return { label: "High", color: "danger", pct, message: "Overcrowded — Standing only", canBoard: false, icon: "🚫" };
}

/** Generates next N arrival times (in minutes) from now */
function getNextArrivals(frequencyMins, count = 3) {
    const now = new Date();
    const arrivals = [];
    let next = frequencyMins - (now.getMinutes() % frequencyMins);
    if (next === frequencyMins) next = 0;
    for (let i = 0; i < count; i++) {
        const t = new Date(now.getTime() + (next + i * frequencyMins) * 60000);
        arrivals.push({
            minsAway: next + i * frequencyMins,
            time: t.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        });
    }
    return arrivals;
}

/* ============================================================
   MULTI-CITY TRANSPORT DATA
   ============================================================ */
const transportData = {

    /* ────────────── HYDERABAD ────────────── */
    "Hyderabad": {
        theme: "#1e40af",
        currency: "₹",
        bus: [
            {
                route: "45D", type: "Express", vehicleId: "TS09-UB-4502",
                origin: "Secunderabad", destination: "Miyapur",
                stops: ["Secunderabad", "Paradise", "Begumpet", "Ameerpet", "SR Nagar", "Erragadda", "Kukatpally", "KPHB", "Miyapur"],
                timings: { first: "05:30", last: "22:30", frequency: 15 },
                fare: 25, avgTime: 55, totalSeats: 55
            },
            {
                route: "29X", type: "AC", vehicleId: "TS09-UB-2912",
                origin: "Secunderabad", destination: "Hitech City",
                stops: ["Secunderabad", "Begumpet", "Ameerpet", "Madhapur", "Mindspace", "Hitech City"],
                timings: { first: "06:00", last: "21:00", frequency: 20 },
                fare: 45, avgTime: 45, totalSeats: 40
            },
            {
                route: "18C", type: "Ordinary", vehicleId: "TS09-UB-1804",
                origin: "Nampally", destination: "Falaknuma",
                stops: ["Nampally", "Mozamjahi Market", "MGBS", "Charminar", "Falaknuma"],
                timings: { first: "05:00", last: "23:00", frequency: 10 },
                fare: 15, avgTime: 30, totalSeats: 65
            },
            {
                route: "127K", type: "Express", vehicleId: "TS09-UB-1271",
                origin: "Koti", destination: "Kondapur",
                stops: ["Koti", "Abids", "Lakdikapul", "Punjagutta", "Banjara Hills", "Jubilee Hills", "Kondapur"],
                timings: { first: "06:15", last: "21:45", frequency: 25 },
                fare: 35, avgTime: 60, totalSeats: 55
            },
            {
                route: "216C", type: "Express", vehicleId: "TS09-UB-2161",
                origin: "LB Nagar", destination: "Hitech City",
                stops: ["LB Nagar", "Dilsukhnagar", "Uppal", "Tarnaka", "Secunderabad", "Begumpet", "Ameerpet", "Hitech City"],
                timings: { first: "05:45", last: "22:00", frequency: 20 },
                fare: 40, avgTime: 75, totalSeats: 55
            },
            {
                route: "88K", type: "AC", vehicleId: "TS09-UB-8801",
                origin: "Miyapur", destination: "Raidurg",
                stops: ["Miyapur", "KPHB", "Kukatpally", "Balanagar", "Erragadda", "Ameerpet", "Madhapur", "Hitech City", "Raidurg"],
                timings: { first: "06:30", last: "21:30", frequency: 30 },
                fare: 50, avgTime: 65, totalSeats: 40
            }
        ],
        metro: [
            {
                line: "Red Line", color: "#dc2626", lineId: "RL",
                stations: ["Miyapur", "JNTU College", "KPHB Colony", "Kukatpally", "Bharat Nagar", "Erragadda", "ESI Hospital", "SR Nagar", "Ameerpet", "Punjagutta", "Irrum Manzil", "Khairatabad", "Lakdikapul", "Assembly", "Nampally", "Gandhi Bhavan", "Osmania Medical College", "MGBS", "Malakpet", "Saleem Nagar", "Musarambagh", "Dilsukhnagar", "Chaitanyapuri", "Victoria Memorial", "LB Nagar"],
                interchanges: ["Ameerpet", "MGBS"],
                timings: { first: "06:00", last: "23:00", frequency: 6 },
                farePerStation: 1.5, baseFare: 10, totalSeats: 900
            },
            {
                line: "Blue Line", color: "#1d4ed8", lineId: "BL",
                stations: ["Raidurg", "Hitech City", "Madhapur", "Jubilee Hills Check Post", "Road No.5 Jubilee Hills", "Yousufguda", "Madhura Nagar", "Ameerpet", "Begumpet", "Prakash Nagar", "Rasoolpura", "Paradise", "JBS Parade Ground", "Secunderabad East", "Mettuguda", "Tarnaka", "Habsiguda", "NGRI", "Uppal", "Stadium", "Nagole"],
                interchanges: ["Ameerpet", "JBS Parade Ground"],
                timings: { first: "06:00", last: "23:00", frequency: 6 },
                farePerStation: 1.5, baseFare: 10, totalSeats: 900
            },
            {
                line: "Green Line", color: "#16a34a", lineId: "GL",
                stations: ["JBS Parade Ground", "Secunderabad West", "Gandhi Hospital", "Musheerabad", "RTC X Roads", "Chikkadpally", "Narayanaguda", "Sultan Bazar", "MGBS"],
                interchanges: ["JBS Parade Ground", "MGBS"],
                timings: { first: "06:00", last: "23:00", frequency: 10 },
                farePerStation: 1.5, baseFare: 10, totalSeats: 900
            }
        ],
        mmts: [
            {
                route: "Lingampally – Falaknuma", trainId: "MMT-7001",
                stations: ["Lingampally", "Chandanagar", "Hitech City MMTS", "Borabanda", "Bharat Nagar MMTS", "Sanathnagar", "Begumpet", "Nature Cure Hospital", "James Street", "Secunderabad", "Sitaphalmandi", "Arts College", "Jamia Osmania", "Vidyanagar", "Kacheguda", "Malakpet", "Dabirpura", "Yakutpura", "Huppuguda", "Falaknuma"],
                timings: { first: "04:30", last: "23:30", frequency: 40 },
                fare: 10, totalSeats: 400
            },
            {
                route: "Secunderabad – Hyderabad (Nampally)", trainId: "MMT-7002",
                stations: ["Secunderabad", "James Street", "Sanjeevaiah Park", "Begumpet", "Nature Cure Hospital", "Khairatabad", "Lakdikapul", "Hyderabad (Nampally)"],
                timings: { first: "05:00", last: "22:45", frequency: 60 },
                fare: 5, totalSeats: 400
            },
            {
                route: "Secunderabad – Medchal", trainId: "MMT-7003",
                stations: ["Secunderabad", "Mettuguda", "Necklace Road", "Alwal", "Kompally", "Medchal"],
                timings: { first: "05:30", last: "21:00", frequency: 90 },
                fare: 15, totalSeats: 400
            }
        ]
    },

    /* ────────────── BENGALURU ────────────── */
    "Bengaluru": {
        theme: "#15803d",
        currency: "₹",
        bus: [
            {
                route: "500C", type: "AC Volvo", vehicleId: "KA01-F-5001",
                origin: "Majestic", destination: "Electronic City",
                stops: ["Majestic", "Town Hall", "Jayanagar", "Bannerghatta Road", "Silk Board", "Electronic City Phase 1", "Electronic City"],
                timings: { first: "06:00", last: "22:00", frequency: 15 },
                fare: 60, avgTime: 50, totalSeats: 40
            },
            {
                route: "201R", type: "Ordinary", vehicleId: "KA01-F-2013",
                origin: "Hebbal", destination: "Majestic",
                stops: ["Hebbal", "Mehkri Circle", "Sadashivanagar", "Malleswaram", "Rajajinagar", "Majestic"],
                timings: { first: "05:30", last: "23:00", frequency: 10 },
                fare: 20, avgTime: 35, totalSeats: 60
            },
            {
                route: "335E", type: "Express", vehicleId: "KA01-F-3350",
                origin: "Whitefield", destination: "Majestic",
                stops: ["Whitefield", "Marathahalli", "Indiranagar", "Trinity Circle", "KH Road", "Majestic"],
                timings: { first: "06:00", last: "21:30", frequency: 20 },
                fare: 40, avgTime: 55, totalSeats: 55
            },
            {
                route: "G1", type: "Express", vehicleId: "KA01-F-G100",
                origin: "Kempegowda Bus Station", destination: "Koramangala",
                stops: ["Kempegowda Bus Station", "Jayanagar 4th Block", "BTM Layout", "Silk Board", "Koramangala"],
                timings: { first: "05:45", last: "22:30", frequency: 12 },
                fare: 25, avgTime: 40, totalSeats: 55
            },
            {
                route: "AC-8", type: "AC Volvo", vehicleId: "KA01-F-AC08",
                origin: "Shivajinagar", destination: "Manyata Tech Park",
                stops: ["Shivajinagar", "Hebbal Flyover", "Bellary Road", "Nagawara", "Manyata Tech Park"],
                timings: { first: "07:00", last: "21:00", frequency: 25 },
                fare: 55, avgTime: 45, totalSeats: 40
            }
        ],
        metro: [
            {
                line: "Purple Line", color: "#7c3aed", lineId: "PL",
                stations: ["Baiyappanahalli", "Swami Vivekananda Road", "Indiranagar", "Halasuru", "Trinity", "MG Road", "Cubbon Park", "Vidhana Soudha", "Sir M Visvesvaraya Station", "Byapanahalli", "KR Market", "National College", "Lalbagh", "South End Circle", "Jayanagar", "JP Nagar", "Yelachenahalli"],
                interchanges: ["MG Road", "Majestic"],
                timings: { first: "05:00", last: "23:00", frequency: 8 },
                farePerStation: 2, baseFare: 10, totalSeats: 850
            },
            {
                line: "Green Line", color: "#16a34a", lineId: "GL",
                stations: ["Nagasandra", "Dasarahalli", "Jalahalli", "Peenya Industry", "Peenya", "Goraguntepalya", "Yeshwanthpur", "Sandal Soap Factory", "Mahalakshmi", "Rajajinagar", "Kuvempu Road", "Srirampura", "Mantri Square Sampige Road", "Majestic", "Sir M Visvesvaraya Station", "Vidhana Soudha", "Cubbon Park", "MG Road", "Trinity", "Halasuru", "Indiranagar"],
                interchanges: ["Majestic", "MG Road"],
                timings: { first: "05:00", last: "23:00", frequency: 8 },
                farePerStation: 2, baseFare: 10, totalSeats: 850
            }
        ],
        suburban: [
            {
                route: "KSR Bengaluru – Yeshwanthpur", trainId: "KR-S001",
                stations: ["KSR Bengaluru City", "Krishnarajapuram", "Baiyappanahalli", "Lottegollahalli", "Yeshwanthpur"],
                timings: { first: "06:00", last: "22:00", frequency: 30 },
                fare: 15, totalSeats: 500
            },
            {
                route: "Baiyappanahalli – Banaswadi", trainId: "KR-S002",
                stations: ["Baiyappanahalli", "Banaswadi", "Krishnarajapuram", "Whitefield"],
                timings: { first: "06:30", last: "21:00", frequency: 45 },
                fare: 20, totalSeats: 500
            }
        ]
    }
};

/* ============================================================
   METRO ROUTING ENGINE
   ============================================================ */
function calculateMetroJourney(fromStation, toStation, cityMetroData) {
    if (!cityMetroData) return null;
    function findLines(s) { return cityMetroData.filter(l => l.stations.includes(s)); }
    const fromLines = findLines(fromStation);
    const toLines = findLines(toStation);
    if (!fromLines.length || !toLines.length) return null;

    // Direct same-line
    for (const fl of fromLines) {
        for (const tl of toLines) {
            if (fl.line === tl.line) {
                const fi = fl.stations.indexOf(fromStation);
                const ti = fl.stations.indexOf(toStation);
                const sc = Math.abs(ti - fi);
                return {
                    type: "direct", line1: fl,
                    from: fromStation, to: toStation,
                    stopsLine1: fl.stations.slice(Math.min(fi, ti), Math.max(fi, ti) + 1),
                    stationCount: sc,
                    fare: Math.round(fl.baseFare + sc * fl.farePerStation),
                    travelTime: sc * 3,
                    interchange: null
                };
            }
        }
    }

    // Interchange
    const allIc = ["Ameerpet", "MGBS", "JBS Parade Ground", "MG Road", "Majestic", "Sir M Visvesvaraya Station"];
    for (const ic of allIc) {
        const icLines = findLines(ic);
        const fromLine = fromLines.find(fl => icLines.some(il => il.line === fl.line));
        const toLine = toLines.find(tl => icLines.some(il => il.line === tl.line));
        if (fromLine && toLine && fromLine.line !== toLine.line) {
            const fi1 = fromLine.stations.indexOf(fromStation);
            const ic1 = fromLine.stations.indexOf(ic);
            const ic2 = toLine.stations.indexOf(ic);
            const ti2 = toLine.stations.indexOf(toStation);
            if (ic1 === -1 || ic2 === -1 || ti2 === -1) continue;
            const sc1 = Math.abs(ic1 - fi1);
            const sc2 = Math.abs(ti2 - ic2);
            const sc = sc1 + sc2;
            return {
                type: "interchange", line1: fromLine, line2: toLine,
                from: fromStation, to: toStation, interchange: ic,
                stopsLine1: fromLine.stations.slice(Math.min(fi1, ic1), Math.max(fi1, ic1) + 1),
                stopsLine2: toLine.stations.slice(Math.min(ic2, ti2), Math.max(ic2, ti2) + 1),
                stationCount: sc,
                fare: Math.round(fromLine.baseFare + sc * fromLine.farePerStation + 5),
                travelTime: sc * 3 + 5
            };
        }
    }
    return null;
}

/* ============================================================
   SMART ALTERNATIVES ENGINE
   ============================================================ */
function getSmartAlternatives(journeyData) {
    const { origin, destination, transport, crowdPct, city, specificHour } = journeyData;
    const cityData = getCityData(city);
    const alternatives = [];

    (cityData.bus || []).slice(0, 3).forEach(bus => {
        const occ = getOccupancyPercent(-20, specificHour);
        alternatives.push({
            type: "Bus", label: `${bus.route} — ${bus.type}`,
            fare: bus.fare, travelTime: bus.avgTime,
            occupancy: occ, crowd: getCrowdDetails(occ),
            frequency: bus.timings.frequency, tag: null
        });
    });

    const metroOcc = getOccupancyPercent(-35, specificHour);
    alternatives.push({
        type: "Metro", label: `${city} Metro`,
        fare: 35, travelTime: 28,
        occupancy: metroOcc, crowd: getCrowdDetails(metroOcc),
        frequency: 8, tag: "Air Conditioned"
    });

    const thirdMode = cityData.mmts ? cityData.mmts : cityData.suburban;
    if (thirdMode && thirdMode.length) {
        const occ = getOccupancyPercent(-45, specificHour);
        alternatives.push({
            type: city === "Hyderabad" ? "MMTS" : "Suburban",
            label: city === "Hyderabad" ? "MMTS Suburban Rail" : "KSRTC Suburban Rail",
            fare: thirdMode[0].fare, travelTime: 45,
            occupancy: occ, crowd: getCrowdDetails(occ),
            frequency: thirdMode[0].timings.frequency, tag: "Most Affordable"
        });
    }

    alternatives.sort((a, b) => a.occupancy - b.occupancy);
    if (alternatives.length) alternatives[0].isBest = true;
    return alternatives;
}

/* ============================================================
   STATE HELPERS
   ============================================================ */
function getCityData(cityName) {
    const c = cityName || localStorage.getItem('selectedCity') || 'Hyderabad';
    return transportData[c] || transportData['Hyderabad'];
}

function getSelectedCity() {
    return localStorage.getItem('selectedCity') || 'Hyderabad';
}

function setSelectedCity(city) {
    localStorage.setItem('selectedCity', city);
    applyCityTheme(city);
}

function applyCityTheme(city) {
    const data = transportData[city];
    if (data) document.documentElement.style.setProperty('--city-accent', data.theme);
}

/* ============================================================
   QR + TICKET HELPERS
   ============================================================ */
function generateTicketId() {
    return 'SR' + Date.now().toString(36).toUpperCase().slice(-6);
}

function generateComplaintId() {
    return 'CMP-' + Math.floor(Math.random() * 900000 + 100000);
}

function assignSeatNumber(totalSeats, occupiedPct) {
    const occupied = Math.round(totalSeats * occupiedPct / 100);
    const seat = occupied + 1;
    if (seat > totalSeats) return null; // bus full
    const row = Math.ceil(seat / 4);
    const col = ['A', 'B', 'C', 'D'][((seat - 1) % 4)];
    return `${row}${col}`;
}

/* ============================================================
   GLOBAL EXPORT
   ============================================================ */
if (typeof window !== 'undefined') {
    window.transportData = transportData;
    window.getOccupancyPercent = getOccupancyPercent;
    window.getSeatsInfo = getSeatsInfo;
    window.getCrowdDetails = getCrowdDetails;
    window.getNextArrivals = getNextArrivals;
    window.calculateMetroJourney = calculateMetroJourney;
    window.getSmartAlternatives = getSmartAlternatives;
    window.getCityData = getCityData;
    window.getSelectedCity = getSelectedCity;
    window.setSelectedCity = setSelectedCity;
    window.applyCityTheme = applyCityTheme;
    window.generateTicketId = generateTicketId;
    window.generateComplaintId = generateComplaintId;
    window.assignSeatNumber = assignSeatNumber;
}
