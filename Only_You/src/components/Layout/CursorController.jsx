import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import { useGameStore } from "../../store/useStore";
import "../../styles/Cursor.scss";
import {
  FiMousePointer,
  FiZap,
  FiDisc,
  FiCrosshair,
  FiDroplet,
  FiMaximize,
  FiNavigation,
  FiAperture,
} from "react-icons/fi";
import { FaTrophy } from "react-icons/fa";
import TargetCursor from "./TargetCursor";
import SplashCursor from "./SplashCursor";
import Crosshair from "./Crosshair";
import PrestigeCursor from "./PrestigeCursor";

// --- ASSETS ---
import ringCursor from "../../assets/img/cursor/ring.gif";

// Configuración de los cursores
export const CURSOR_CONFIG = {
  // ID del item en la tienda : Configuración
  cursor_neon: {
    name: "Neon Pulse",
    price: 100,
    desc: "Estilo Cyberpunk. Cambia de color.",
    icon: <FiNavigation />,
    type: "replace", // Oculta el nativo
    className: "cursor-neon",
  },
  cursor_gold: {
    name: "Gold Sparkle",
    price: 200,
    desc: "Cursor de oro puro con rastro brillante.",
    icon: <FiZap />,
    type: "replace", // AHORA REEMPLAZA AL ORIGINAL
    className: "cursor-gold",
    effect: "sparkle",
  },
  cursor_ring: {
    name: "Anillo",
    price: 250,
    desc: "Un anillo animado.",
    icon: <FiDisc />,
    type: "replace",
    className: "cursor-ring",
    backgroundImage: ringCursor,
  },
  cursor_blackhole: {
    name: "Agujero Negro",
    price: 300,
    desc: "Singularidad que distorsiona la luz.",
    icon: <FiAperture />,
    type: "replace",
    className: "cursor-blackhole",
  },
   cursor_splash: {
    name: "Splash Fluid",
    price: 600,
    desc: "Tinta fluida reactiva.",
    icon: <FiDroplet />,
    type: "custom",
    component: SplashCursor,
    hideNative: false,
  },
  cursor_crosshair: {
    name: "Crosshair",
    price: 1000,
    desc: "Líneas de precisión con distorsión.",
    icon: <FiCrosshair />,
    type: "custom",
    component: Crosshair,
  },
  cursor_target: {
    name: "Target HUD",
    price: 3000,
    desc: "Sistema de fijación táctico.",
    icon: <FiMaximize />,
    type: "custom", // Nuevo tipo para componentes completos
    component: TargetCursor,
  },
  cursor_prestige: {
    name: "Prestigio",
    price: 0,
    desc: "Símbolo de máxima excelencia.",
    icon: <FaTrophy />,
    type: "custom",
    component: PrestigeCursor,
    requiresAchievement: "prestige", // Propiedad especial para filtrado
    hiddenInShop: true, // No aparecerá en la lista de compra
  },
};

export default function CursorController() {
  // Asumimos que activeCursor existe en tu store (si no, añádelo)
  const { activeCursor } = useGameStore();
  const cursorRef = useRef(null);
  const [isClicking, setIsClicking] = useState(false);
  const [particles, setParticles] = useState([]);
  const [isVisible, setIsVisible] = useState(false); // Nuevo estado para visibilidad (móvil)
  const requestRef = useRef();

  // 1. Lógica de seguimiento del ratón (Optimizada con Refs)
  useEffect(() => {
    const handleMove = (e) => {
      const { clientX, clientY } = e;

      // En PC siempre es visible al mover. En móvil se gestiona por touchstart/end
      if (e.type === 'mousemove') setIsVisible(true);

      // Mover el cursor principal (si existe)
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${clientX}px, ${clientY}px, 0)`;
      }

      // Generar efectos (Partículas / Rastros)
      const config = CURSOR_CONFIG[activeCursor];
      if (config?.effect) {
        // Efecto Sparkle (Oro)
        if (config.effect === "sparkle" && Math.random() > 0.7) {
          createParticle(clientX, clientY, "sparkle");
        }
      }
    };

    // Soporte Táctil (El cursor sigue al dedo)
    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        handleMove({ clientX: touch.clientX, clientY: touch.clientY, type: 'touchmove' });
      }
    };

    const handleTouchStart = (e) => {
      setIsVisible(true);
      setIsClicking(true);
      handleTouchMove(e); // Mover inmediatamente al punto de toque
    };

    const handleTouchEnd = () => {
      setIsClicking(false);
      setIsVisible(false); // Ocultar cursor al levantar el dedo
    };

    const handleDown = () => setIsClicking(true);
    const handleUp = () => setIsClicking(false);

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("mouseup", handleUp);
    
    // Listeners Táctiles
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [activeCursor]);

  // 2. Gestión de partículas
  const createParticle = (x, y, type) => {
    const id = Date.now() + Math.random();
    setParticles((prev) => [...prev, { id, x, y, type }]);
    // Auto-limpieza después de la animación (1s)
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== id));
    }, 1000);
  };

  // 3. Ocultar/Mostrar cursor nativo
  useEffect(() => {
    const config = CURSOR_CONFIG[activeCursor];

    if (config) {
      // Caso 1: Ocultar nativo (para reemplazos div o custom)
      if (
        (config.type === "replace" || config.type === "custom") &&
        config.hideNative !== false
      ) {
        document.body.classList.add("hide-native-cursor");
      }
      // Caso 2: Cursor nativo personalizado (CSS class)
      if (config.bodyClass) {
        document.body.classList.add(config.bodyClass);
      }
    }
    
    return () => {
      document.body.classList.remove("hide-native-cursor");
      if (config && config.bodyClass) {
        document.body.classList.remove(config.bodyClass);
      }
    };
  }, [activeCursor]);

  // Si no hay cursor activo o es el default, no renderizamos nada (o solo partículas si quedan)
  const config = CURSOR_CONFIG[activeCursor];

  return ReactDOM.createPortal(
    <div className="cursor-overlay">
      {/* Renderizado de Partículas (Complemento) */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="sparkle-particle"
          style={{ left: p.x, top: p.y }}
        />
      ))}

      {/* Renderizado de Cursor Principal (Reemplazo) */}
      {config && config.type === "replace" && isVisible && (
        <div ref={cursorRef} className="cursor-follower">
          <div
            className={`${config.className} ${isClicking ? "clicking" : ""}`}
            style={config.backgroundImage ? { backgroundImage: `url(${config.backgroundImage})` } : {}}
          />
        </div>
      )}

      {/* Renderizado de Cursor Custom (Componente React completo) */}
      {config && config.type === "custom" && isVisible && (
        <config.component targetSelector="button, .shop-item, input, a, .coin-entity, .dock-item, .dock-icon" />
      )}
    </div>,
    document.body,
  );
}
