<div align="center">

# 🌐 NetsimX

### An Interactive Network Protocol Simulator & Educational Platform

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

> **NetsimX** is a full-stack, browser-based network simulator built for computer networks education. It lets students visually build network topologies, simulate packet transmission, explore routing algorithms, and run interactive protocol labs — all in one platform.

</div>

---

## ✨ Features

### 🖥️ Visual Topology Builder
- Drag-and-drop canvas powered by **React Flow (@xyflow/react)**
- Device palette: **PC, Laptop, Server, Router, Switch, Hub, Cloud**
- Click-to-place or drag-to-position devices on the canvas
- Connect devices by dragging from node handle to node handle
- Toggle link **UP / DOWN** state and set custom link **cost/metric**

### 📦 Packet Simulation Engine
- Send packets between any two devices with animated hop-by-hop traversal
- **TTL (Time To Live)** decrements at each hop — dropped on expiry
- **Dynamic rerouting** — if a link goes down mid-flight, Dijkstra recalculates an alternate path in real time
- **CRC verification** at destination — detects corrupted frames
- Packet states: `IN_FLIGHT` → `DELIVERED` / `DROPPED` / `CORRUPTED`

### 🔀 Routing Algorithms
| Algorithm | Description |
|---|---|
| **Dijkstra's** | Greedy shortest path, O((V+E) log V), non-negative weights |
| **Bellman-Ford** | Dynamic edge relaxation, O(V×E), supports negative weight detection |
| **Side-by-Side Compare** | Compare both algorithms' distance tables on the same topology |

- Full **step-by-step iteration table** for both algorithms
- Live **routing table** per router (Connected, Static, Dynamic routes)

### 🧪 Protocol Laboratories

#### 🔴 CRC Laboratory (Data Link Layer)
- Supports **CRC-12, CRC-16, CRC-CCITT**, and custom polynomials
- Step-by-step **modulo-2 binary division** visualization
- **Bit error injection** — flip any bit in the transmitted frame and watch CRC fail
- Binary / Text input modes

#### 🟦 Data Link Framing Laboratory
- **Bit Stuffing** (5-consecutive-ones rule) with inserted bit highlights
- **Character Stuffing** (FLAG/ESC byte substitution)
- **Character Count Framing** with configurable frame size
- Sender stuffing + receiver de-stuffing shown end-to-end

#### 🟢 Subnet Calculator (Network Layer)
- Input: IPv4 address + CIDR prefix (`/0` to `/32`)
- Computes: Network, Broadcast, First/Last Host, Mask, Wildcard
- **Binary visualizer** — all 32 bits color-coded (network vs host portion)
- IP class detection (A/B/C/D/E) and private range identification

### 💻 Virtual CLI Terminal
Simulate real OS networking commands on any device:

```
ping <target_ip | hostname>       — ICMP echo with RTT output
traceroute <target_ip | hostname> — Hop-by-hop path trace
ipconfig / ifconfig               — Display device IP configuration
arp -a                            — Show ARP cache table
route print                       — Display router's routing table
clear                             — Clear terminal buffer
```

### 📁 FTP Protocol Simulator
- Educational FTP client/server simulation (Port 21)
- Connect with credentials, browse remote file directory
- Upload files with animated transfer progress bar
- Logs all FTP events to the simulation console

### 💾 Project Save & Load
- Save topology projects via the **Express backend**
- Load previously saved projects from the Projects modal
- Pre-built **network templates** to get started quickly

### 📖 Learning Mode
- Integrated **Learning Drawer** with contextual explanations
- Covers OSI layers, protocols, and algorithm theory

---

## 🗂️ OSI Layer Coverage

| OSI Layer | Features Covered |
|---|---|
| **Layer 1 — Physical** | Link UP/DOWN status, Bandwidth field |
| **Layer 2 — Data Link** | MAC addresses, ARP, Framing Lab (Bit/Char stuffing), CRC Lab |
| **Layer 3 — Network** | IP addressing, Subnet Calculator, Dijkstra & Bellman-Ford routing, TTL, Packet forwarding |
| **Layer 4 — Transport** | Port simulation (FTP port 21) |
| **Layer 7 — Application** | FTP Simulator, CLI Terminal |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- npm v9 or higher

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/hansikhagarine31/NetsimX.git
cd NetsimX

# 2. Install dependencies
npm install

# 3. Start both frontend (Vite) and backend (Express) concurrently
npm start
```

The app will be available at **http://localhost:3000**
The backend API runs at **http://localhost:5000**

### Other Scripts

```bash
npm run dev      # Start frontend only (Vite dev server)
npm run server   # Start backend only (Express)
npm run build    # Build production bundle
npm run test     # Run unit tests (Vitest)
```

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 18 + Vite 6 |
| **Topology Canvas** | @xyflow/react (React Flow) |
| **Styling** | Tailwind CSS v3 |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Backend** | Express.js |
| **Testing** | Vitest |
| **State Management** | Custom reactive store (pub/sub pattern) |

---

## 📁 Project Structure

```
NetsimX/
├── server/
│   └── index.js                  # Express backend (save/load projects)
└── src/
    ├── algorithms/
    │   ├── dijkstra.js            # Dijkstra's shortest path
    │   ├── bellmanFord.js         # Bellman-Ford algorithm
    │   ├── crc.js                 # CRC calculation & verification
    │   ├── framing.js             # Bit/Character stuffing
    │   ├── routing.js             # Router table builder
    │   └── ipValidator.js         # IP/subnet validation
    ├── components/
    │   ├── layout/                # Navbar, SidebarLeft, SidebarRight
    │   ├── canvas/                # NetworkCanvas, DeviceNode, LinkEdge
    │   ├── bottompanel/           # Console, CRC Lab, Framing Lab,
    │   │                          # Routing Tab, Subnet Calculator, Packet Inspector
    │   ├── modals/                # FTP, Project, Templates modals
    │   └── common/                # LearningDrawer
    ├── simulation/
    │   ├── simulationEngine.js    # Packet state machine
    │   ├── packetFactory.js       # Packet creation
    │   └── terminalCommands.js    # CLI command parser
    ├── store/
    │   └── networkStore.js        # Global reactive state store
    ├── data/
    │   └── networkTemplates.js    # Pre-built topologies
    └── tests/                     # Vitest unit tests
```

---

## 🧪 Running Tests

```bash
npm run test
```

Test coverage includes:
- `dijkstra.test.js` — shortest path correctness, unreachable nodes
- `crc.test.js` — CRC calculation and error detection
- `framing.test.js` — bit stuffing and destuffing
- `ipValidator.test.js` — IP and subnet validation

---

## 🎓 Academic Context

NetsimX was developed as a **Computer Networks course project** covering:
- Data Link Layer: Framing, Error Detection (CRC)
- Network Layer: IP Addressing, Subnetting, Routing Algorithms
- Transport/Application Layer: Protocol simulation (FTP, ICMP)

---

## 👤 Author

**Hansi Khagarine**  
GitHub: [@hansikhagarine31](https://github.com/hansikhagarine31)

---

<div align="center">

⭐ If you found this project helpful, please consider giving it a star!

</div>
