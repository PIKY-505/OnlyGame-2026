import React, { useState, useRef, useEffect } from "react";
import {
  FiSettings,
  FiVolume2,
  FiFileText,
  FiTrash2,
  FiX,
  FiHash,
  FiStar,
  FiMusic,
  FiShoppingCart,
  FiEdit,
  FiLock,
} from "react-icons/fi";
import { FaTrophy, FaLock, FaGamepad } from "react-icons/fa";
import { useGameStore } from "../../store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import { ACHIEVEMENTS_DATA } from "../../data/achievements";
import { SHOP_DATA } from "../Shop/ShopContainer";
import "../../styles/SettingsMenu.scss";

const SettingsMenu = ({ goldShopEnabled, setGoldShopEnabled, onTogglePrestige }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDoc, setShowDoc] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const menuRef = useRef(null);
  const { gameVolume, setGameVolume, resetProgress, achievements, ownedItems, activeCursor, addCoins, unlockAchievement } =
    useGameStore();
  const [isMobile, setIsMobile] = useState(false);

  const isPrestigeUnlocked = achievements.includes("prestige");
  const isCollectorUnlocked = achievements.includes("collector");
  const isPrestigeActive = activeCursor === "cursor_prestige";

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleReset = () => {
    if (
      window.confirm(
        "¿Estás seguro de que quieres borrar todo tu progreso (monedas y compras)?",
      )
    ) {
      resetProgress();
      setIsOpen(false);
    }
  };

  const handleAdminCode = () => {
    const code = window.prompt("Introduce código de administrador:");
    if (!code) return;

    // Códigos válidos: KONAMI, ADMIN, MATRIX
    if (["KONAMI", "ADMIN", "MATRIX"].includes(code.toUpperCase())) {
      addCoins(1000000);
      unlockAchievement("matrix_master");
      alert("¡Acceso concedido! Recursos añadidos.");
      setIsOpen(false);
    } else {
      alert("Código inválido.");
    }
  };

  return (
    <>
      {/* Ajustes para móvil: Evitar recortes por bordes curvos/notch */}
      <style>{`
        @media (max-width: 768px) {
          .settings-container {
            top: max(20px, env(safe-area-inset-top) + 15px) !important;
            left: max(20px, env(safe-area-inset-left) + 15px) !important;
          }
        }
      `}</style>

      <div className="settings-container" ref={menuRef}>
        <button
          className={`settings-btn ${isOpen ? "active" : ""}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Ajustes">
          <FiSettings size={20} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="settings-dropdown"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}>
              
              {/* Toggles Especiales */}
              <div style={{ marginBottom: "15px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <ToggleItem
                  label="Cursor Prestigio"
                  isActive={isPrestigeActive}
                  isLocked={!isPrestigeUnlocked}
                  onToggle={() => onTogglePrestige(!isPrestigeActive)}
                  color="#f700ff"
                />
                <ToggleItem
                  label="Tienda Dorada"
                  isActive={goldShopEnabled}
                  isLocked={!isCollectorUnlocked}
                  onToggle={() => setGoldShopEnabled(!goldShopEnabled)}
                  color="#ffd700"
                />
              </div>

              {/* Volumen */}
              <div className="setting-item">
                <div className="label">
                  <FiVolume2 /> <span>Sonido Juego</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={gameVolume}
                  onChange={(e) => setGameVolume(parseFloat(e.target.value))}
                />
              </div>

              <div className="divider" />

              {/* Logros */}
              <button
                className="setting-action-btn"
                onClick={() => {
                  setShowAchievements(true);
                  setIsOpen(false);
                }}>
                <FaTrophy /> Logros
              </button>

              {/* Documentación */}
              <button
                className="setting-action-btn"
                onClick={() => {
                  setShowDoc(true);
                  setIsOpen(false);
                }}>
                <FiFileText /> Documentación
              </button>

              {/* Código Admin (Móvil) */}
              {isMobile && (
                <button
                  className="setting-action-btn"
                  onClick={handleAdminCode}>
                  <FiHash /> Código Admin
                </button>
              )}

              {/* Resetear Progreso */}
              <button
                className="setting-action-btn danger"
                onClick={handleReset}>
                <FiTrash2 /> Resetear Progreso
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal de Documentación */}
      <AnimatePresence>
        {showDoc && (
          <div className="doc-overlay" onClick={() => setShowDoc(false)}>
            <motion.div
              className="doc-modal"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}>
              <button
                className="close-doc-btn"
                onClick={() => setShowDoc(false)}>
                <FiX size={24} />
              </button>
              <h2>Guía de Usuario</h2>
              <div className="doc-content" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                
                <div className="doc-section">
                  <h3 style={{ borderBottom: "2px solid #f700ff", paddingBottom: "5px", marginBottom: "15px" }}>
                    Barra de Navegación (Dock)
                  </h3>
                  <p style={{ fontSize: "0.9rem", opacity: 0.8, marginBottom: "15px" }}>
                    Tu centro de control en la parte inferior de la pantalla. Pasa el ratón para ampliar los iconos.
                  </p>
                  <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "12px" }}>
                    <li style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ background: "rgba(255,255,255,0.1)", padding: "8px", borderRadius: "50%", display: "flex" }}><FiMusic color="#f700ff"/></div>
                      <div><strong>Música:</strong> Abre el reproductor para controlar la playlist integrada.</div>
                    </li>
                    <li style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ background: "rgba(255,255,255,0.1)", padding: "8px", borderRadius: "50%", display: "flex" }}><FiShoppingCart color="#00ffff"/></div>
                      <div><strong>Tienda:</strong> Accede al catálogo para personalizar fondos, cursores y más.</div>
                    </li>
                    <li style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ background: "rgba(255,255,255,0.1)", padding: "8px", borderRadius: "50%", display: "flex" }}><FaGamepad color="#ff99cc"/></div>
                      <div><strong>Juego:</strong> Activa o desactiva el minijuego de recolección de monedas.</div>
                    </li>
                    <li style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ background: "rgba(255,255,255,0.1)", padding: "8px", borderRadius: "50%", display: "flex" }}><FiEdit color="#bd71ff"/></div>
                      <div><strong>Fondo:</strong> Abre el panel de personalización avanzada para el fondo actual.</div>
                    </li>
                    <li style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ background: "rgba(255,255,255,0.1)", padding: "8px", borderRadius: "50%", display: "flex" }}><FiLock color="#ffffff"/></div>
                      <div><strong>Bloquear:</strong> Vuelve a la pantalla de bloqueo inicial.</div>
                    </li>
                  </ul>
                </div>

                <div className="doc-section">
                  <h3 style={{ borderBottom: "2px solid #00ffff", paddingBottom: "5px", marginBottom: "10px" }}>Juego y Tienda</h3>
                  <p style={{ marginBottom: "10px" }}>
                    <strong>El Juego:</strong> El juego que consiste en recolectar monedas y se va haciendo más dificil. Haz clic en ellas para recolectarlas. Las monedas brillantes otorgan bonificaciones. ¡Encadena recolecciones rápidas para aumentar tu <strong>Combo</strong> y multiplicar tus ganancias!
                  </p>
                  <p>
                    <strong>La Tienda:</strong> Utiliza tus monedas para desbloquear elementos cosméticos. Puedes cambiar el fondo, el estilo del cursor, añadir una mascota que te siga o cambiar el aspecto de las monedas.
                  </p>
                </div>

                <div className="doc-section">
                  <h3 style={{ borderBottom: "2px solid #ffd700", paddingBottom: "5px", marginBottom: "10px" }}>Logros y Secretos</h3>
                  <p>
                    El sistema cuenta con numerosos logros ocultos. Juega, explora la interfaz y experimenta para desbloquearlos.
                  </p>
                  <p style={{ fontStyle: "italic", color: "#ffd700", marginTop: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <FaTrophy /> Pista: Algunos logros especiales desbloquean características únicas en este menú de ajustes...
                  </p>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Logros */}
      <AnimatePresence>
        {showAchievements && (
          <div
            className="doc-overlay"
            onClick={() => setShowAchievements(false)}>
            <motion.div
              className="doc-modal"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}>
              <button
                className="close-doc-btn"
                onClick={() => setShowAchievements(false)}>
                <FiX size={24} />
              </button>
              <h2>
                <FaTrophy style={{ marginRight: "10px", color: "#ffd700" }} />{" "}
                Tus Logros
              </h2>
              <div className="doc-content">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "15px",
                  }}>
                  {Object.entries(ACHIEVEMENTS_DATA).map(([key, data]) => {
                    const isUnlocked = achievements.includes(key);

                    // Lógica para mostrar contador en el logro de Coleccionista
                    let description = data.desc;
                    if (key === "collector") {
                      const allNonSkinItems = Object.values(SHOP_DATA).flat().filter((item) => item.type !== "skin");
                      const totalItems = allNonSkinItems.length;
                      const currentOwned = ownedItems ? allNonSkinItems.filter((item) => ownedItems.includes(item.id)).length : 0;
                      description = `${data.desc} (${currentOwned}/${totalItems})`;
                    }

                    // Lógica para mostrar contador en el logro de Prestigio
                    if (key === "prestige") {
                      const allKeys = Object.keys(ACHIEVEMENTS_DATA);
                      const requiredKeys = allKeys.filter(
                        (k) => k !== "prestige",
                      );
                      const unlockedCount = achievements.filter((k) =>
                        requiredKeys.includes(k),
                      ).length;
                      description = `${data.desc} (${unlockedCount}/${requiredKeys.length})`;
                    }

                    return (
                      <div
                        key={key}
                        style={{
                          background: isUnlocked
                            ? "rgba(255, 215, 0, 0.1)"
                            : "rgba(255, 255, 255, 0.05)",
                          border: isUnlocked
                            ? "1px solid rgba(255, 215, 0, 0.3)"
                            : "1px solid rgba(255, 255, 255, 0.1)",
                          padding: "15px",
                          borderRadius: "12px",
                          opacity: isUnlocked ? 1 : 0.5,
                          display: "flex",
                          alignItems: "center",
                          gap: "15px",
                        }}>
                        <div style={{ fontSize: "2rem" }}>
                          {isUnlocked ? (
                            data.icon
                          ) : (
                            <FaLock className="locked-icon" />
                          )}
                        </div>
                        <div>
                          <h3
                            style={{
                              margin: "0 0 5px 0",
                              color: isUnlocked ? "#ffd700" : "white",
                            }}>
                            {data.title}
                          </h3>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "0.9rem",
                              color: "rgba(255,255,255,0.7)",
                            }}>
                            {description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

const ToggleItem = ({ label, isActive, isLocked, onToggle, color }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", opacity: isLocked ? 0.5 : 1 }}>
    <span style={{ fontSize: "0.9rem", fontWeight: 500, display: "flex", alignItems: "center", gap: "8px", color: "white" }}>
      {label} {isLocked && <FaLock size={10} style={{ opacity: 0.7 }} />}
    </span>
    
    <div
      onClick={!isLocked ? onToggle : undefined}
      style={{
        width: "40px",
        height: "22px",
        background: isActive ? color : "rgba(255,255,255,0.2)",
        borderRadius: "12px",
        position: "relative",
        cursor: isLocked ? "not-allowed" : "pointer",
        transition: "background 0.3s ease",
      }}
    >
      <motion.div
        animate={{ x: isActive ? 18 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        style={{
          width: "18px",
          height: "18px",
          background: "white",
          borderRadius: "50%",
          position: "absolute",
          top: "2px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
        }}
      />
    </div>
  </div>
);

export default SettingsMenu;
