import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "../../styles/LoadingScreen.scss";

const LOADING_MESSAGES = [
  "Insertando moneda virtual...",
  "Calibrando joysticks...",
  "Energizando tubos de rayos catódicos...",
  "Cargando sprites de 16-bits...",
  "Preparando el sistema para el jugador 1...",
];

const LoadingScreen = ({ progress }) => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 1500); // Cambia de frase cada 1.5s
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="loading-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}>
      
      <div className="crts-overlay"></div>
      <div className="loading-background-effect" />

      <div className="loading-content">
        <h1 className="loading-title">ONLY GAME</h1>

        <div className="progress-wrapper">
          <div className="progress-info">
            <span className="loading-label">Cargando sistema</span>
            <span className="loading-percent">{progress}%</span>
          </div>

          <div className="progress-bar-bg">
            <motion.div
              className="progress-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 50, damping: 15 }}
            />
          </div>
        </div>

        <div className="message-container">
          <motion.div
            key={messageIndex}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
            className="loading-message">
            {LOADING_MESSAGES[messageIndex]}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default LoadingScreen;
