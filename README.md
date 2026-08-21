# SafeRide-India
# 🛡️ SafeRide India — Multi-City Smart Transit Platform

A real-time public transport web app for **Hyderabad** and **Bengaluru** with live crowd intelligence, QR ticket booking, route planning, and smart alternatives.

---

## 🚀 Features

- 🗺️ **Multi-City Support** — Hyderabad (TSRTC, Metro, MMTS) & Bengaluru (BMTC, Namma Metro, Suburban Rail)
- 📊 **Live Crowd Intelligence** — Real-time occupancy % with color-coded crowd bars
- 🎟️ **QR Ticket Booking** — Book instantly and get a scannable QR code ticket
- 📍 **Live Bus Tracking** — Animated stop-by-stop bus tracker
- 🚇 **Metro Route Planner** — Interchange detection, fare calculation, station timeline
- 🔀 **Smart Alternatives** — AI-ranked alternatives when your bus/train is full or crowded
- 📢 **Complaint System** — Report overcrowding, delays, or misconduct — no login needed
- 📅 **Schedule Later** — Plan future trips with date/time selection
- 💺 **Seat Availability** — Know available seats before boarding
- ⚠️ **Safety Alerts** — Live risk zones and crowd warnings across both networks

---

## 📁 Project Structure

```
saferide/
├── index.html              # Landing page
├── login.html              # Login / auth
├── city-selection.html     # Step 1: Choose city & transport mode
├── journey.html            # Step 2: Plan journey (origin → destination)
├── livecrowd-1.html        # Step 3: Live bus list with crowd data
├── live-status.html        # Live bus tracker (stop-by-stop)
├── metro.html              # Metro route planner
├── metro-live.html         # Metro live status
├── mmts-live.html          # MMTS / Suburban rail live
├── booking.html            # Ticket booking & payment summary
├── mytrips.html            # My booked trips with QR codes
├── smart-alternatives.html # Smart route alternatives
├── safety-alerts.html      # Live safety alerts
├── crowd-alert.html        # Predictive crowd alert
├── report.html             # Report an issue / complaint
├── css/
│   └── style.css           # Main stylesheet
└── js/
    ├── data.js             # All city data + crowd/seat engine
    ├── appState.js         # Centralized state management (localStorage)
    ├── script.js           # Page routing + all page logic
    ├── qr.js               # QR code generator + ticket builder
    └── tracking.js         # Live bus tracking simulator
```

---

## 🛠️ Setup & Running Locally

### Option 1 — Node.js Server (Recommended)

```bash
# Clone the repo
git clone https://github.com/your-username/saferide-india.git
cd saferide-india

# Start the server
node server.js
```

Then open [http://localhost:5500](http://localhost:5500) in your browser.

### Option 2 — VS Code Live Server

Install the **Live Server** extension in VS Code, right-click `index.html`, and select **Open with Live Server**.

### Option 3 — Direct Browser

Open `index.html` directly in Chrome or Firefox. Note: some features may behave differently without a local server.

---

## 🗺️ User Flow

```
Login → City Selection → Transport Mode
                              ↓
                    Bus → Journey → Live Buses → Track / Book
                    Metro → Metro Planner → Book
                    MMTS → Live Trains → Book
                              ↓
                         Booking → QR Ticket → My Trips
```

---

## 🏙️ Supported Cities & Transport

| City | Bus | Metro | Rail |
|------|-----|-------|------|
| Hyderabad | TSRTC (Express, AC, Ordinary) | Red, Blue, Green Lines | MMTS Suburban Rail |
| Bengaluru | BMTC (AC & Ordinary) | Purple & Green Lines (Namma Metro) | KSRTC Suburban Rail |

---

## 💻 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Styling | Custom CSS with CSS Variables (no framework) |
| State | localStorage + centralized `appState.js` |
| QR Codes | [qrcode.js](https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js) via CDN |
| Server | Node.js (built-in `http` module) |
| Fonts | Google Fonts — Inter |

---

## ⚙️ How It Works

- **`data.js`** — Single source of truth for all city/transport data. Contains the crowd engine (`getOccupancyPercent`, `getCrowdDetails`, `getSeatsInfo`) and route/schedule data for all transport modes.
- **`appState.js`** — Persists journey state (selected city, transport, origin, destination, vehicle) across pages using `localStorage`.
- **`script.js`** — Routes to the correct `init*Page()` function based on the current URL, then handles all page-specific logic.
- **`qr.js`** — Generates QR code tickets using the qrcode.js library and builds the ticket card HTML.
- **`tracking.js`** — Simulates live bus movement by animating through stop arrays at intervals.

---

## 🐛 Known Issues

- `crowd-alert.html` — `viewAlternatives()` function is not yet defined; link it to `smart-alternatives.html`
- `metro-live.html` — Missing `data.js` script tag; add it before `script.js`
- Live tracking is simulated (no real GPS API connected)
- QR codes are locally generated and not verified server-side

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👤 Author

**SafeRide India Team**  
Built for Smart City Transit — Hyderabad & Bengaluru 🇮🇳
