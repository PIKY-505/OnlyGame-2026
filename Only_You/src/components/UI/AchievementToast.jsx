import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../../store/useStore";
import { ACHIEVEMENTS_DATA } from "../../data/achievements";
import { FiAward } from "react-icons/fi";
import "../../styles/AchievementToast.scss";

const AchievementToast = () => {
  const { notification, clearNotification } = useGameStore();

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        clearNotification();
      }, 4000); // 4 segundos visible
      return () => clearTimeout(timer);
    }
  }, [notification, clearNotification]);

  // Solo renderizamos si es una notificación de tipo 'achievement'
  const isAchievement = notification && notification.type === "achievement";
  const data = isAchievement ? ACHIEVEMENTS_DATA[notification.id] : null;

  return (
    <AnimatePresence>
      {isAchievement && data && (
        <motion.div
          className="achievement-toast"
          initial={{ y: -100, x: "-50%", opacity: 0 }}
          animate={{ y: 20, x: "-50%", opacity: 1 }}
          exit={{ y: -100, x: "-50%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}>
          <div className="icon-container">
            <FiAward size={24} color="#ffd700" />
          </div>
          <div className="text-container">
            <span className="title">¡Logro Desbloqueado!</span>
            <span className="name">
              {data.icon} {data.title}
            </span>
            <span className="desc">{data.desc}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AchievementToast;
