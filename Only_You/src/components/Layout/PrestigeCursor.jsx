import React, { useEffect } from "react";
import {
  motion,
  useSpring,
  useMotionValue,
  useTransform,
  useVelocity,
} from "framer-motion";

const PrestigeCursor = () => {
  // 1. Posición exacta del mouse (el punto de enganche)
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // 2. Física del diamante (Spring para simular peso e inercia)
  // Ajustado: Más rigidez (stiffness) para que no parezca una correa larga
  // Menos masa para que reaccione rápido pero mantenga inercia
  const springConfig = { damping: 20, stiffness: 300, mass: 0.2 };

  const diamondX = useSpring(mouseX, springConfig);
  const diamondY = useSpring(mouseY, springConfig);

  // 3. Rotación basada en la velocidad (Efecto Péndulo)
  const velocityX = useVelocity(diamondX);
  // Aumentamos el rango de rotación para más dramatismo
  const rotate = useTransform(velocityX, [-2000, 2000], [-60, 60]);

  // Longitud de la cadena (offset vertical)
  const CHAIN_LENGTH = 60;

  // 4. Cadenas (Doble curva Bezier para simular collar)
  const chainPath1 = useTransform(
    [mouseX, mouseY, diamondX, diamondY],
    ([mx, my, dx, dy]) => {
      const ty = dy + CHAIN_LENGTH;
      return `M ${mx - 4} ${my} Q ${(mx + dx) / 2 - 12} ${(my + ty) / 2} ${dx} ${ty}`;
    }
  );

  const chainPath2 = useTransform(
    [mouseX, mouseY, diamondX, diamondY],
    ([mx, my, dx, dy]) => {
      const ty = dy + CHAIN_LENGTH;
      return `M ${mx + 4} ${my} Q ${(mx + dx) / 2 + 12} ${(my + ty) / 2} ${dx} ${ty}`;
    }
  );

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999 }}>
      {/* Cadena del collar */}
      <svg style={{ width: "100%", height: "100%", overflow: "visible" }}>
        {/* Sombra de la cadena */}
        <motion.path
          d={chainPath1}
          stroke="rgba(0,0,0,0.2)"
          strokeWidth="4"
          fill="none"
          style={{ translateX: 2, translateY: 2 }}
        />
        <motion.path
          d={chainPath2}
          stroke="rgba(0,0,0,0.2)"
          strokeWidth="4"
          fill="none"
          style={{ translateX: 2, translateY: 2 }}
        />

        {/* Cadena real con efecto de eslabones */}
        <motion.path
          d={chainPath1}
          stroke="url(#chainGradient)"
          strokeWidth="3"
          strokeDasharray="1 3"
          strokeLinecap="round"
          fill="none"
        />
        <motion.path
          d={chainPath2}
          stroke="url(#chainGradient)"
          strokeWidth="3"
          strokeDasharray="1 3"
          strokeLinecap="round"
          fill="none"
        />
        <defs>
          <linearGradient id="chainGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffd700" />
            <stop offset="50%" stopColor="#fff" />
            <stop offset="100%" stopColor="#ffd700" />
          </linearGradient>
          <filter id="diamondGlow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Punto de anclaje (Cursor real) */}
      <motion.div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          x: mouseX,
          y: mouseY,
          translateX: "-50%",
          translateY: "-50%",
          width: 12,
          height: 12,
          background: "radial-gradient(circle, #fff 30%, #ffd700 100%)",
          borderRadius: "50%",
          boxShadow: "0 0 10px #ffd700, 0 0 5px #fff",
          zIndex: 20,
        }}
      />

      {/* Diamante Colgante */}
      <motion.div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          x: diamondX,
          y: diamondY,
          translateX: "-50%",
          translateY: CHAIN_LENGTH - 30, // Centrado visualmente (60px altura / 2)
          rotate,
          zIndex: 10,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: 60,
          height: 60,
          filter: "drop-shadow(0 15px 25px rgba(0,0,0,0.3))",
        }}
      >
        {/* SVG DIAMANTE PERSONALIZADO */}
        <svg width="50" height="50" viewBox="0 0 100 100" style={{ overflow: "visible" }}>
          <g filter="url(#diamondGlow)">
            {/* Engarce dorado */}
            <path d="M45 15 L55 15 L50 25 Z" fill="#ffd700" />
            
            {/* Cuerpo del diamante */}
            <path
              d="M20 35 L80 35 L100 35 L50 95 L0 35 Z"
              fill="url(#diamondBodyGrad)"
              stroke="rgba(255,255,255,0.8)"
              strokeWidth="1"
            />
            {/* Facetas superiores */}
            <path d="M20 35 L35 20 L65 20 L80 35" fill="#e0f7fa" opacity="0.6" />
            <path d="M35 20 L50 35 L65 20" fill="#b2ebf2" opacity="0.8" />
            <path d="M20 35 L50 95 L80 35" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
            <path d="M35 20 L50 95 L65 20" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
            
            {/* Brillo central */}
            <circle cx="50" cy="45" r="15" fill="white" fillOpacity="0.2" style={{ mixBlendMode: "overlay" }} />
          </g>
          
          <defs>
            <linearGradient id="diamondBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e1f5fe" />
              <stop offset="40%" stopColor="#4fc3f7" />
              <stop offset="100%" stopColor="#0288d1" />
            </linearGradient>
          </defs>
        </svg>

        {/* Destello animado CSS */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "20%",
            width: "60%",
            height: "60%",
            background:
              "radial-gradient(circle, rgba(255,255,255,1) 0%, transparent 70%)",
            mixBlendMode: "screen",
            opacity: 0.8,
            animation: "diamondSparkle 3s infinite ease-in-out",
            pointerEvents: "none",
          }}
        />
      </motion.div>
      
      <style>{`
        @keyframes diamondSparkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.2) rotate(45deg); }
        }
      `}</style>
    </div>
  );
};

export default PrestigeCursor;