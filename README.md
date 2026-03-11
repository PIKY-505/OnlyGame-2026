# 🕹️ Only Game

> A highly immersive, personalized interactive arcade experience simulating a modern operating system and retro minigames within the browser. Built with a focus on high-performance rendering, fluid motion physics, and aesthetic precision.

![React](https://img.shields.io/badge/React-18.2-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-r160-000000?style=for-the-badge&logo=three.js&logoColor=white)
![WebGL](https://img.shields.io/badge/WebGL-990000?style=for-the-badge&logo=webgl&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-11.0-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![Zustand](https://img.shields.io/badge/State-Zustand-orange?style=for-the-badge&logo=react&logoColor=white)
![Sass](https://img.shields.io/badge/Style-Sass-CC6699?style=for-the-badge&logo=sass&logoColor=white)

## 🚀 Engineering Overview

**Only Game** is a sophisticated Single Page Application (SPA) that pushes the boundaries of web interactivity. It leverages a hybrid rendering approach, combining the declarative nature of React for UI state with the imperative performance of WebGL for background visual effects.

The architecture is designed to maintain a consistent **60 FPS** even during complex scene transitions, utilizing off-main-thread logic where possible and optimizing React's reconciliation cycle.

### 🧠 Core Architecture & State Management

The application state is managed via **Zustand**, chosen for its transient update capabilities and minimal boilerplate.

- **Atomic State Model:** The `useGameStore` acts as a single source of truth, handling diverse domains such as:
  - **Session Security:** Lock screen authentication and retro arcade theme.
  - **Inventory System:** Shop transactions, item ownership, and equipment slots (Backgrounds, Cursors, Trails, Coins).
  - **UI State:** Modal visibility (Shop, Settings) and active application focus.
- **Persistence:** State is automatically persisted to `localStorage`, ensuring user customization (equipped assets, money, unlocked items) remains consistent across sessions.

### 🎨 Logic & Aesthetics

The UI mimics an arcade machine infused with a minimal cyberpunk / synthwave touch, employing **CSS animations** and **Framer Motion**.

- **Minigame Engine:**
  - An underlying arcade component dedicated to clicking, speed, and precision.
  - Generates falling/moving items that must be caught before disappearing.
  - Combines combos, streak systems, and varying difficulty.
- **Dynamic Assets:**
  - Full customization with the integrated Shop. Buy and swap backgrounds, cursors, and active coins that respond to your interaction.
  - **Particle System Integration:** Unlocking secret achievements enables golden UI patterns and performance-optimized particle layers.

### ⚡ Advanced Graphics Pipeline (WebGL)

The visual core relies on **Three.js** and **@react-three/fiber** (R3F).

#### 1. Shader & Physics Implementations

- **Light Pillars (Volumetric Shader):** Custom fragment shader using ray-marching techniques.
- **Floating Lines (Sine-Wave Synthesis):** Overlapping sine waves with real-time interactivity mimicking energy bending.
- **Silk (Procedural Fluidity):** Vertex displacement shader with domain-warping noise.
- **Ballpit (Instanced Physics):** InstanceMesh rendering hundreds of physical spheres colliding at 60 FPS using an integrated JS constraint solver.
- **Galaxy (Particle System):** Gravity and mouse-repulsion behaviors on points primitives.

## 📂 Project Structure

```bash
src/
├── assets/             # Static binary assets (Textures, Audio, Icons)
├── components/
│   ├── Backgrounds/    # WebGL/Three.js implementations (Shaders, Scenes)
│   ├── Shop/           # Inventory logic, Item Grids, Tab Systems
│   ├── Game/           # Minigame engine components
│   ├── UI/             # Core UI (Dock, LockScreen, Menus)
│   └── ...
├── store/              # Zustand stores (Business Logic & State)
├── styles/             # SCSS Modules (Variables, Mixins, Global Styles)
└── App.jsx             # Root Orchestrator
```
