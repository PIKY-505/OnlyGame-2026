import React, { useState, useEffect, useRef } from "react";
import { useGameStore } from "./store/useStore";
import BackgroundController from "./components/Backgrounds/BackgroundController";
import StaggeredMenu from "./components/UI/StaggeredMenu";
import LockScreen from "./components/Layout/LockScreen";
import GameOverlay from "./components/Layout/GameOverlay";
import { AnimatePresence, motion } from "framer-motion";
import "./styles/main.scss";
import BackgroundCustomizer from "./components/UI/BackgroundCustomizer";
import Dock from "./components/UI/Dock";
import {
  FiStar,
  FiMusic,
  FiEdit,
  FiLock,
  FiShoppingCart,
} from "react-icons/fi";
import { FaGamepad } from "react-icons/fa";
import ShopContainer from "./components/Shop/ShopContainer";
import TrailSystem from "./components/Effects/TrailSystem";
import LoadingScreen from "./components/UI/LoadingScreen";
import MusicPlayer from "./components/UI/MusicPlayer";
import SettingsMenu from "./components/UI/SettingsMenu";
import AchievementToast from "./components/UI/AchievementToast";
import { ACHIEVEMENTS_DATA } from "./data/achievements";
import CursorController from "./components/Layout/CursorController";

const shopItems = [
  { id: "backgrounds", label: "Fondos", ariaLabel: "Galería de Fondos" },
  { id: "cursors", label: "Cursores", ariaLabel: "Personalizar Cursor" },
  { id: "trails", label: "Mascotas", ariaLabel: "Personalizar Mascota" },
  { id: "skins", label: "Monedas", ariaLabel: "Personalizar Monedas" },
];

function App() {
  // --- STORE & STATE ---
  const {
    isUnlocked,
    openShop,
    closeShop,
    lockGame,
    activeBackground,
    toggleGame,
    isGameActive,
    activeShop,
    addCoins,
    unlockAchievement,
    achievements,
    setCursor,
    activeCursor,
  } = useGameStore();
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);
  const [showBackgroundSettings, setShowBackgroundSettings] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSecretContainer, setShowSecretContainer] = useState(false);

  const [floatingLinesConfig, setFloatingLinesConfig] = useState(null);
  const [lightPillarsConfig, setLightPillarsConfig] = useState(null);
  const [ballpitConfig, setBallpitConfig] = useState(null);
  const [silkConfig, setSilkConfig] = useState(null);
  const [galaxyConfig, setGalaxyConfig] = useState(null);
  const [gradientConfig, setGradientConfig] = useState(null);
  const [pixelSnowConfig, setPixelSnowConfig] = useState(null);
  const [hyperspeedConfig, setHyperspeedConfig] = useState(null);

  // --- IOS & MOBILE VIEWPORT FIX ---
  useEffect(() => {
    const setMetaTag = (name, content) => {
      let element = document.querySelector(`meta[name="${name}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.name = name;
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // 1. viewport-fit=cover: Permite dibujar bajo el notch y la barra de inicio
    setMetaTag("viewport", "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover");
    // 2. apple-mobile-web-app-capable: Habilita modo pantalla completa si se añade a inicio
    setMetaTag("apple-mobile-web-app-capable", "yes");
    // Nueva etiqueta estándar para evitar advertencias y soportar Android/Chrome
    setMetaTag("mobile-web-app-capable", "yes");
    // 3. Status bar transparente: El contenido se ve bajo la barra de estado (hora/batería)
    setMetaTag("apple-mobile-web-app-status-bar-style", "black-translucent");
  }, []);

  // --- SETTINGS STATE ---
  const [goldShopEnabled, setGoldShopEnabled] = useState(true);
  const [previousCursor, setPreviousCursor] = useState("default");

  const togglePrestigeCursor = (enable) => {
    if (enable) {
      // Guardamos el cursor actual si no es el de prestigio
      if (activeCursor !== "cursor_prestige") {
        setPreviousCursor(activeCursor);
      }
      setCursor("cursor_prestige");
    } else {
      // Restauramos el anterior
      setCursor(previousCursor || "default");
    }
  };

  // --- GLOBAL PRESTIGE CHECK ---
  // Comprueba automáticamente si tienes todos los logros para darte el de Prestigio
  useEffect(() => {
    if (isUnlocked && achievements && !achievements.includes("prestige")) {
      const allKeys = Object.keys(ACHIEVEMENTS_DATA);
      const required = allKeys.filter((k) => k !== "prestige");
      const hasAll = required.every((k) => achievements.includes(k));

      if (hasAll) {
        unlockAchievement("prestige");
        // Auto-equipar el cursor secreto de prestigio (collar de diamantes)
        if (setCursor) setCursor("cursor_prestige");
      }
    }
  }, [achievements, isUnlocked, unlockAchievement, setCursor]);

  // --- GLOBAL CHEAT: Konami Code (↑ ↑ ↓ ↓ ← → ← → B A) ---
  const konamiIndex = useRef(0);

  useEffect(() => {
    if (!isUnlocked) return; // Solo funciona si la app está desbloqueada

    const KONAMI_CODE = [
      "ArrowUp",
      "ArrowUp",
      "ArrowDown",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "ArrowLeft",
      "ArrowRight",
      "b",
      "a",
    ];

    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      const target = KONAMI_CODE[konamiIndex.current].toLowerCase();

      if (key === target) {
        konamiIndex.current++;
        if (konamiIndex.current === KONAMI_CODE.length) {
          addCoins(1000000);
          unlockAchievement("matrix_master");
          console.log("CHEAT ACTIVATED: KONAMI CODE!");
          konamiIndex.current = 0;
        }
      } else {
        konamiIndex.current = 0;
        if (key === KONAMI_CODE[0].toLowerCase()) {
          konamiIndex.current = 1;
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isUnlocked, addCoins, unlockAchievement]);

  // --- SECRET CODE: toadsiempreseraelfavorito ---
  useEffect(() => {
    const SECRET_PHRASE = "toadsiempreseraelfavorito";
    let buffer = "";

    const handleSecretKey = (e) => {
      // Solo capturamos caracteres imprimibles de longitud 1
      if (e.key.length === 1) {
        buffer += e.key.toLowerCase();
        if (buffer.length > SECRET_PHRASE.length) {
          buffer = buffer.slice(-SECRET_PHRASE.length);
        }
        if (buffer === SECRET_PHRASE) {
          setShowSecretContainer(true);
          buffer = ""; // Reset
        }
      }
    };
    window.addEventListener("keydown", handleSecretKey);
    return () => window.removeEventListener("keydown", handleSecretKey);
  }, []);

  // --- HANDLERS ---
  const handleMenuClick = (itemId) => {
    if (itemId) {
      openShop(itemId);
    }
  };

  const toggleBackgroundSettings = () => {
    if (!showBackgroundSettings) {
      setIsMenuOpen(false);
      closeShop();
      setShowBackgroundSettings(true);
    } else {
      setShowBackgroundSettings(false);
    }
  };

  const dockItems = [
    {
      icon: <FiMusic size={22} />,
      label: "Música",
      onClick: () => {
        closeShop();
        setShowMusicPlayer(!showMusicPlayer);
      },
    },
    {
      icon: <FiShoppingCart size={22} />,
      label: "Tienda",
      onClick: () => {
        if (activeShop) closeShop();
        setIsMenuOpen(!isMenuOpen);
      },
    },
    {
      icon: (
        <FaGamepad
          size={22}
          color={isGameActive ? "#f700ff" : "currentColor"}
        />
      ),
      label: "Juego",
      onClick: () => {
        closeShop();
        toggleGame();
      },
    },
    {
      icon: <FiEdit size={22} />,
      label: "Fondo",
      onClick: toggleBackgroundSettings,
    },
    {
      icon: <FiLock size={22} />,
      label: "Bloquear",
      onClick: () => {
        if (lockGame) {
          closeShop();
          setShowMusicPlayer(false);
          setFloatingLinesConfig(null);
          setLightPillarsConfig(null);
          setBallpitConfig(null);
          setSilkConfig(null);
          setGalaxyConfig(null);
          setGradientConfig(null);
          setPixelSnowConfig(null);
          setHyperspeedConfig(null);
          lockGame();
        }
      },
    },
  ];

  // --- LOADING LOGIC ---
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  // Asegurar que el estado inicial siempre empiece bloqueado (incluso en hot-reloads prolongados)
  useEffect(() => {
    lockGame();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.floor(Math.random() * 15) + 5;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => setIsLoading(false), 200);
          return 100;
        }
        return next;
      });
    }, 200);
    return () => clearInterval(timer);
  }, []);

  return (
    <main
      style={{
        position: "fixed", // CAMBIO: Fixed + inset 0 evita rebotes y huecos en iOS
        inset: 0,
        width: "100%",
        height: "100dvh",
        overflow: "hidden",
      }}>
      {/* --- LOADING SCREEN --- */}
      <AnimatePresence mode="wait">
        {isLoading && <LoadingScreen key="loader" progress={progress} />}
      </AnimatePresence>

      {/* --- LOCK SCREEN --- */}
      <AnimatePresence>
        {!isLoading && !isUnlocked && (
          <motion.div
            key="lock-screen"
            initial={{ opacity: 0, filter: "blur(20px)", scale: 1.1 }}
            animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
            exit={{
              opacity: 0,
              filter: "blur(20px)",
              scale: 1.1,
              transition: { duration: 2 },
            }}
            transition={{ duration: 2, ease: "easeInOut" }}
            style={{
              position: "fixed",
              zIndex: 9999,
              inset: 0,
              background: "#000",
            }}>
            <LockScreen />
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MAIN CONTENT --- */}
      <AnimatePresence>
        {isUnlocked && (
          <motion.div
            key="main-content"
            className="app-content"
            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{
              opacity: 0,
              scale: 1.1,
              filter: "blur(10px)",
              transition: { duration: 1 },
            }}
            transition={{ duration: 1 }}
            style={{
              width: "100%",
              height: "100%",
              position: "relative",
              overflow: "hidden",
            }}>
            {/* --- BACKGROUND --- */}
            <BackgroundController
              floatingLinesConfig={floatingLinesConfig}
              lightPillarsConfig={lightPillarsConfig}
              ballpitConfig={ballpitConfig}
              silkConfig={silkConfig}
              galaxyConfig={galaxyConfig}
              gradientConfig={gradientConfig}
              pixelSnowConfig={pixelSnowConfig}
              hyperspeedConfig={hyperspeedConfig}
            />

            {/* --- SETTINGS MENU (Top Left) --- */}
            <SettingsMenu 
              goldShopEnabled={goldShopEnabled}
              setGoldShopEnabled={setGoldShopEnabled}
              onTogglePrestige={togglePrestigeCursor}
            />

            {/* --- NOTIFICACIONES DE LOGROS --- */}
            <AchievementToast />

            {/* --- MENU --- */}
            <StaggeredMenu
              isOpen={isMenuOpen}
              onToggle={(val) => {
                setIsMenuOpen(val);
                if (val) {
                  setShowBackgroundSettings(false);
                }
              }}
              items={shopItems}
              isFixed={true}
              position="right"
              onItemClick={handleMenuClick}
              colors={["#f700ff", "#bd71ff", "#8629b1"]}
              accentColor="#f700ff"
              menuButtonColor="#fff"
              openMenuButtonColor="#ffffff"
              displayItemNumbering={true}
              logoUrl={null}
            />

            {/* --- COMPONENTS --- */}
            <CursorController />
            <ShopContainer enableGoldTheme={goldShopEnabled} />
            <TrailSystem />

            {/* --- GAME OVERLAY --- */}
            <AnimatePresence>
              {isGameActive && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 10,
                  }}
                >
                  <GameOverlay />
                </motion.div>
              )}
            </AnimatePresence>

      {/* --- CARTA ELIMINADA --- */}

            {/* --- CUSTOMIZER --- */}
            <AnimatePresence>
              {showBackgroundSettings &&
                [
                  "floatinglines",
                  "lightpillars",
                  "ballpit",
                  "silk",
                  "galaxy",
                  "gradient",
                  "pixelsnow",
                  "hyperspeed",
                ].includes(activeBackground) && (
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      zIndex: 200,
                      height: "100%",
                      pointerEvents: "auto",
                    }}>
                    <div style={{ height: "100%" }}>
                      <BackgroundCustomizer
                        onClose={toggleBackgroundSettings}
                        floatingLinesConfig={floatingLinesConfig}
                        setFloatingLinesConfig={setFloatingLinesConfig}
                        lightPillarsConfig={lightPillarsConfig}
                        setLightPillarsConfig={setLightPillarsConfig}
                        ballpitConfig={ballpitConfig}
                        setBallpitConfig={setBallpitConfig}
                        silkConfig={silkConfig}
                        setSilkConfig={setSilkConfig}
                        galaxyConfig={galaxyConfig}
                        setGalaxyConfig={setGalaxyConfig}
                        gradientConfig={gradientConfig}
                        setGradientConfig={setGradientConfig}
                        pixelSnowConfig={pixelSnowConfig}
                        setPixelSnowConfig={setPixelSnowConfig}
                        hyperspeedConfig={hyperspeedConfig}
                        setHyperspeedConfig={setHyperspeedConfig}
                      />
                    </div>
                  </motion.div>
                )}
            </AnimatePresence>

            {/* --- MUSIC PLAYER --- */}
            <MusicPlayer
              visible={showMusicPlayer}
              onClose={() => setShowMusicPlayer(false)}
            />

            {/* --- SECRET CONTAINER --- */}
            <AnimatePresence>
              {showSecretContainer && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 99999,
                    background: "rgba(0,0,0,0.6)",
                    backdropFilter: "blur(10px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onClick={() => setShowSecretContainer(false)}>
                  <motion.div
                    initial={{ scale: 0.9, y: 20, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.9, y: 20, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      background: "rgba(20, 20, 25, 0.9)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "24px",
                      padding: "40px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      boxShadow:
                        "0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)",
                      minWidth: "320px",
                      maxWidth: "90%",
                      position: "relative",
                    }}>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        textTransform: "uppercase",
                        letterSpacing: "3px",
                        color: "rgba(255,255,255,0.4)",
                        marginBottom: "10px",
                      }}>
                      Secret Container
                    </div>
                    <h1
                      style={{
                        fontSize: "5rem",
                        color: "#fff",
                        margin: "0 0 30px 0",
                        fontWeight: "800",
                        textShadow: "0 0 30px rgba(189, 113, 255, 0.5)",
                        fontVariantNumeric: "tabular-nums",
                        lineHeight: 1,
                      }}>
                      0
                    </h1>
                    <button
                      onClick={() => setShowSecretContainer(false)}
                      style={{
                        padding: "12px 30px",
                        background:
                          "linear-gradient(135deg, #bd71ff 0%, #f700ff 100%)",
                        border: "none",
                        color: "white",
                        borderRadius: "12px",
                        cursor: "pointer",
                        fontWeight: "600",
                        fontSize: "1rem",
                        boxShadow: "0 10px 20px rgba(247, 0, 255, 0.3)",
                        transition: "transform 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.transform = "scale(1.05)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.transform = "scale(1)")
                      }>
                      Cerrar
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* --- DOCK --- */}
            <Dock
              items={dockItems}
              panelHeight={60}
              baseItemSize={45}
              magnification={60}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default App;
