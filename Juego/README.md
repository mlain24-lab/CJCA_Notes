# El Códice de las Estrellas ❤️

> **An interactive roguelite experience merging procedural maze dungeon crawling, narrative progression, and classical literary art.**

---

## 📜 Project Overview

**El Códice de las Estrellas** is a feature-rich web application built natively in Vanilla JavaScript, HTML5, and CSS3. Designed specifically with performance and cross-platform compatibility in mind (fully optimized for deployment in local testing environments like Apache/Kali Linux and portable devices like the ROG Ally), it blends fast-paced tile-based grid dungeon exploration with deep literary storytelling, user profile management, audio synthesis, and an extensive achievement system.

---

## ✨ Key Technical Features

1. **Integrated Database Architecture (`GAME_DATABASE`)**:
   - Contains a robust repository of classical literary masterpieces, contextual acts, lateral verses, defeat reflections, and tiered items.
   - Built-in dynamic page generator that scales text interpolation across 500 unique chapters/stages.

2. **Procedural Dungeon Generation & Global Room State**:
   - Generates randomized 3x3 interconnected dungeon maps per chapter using recursive backtracking algorithms.
   - Features dynamic room types: Normal rooms, Treasure vaults, Secret chambers, and Boss/Exit gateways.

3. **Strict Dungeon-Wide Progression Logic**:
   - The final boss/exit gateway is locked behind a global item check (`🔒`). Players must collect all scattered resource fruits (`🍈`) across *all* connected rooms in the current dungeon before the lock clears, transforming into an open gate/rose (`🌹`) to advance.

4. **Multi-User LocalStorage Authentication**:
   - Supports local user registration, password verification, and 3 independent save slots (`slots`) per user account tracking score, best records, unlocked pages, deaths, items, and active settings.

5. **Procedural Web Audio Synthesizer**:
   - Built entirely using the native browser `AudioContext` API to generate polyphonic chiptune background music tracks (*Armonía Estelar*, *Ecos del Alba*, *Sinfonía del Cosmos*) and sound effects without loading external audio files.

6. **Progressive Achievement System**:
   - Features 100 categorized achievements (`🗺️ Exploración`, `⚔️ Combate`, `👑 Jefes`, etc.) that evaluate progressive metrics (chapter milestones, score thresholds, page progression) ensuring players start with a clean slate (`🔒`) upon creating a new profile.

---

## 🛠️ Tech Stack

* **Frontend**: HTML5 (Semantic Structure, Embedded Single-Page Architecture), CSS3 (Modern Flexbox/Grid Layouts, Dynamic Variables, Custom Animations, Glassmorphism UI).
* **Scripting**: Vanilla JavaScript (ES6+, DOM Manipulation, LocalStorage API, Web Audio API, Algorithmic Matrix Mapping).
* **Server Deployment**: Apache HTTP Server (`/var/www/html/`).

---

## 🚀 Installation & Deployment

### Local Setup (Kali Linux / Apache)

1. Clone or copy the project files directly into your web server's root directory:
   `cd /var/www/html`
2. Ensure you have the complete single-file bundle saved as `index.html`.
3. Set appropriate permissions for the Apache web server:
   `sudo chmod 644 index.html`
   `sudo chown -R www-data:www-data /var/www/html`
4. Access the application locally via your web browser:
   `http://localhost/index.html`

---

## 🎮 Controls & Gameplay Mechanics

* **Movement**: Use `WASD` keys, on-screen touch control buttons, or arrow keys (`ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`).
* **Objective**: Navigate the dungeon grid, avoid enemies, collect all silver fruits (`🍈`), unlock the central boss gate, and progress through 8 acts to restore all 500 pages of the Cosmic Codex.