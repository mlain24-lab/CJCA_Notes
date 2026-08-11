# Arquitectura y Presentación Técnica: El Códice de las Estrellas (Roguelite Edition)

## 1. Descripción General del Proyecto
**El Códice de las Estrellas** es un videojuego web de tipo *roguelite dungeon crawler* con un fuerte componente narrativo y literario. Está diseñado bajo una arquitectura modular y desacoplada, optimizada tanto para entornos de escritorio como para dispositivos portátiles (*handhelds* tipo ROG Ally) mediante el uso de diseño responsivo, controles táctiles y compatibilidad con la API de pantalla completa.

---

## 2. Stack Tecnológico y Estructura de Archivos
El proyecto se divide en dos componentes principales para garantizar un mantenimiento limpio (*clean code*) y una fácil integración de contenidos:

* **`index.html` (Core Application & UI Layer):** Contiene la lógica de renderizado del DOM, la máquina de estados del juego, el motor gráfico de mazmorras basado en CSS Grid, los controladores de entrada (*event listeners* de teclado y táctiles) y el sistema de interfaz de usuario (pantallas de autenticación, selección de slots, HUD de juego y menús de logros).
* **`database.js` (External Data Repository):** Capa de datos desacoplada que almacena la base de literatura universal (citas de obras maestras), frases atmosféricas laterales, textos de derrota y metadatos de objetos por niveles de dificultad (*tiers*).

---

## 3. Módulos Funcionales y Core Mechanics

### A. Sistema de Autenticación y Multi-Slot Persistence (`localStorage`)
* **Gestión de Usuarios:** Base de datos simulada en el almacenamiento local del navegador (`localStorage`) con validación estricta de credenciales (mínimo de caracteres para usuario y contraseña).
* **Ranuras de Guardado (Slots):** Cada cuenta soporta tres ranuras de partida independientes (`slots`). Almacena de forma persistente el capítulo actual, la puntuación acumulada, el progreso del Códice (páginas desbloqueadas hasta 500), los ajustes de dificultad y los logros obtenidos.

### B. Motor de Generación Procedural de Mazmorras (*Procedural Generation*)
* **Estructura de Salas:** Un mapa global de $3 \times 3$ nodos donde cada celda representa una sala con tipología variable (normal, tesoro, secreto o sala del jefe final en la coordenada $[2,2]$).
* **Algoritmo de Tallado (*Carving*):** Las cuadrículas internas de las salas se generan mediante un algoritmo de búsqueda en profundidad modificado (DFS) combinado con la apertura automática de portales en los bordes para permitir la navegación fluida entre pantallas (*screen-wrapping* perimetral).
* **Inteligencia Artificial de Enemigos (AI Chasing Logic):** Los enemigos evalúan dinámicamente la distancia euclidiana respecto a la posición del jugador, ejecutando patrones de persecución o movimiento estocástico dentro de los límites de la sala.

### C. Motor de Síntesis de Audio (Web Audio API)
* **Audio Ambiental Procedural:** Implementación nativa mediante la interfaz `AudioContext`, utilizando osciladores y envolventes de ganancia (*gain nodes*) para generar melodías armónicas en tiempo real sin necesidad de archivos de audio externos pesados.
* **Gestión de Contexto:** Control robusto de estados de audio (`suspended / resume`) condicionado a la interacción previa del usuario para evitar bloqueos por políticas de autoplay de los navegadores modernos.

### D. Motor Literario y Progresión del Códice (500 Páginas)
* **Inyección Dinámica de Contenido:** Al superar un capítulo, el sistema invoca la función modular `getPage(n)` desde la base de datos externa, combinando metadatos de autores clásicos y contemporáneos con reflexiones narrativas expandidas.
* **Sistema de Logros (Milestones):** Un registro de 100 logros clasificados por categorías (*Exploración, Combate, Jefes, Secretos, Historia y Desafíos*) que premia la progresión acumulativa del usuario.

---

## 4. Hoja de Ruta Técnica para Futuras Iteraciones (*Roadmap*)
1. **Refactorización y Modularización ES6:** Migrar la lógica monolítica de `index.html` hacia módulos independientes de JavaScript importados mediante directivas `type="module"`.
2. **Optimización de Rendimiento (Rendering Performance):** Evaluar la transición del DOM Grid actual a un canvas HTML5 2D o WebGL en caso de escalar la densidad de partículas estelares y animaciones de combate.
3. **Expansión del Árbol de Objetos (Inventory System):** Consolidar un inventario persistente en el estado de los slots que permita equipar reliquias activas y pasivas con efectos modificadores sobre las estadísticas de vida, escudo y velocidad de movimiento.
4. **Control de Versiones (CI/CD):** Estructurar el repositorio local para sincronización limpia con GitHub Pages o despliegues directos en entornos de prueba locales sobre dispositivos portátiles.