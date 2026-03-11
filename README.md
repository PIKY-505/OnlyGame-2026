# 🕹️ Only Game

> Una experiencia arcade interactiva e inmersiva que simula un sistema operativo web y diversos minijuegos mediante renderizado de alto rendimiento, físicas de movimiento fluidas y estética cyberpunk-retro.

![React](https://img.shields.io/badge/React-18.2-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-r160-000000?style=for-the-badge&logo=three.js&logoColor=white)
![WebGL](https://img.shields.io/badge/WebGL-990000?style=for-the-badge&logo=webgl&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-11.0-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![Zustand](https://img.shields.io/badge/State-Zustand-orange?style=for-the-badge&logo=react&logoColor=white)
![Sass](https://img.shields.io/badge/Style-Sass-CC6699?style=for-the-badge&logo=sass&logoColor=white)

## 🚀 Perspectiva Técnica

**Only Game** es una Single Page Application (SPA) sofisticada que persigue difuminar los límites del diseño y el rendimiento en navegadores modernos. Aprovecha un renderizado híbrido: combina la reactividad y el estado declarativo de **React** para la interfaz de usuario, y subdelega la computación gráfica pesada sobre el GPU mediante **WebGL** y **Three.js**.

La arquitectura técnica se orienta a mantener picos consistentes de **60 FPS** incluso durante transiciones de escena y cargas masivas de partículas, separando responsabilidades lógicas nativas del hilo principal (off-main-thread).

---

## 🧠 Arquitectura Core y Gestión de Estado

Todo el sistema de memorias e inventario se gestiona íntegramente de la mano de **Zustand** (a través de `useStore.js`). Su adopción reduce considerablemente el boilerplate de alternativas como Redux, permitiendo actualizaciones transitorias de rendimiento sin generar renders masivos en el DOM principal.

- **Modelo de Estado Atómico:** Un proveedor único actúa como verdad inmutable que ramifica diferentes estados vitales:
  - **Identidad de Sesión:** Controla el acceso directo bajo la pantalla "LockScreen" mediante animaciones iniciales sincronizadas.
  - **Sistema de Economía / Tienda:** Balance de monedas dinámico, compras de la tienda, auditorías de los ítems cosméticos adquiridos (Fondos, Mascotas, Cursores y Skins).
  - **Gestor de Interfaz:** Controla qué menús y modales rigen la pantalla activa (el Dock de navegación, Reproductor Musical, Tienda principal) interrumpiendo fluidamente unos a otros.
- **Persistencia Transparente:** Mediante selectores nativos, el estado del usuario (incluyendo saldo y equipo visual) se almacena y serializa en el `localStorage` del navegador y reactiva su última sesión de manera determinista al reiniciar.

---

## 🕹️ Mecánicas Recreativas Lúdicas

Con un claro ADN retrowave/arcade, la lógica simuladora se construye mediante el ecosistema y motor de minijuegos implementado en los propios componentes visuales.

### Motor del Juego Central (Clicker/Reflejos)
- Consta de una bóveda temporal donde caen de forma procedural monedas en la pantalla (basado en ecuaciones polinómicas de CSS).
- El jugador debe interceptarlas (clicar o tocar) antes de que crucen el borde inferior de la aplicación.
- **Factores Multiplicadores Temporales:** Se instaura un medidor de *combos*. Cadena los *hits* incrementa de forma progresiva tanto la puntuación base sumada directamente al registro de fondos del jugador como el nivel de dificultad.

### Personalización Infinita 🛒
El componente Shop está desacoplado del main loop para evitar bajones de cuadros del juego y ostenta un catálogo robusto de customización:
- **Catálogo de Visuales Dinámicas:** Reacciona globalmente. Por ejemplo, al comprar la "Piscina de Bolas", la escena de React inyecta *instantly* el canvas 3D sobre la capa raíz.
- **Logros y Secreciones:** Incluye un motor pasivo rastreador (`AchievementToast`). El cumplimiento de iteraciones (recoger 10.000 monedas) o comprar todo (Coleccionista) destapa cosméticos Ocultos.

---

## ⚡ Tubería Avanzada de Gráficos (WebGL)

El pilar visual detrás de "*Only Game*" destina su corazón gráfico gracias a constructos puros imperativos dentro de **Three.js** y representaciones basadas en árbol con **@react-three/fiber** (R3F).

#### Sistema Híbrido de Renderizado `BackgroundController`
El sistema abstrae las fugas de memoria típicas de navegadores aislando instancias (Geometrías, Shaders y buffers) mediante auto-destrucción controlada si no se portan al inventario en uso. 

#### Shaders Integrados y Física Visual:
1. **Light Pillars (Geometría Volumétrica):** Fragment Shader personalizado sobre técnicas de Ray Marching. Simula cilindros de luz volumétrica y niebla usando Ruido FBM con fluctuaciones matemáticas armónicas.
2. **Floating Lines / Seda (Proyección Vectorial):** Shader de dislocación de vértices combinado con ruidos de patrón cruzado ('Domain Warping') simulando físicas de telas bajo factores gravitacionales de aire.
3. **Ballpit (Física Optimizada de Instanciación):** Utiliza un motor ligero determinista implementado íntegramente en JavaScript puro (Sin librerias como Oimo.js) integrando detección de colisión esférica por medio de *Verlet Velocity*. Permite que cientos de esferas reactivas a la colisión interactúen utilizando la infraestructura de un `InstancedMesh`.
4. **Snow / Galaxy (GPU Compute Particles):** Puntos primitivos donde las actualizaciones se miden en buffers GL, actualizando billones de posiciones estelares basándose puramente en atracciones polares causadas temporalmente por las coordenadas `(X,Y)` del cursor global.

---

## 🖱️ Sistemas de Interacción Menores

- **Cursores Fluidos (`CursorController.jsx`):** Empleo de Spring Hooks de Framer Motion integrados directamente al motor JS (No CSS standard), creando amortiguación física (Inertia Damping) que reempleza el puntero de Windows/Mac.
- **Rastros (Trails / Mascotas):** Subsistema `TrailSystem` rige una historia interpolada de ubicaciones generada bajo matrices array que se desvanecen independientemente. 
- **Sistema Integrado de Sonido Acoplado:** Menú despegable persistente de audio, implementando hooks `isPlaying` de HTML5 `<audio/>` API para manejar ecualizadores reactivos falsos pero de diseño de alta gama.

---

## 📂 Visión de Archivos y Carpetas

El esquema prioriza la segmentación por funcionalidad en lugar de tipo:

```bash
src/
├── assets/             # Arte Binario (Música, Efectos WAV, Sprites GIF y Cursores PNG)
├── components/
│   ├── Backgrounds/    # Topología WebGL (Shaders GLSL, Hooks de R3F)
│   ├── Shop/           # Lógica y Presentación Inversa de Pagos
│   ├── UI/             # Overlay (Dock, Configuración, Overlay de Juego y LockScreen)
│   ├── Layout/         # Elementos persistentes de Ratón y Control Interno
│   └── Effects/        # Motores visuales de baja influencia (Trails)
├── store/              # Modelos Zustand para Inyecciones (App Store Singleton)
├── styles/             # Modular SCSS / Mixins Centralizados.
├── data/               # Diccionarios Inmutables (Base de datos de Logros)
└── App.jsx             # Contenedor Primario y Bucle Maestro
```

---

*Compilado y mantenido con ❤ a base de código, café, y matemáticas vectoriales.*
