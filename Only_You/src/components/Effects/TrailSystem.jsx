import React, { useEffect } from "react";
import { useMotionValue, useSpring, motion } from "framer-motion";
import { useGameStore } from "../../store/useStore";

// --- ASSETS ---
const trailAssets = import.meta.glob("../../assets/trails/*.{gif,png,jpg,jpeg,webp}", { eager: true });

const DYNAMIC_TRAILS = Object.fromEntries(
  Object.entries(trailAssets).map(([path, mod]) => {
    const id = path.split("/").pop().split(".")[0];
    return [id, mod.default];
  })
);

const TrailSystem = () => {
  const { activeTrail } = useGameStore();

  // Coordenadas del ratón (MotionValues para rendimiento)
  const mouseX = useMotionValue(-100); // Empieza fuera de pantalla
  const mouseY = useMotionValue(-100);

  // Configuración "Fluida y Lenta":
  // - Stiffness bajo: Menos tensión, movimiento más relajado.
  // - Damping alto: Evita que rebote demasiado.
  // - Mass alto: Sensación de peso/inercia.
  const springConfig = { damping: 25, stiffness: 70, mass: 1 };

  // Valores suavizados que seguirá la mascota
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  // Mapeo de IDs a imágenes
  const TRAIL_ASSETS = {
    ...DYNAMIC_TRAILS,
    ghost: null, // Legacy o placeholder
  };

  if (!activeTrail || activeTrail === "none") return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 9999, // Siempre encima de todo
      }}>
      {/* --- RENDERIZADO DE IMAGEN --- */}
      {TRAIL_ASSETS[activeTrail] ? (
        <motion.img
          src={TRAIL_ASSETS[activeTrail]}
          alt="trail"
          style={{
            x,
            y,
            // Offset: Lo movemos 25px a la derecha y abajo para que no tape el click
            translateX: 25,
            translateY: 25,
            width: "70px", // Tamaño controlado
            height: "auto",
            filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.3))",
          }}
        />
      ) : activeTrail === "ghost" ? (
        <motion.div
          style={{
            x,
            y,
            translateX: 20,
            translateY: 20,
            fontSize: "2rem",
            filter: "drop-shadow(0 0 10px rgba(255,255,255,0.5))",
          }}>
          👻
        </motion.div>
      ) : null}
    </div>
  );
};

export default TrailSystem;
