import React, { useState } from "react";
import { useGameStore } from "../../store/useStore";
import { FiUnlock, FiLock } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import "../../styles/LockScreen.scss";

export default function LockScreen() {
  const { unlockApp } = useGameStore();

  const handleStart = () => {
    // Ya no hay pin, simplemente desbloquea
    unlockApp();
  };

  return (
    <div className="arcade-lock-screen">
      <div className="crts-overlay"></div>
      
      <motion.div 
        className="arcade-container"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <div className="arcade-header">
          <h1 className="glitch" data-text="INSERTE MONEDA">INSERTE MONEDA</h1>
          <p className="subtitle">ONLY GAME // V1.0</p>
        </div>

        <div className="arcade-action">
          <motion.button 
            onClick={handleStart}
            className="arcade-btn-start"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              boxShadow: ["0 0 10px rgba(0, 255, 255, 0.3)", "0 0 30px rgba(0, 255, 255, 0.8)", "0 0 10px rgba(0, 255, 255, 0.3)"]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <FiUnlock style={{ marginRight: "10px" }} />
            INICIAR JUEGO
          </motion.button>
        </div>

      </motion.div>
    </div>
  );
}
