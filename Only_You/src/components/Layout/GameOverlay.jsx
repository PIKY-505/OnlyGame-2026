import React, { useEffect, useRef, useState, useCallback } from "react";
import { useGameStore } from "../../store/useStore";
import { ACHIEVEMENTS_DATA } from "../../data/achievements";
import { SHOP_DATA } from "../Shop/ShopContainer";

const COIN_SIZE = 80; // Tamaño en px

// --- CARGA DINÁMICA DE SKINS ---
// Busca carpetas en /assets/coin/[nombre_skin]/
const coinAssets = import.meta.glob("../../assets/coin/*/*.{png,jpg,jpeg,gif,mp3,wav}", {
  eager: true,
});

const SKINS = {};

Object.keys(coinAssets).forEach((path) => {
  // path ejemplo: "../../assets/coin/dase/dase.png"
  const parts = path.split("/");
  const skinId = parts[parts.length - 2]; // Nombre de la carpeta (ej: "dase", "angel")
  const fileName = parts[parts.length - 1].toLowerCase();

  if (!SKINS[skinId]) {
    SKINS[skinId] = { normal: null, shiny: null, sound: null };
  }

  const asset = coinAssets[path].default;

  if (fileName.includes("shiny")) {
    SKINS[skinId].shiny = asset;
  } else if (fileName.endsWith("mp3") || fileName.endsWith("wav")) {
    SKINS[skinId].sound = asset;
  } else {
    // Si no es shiny ni sonido, asumimos que es la moneda normal
    SKINS[skinId].normal = asset;
  }
});

// Fallback: Si no hay shiny, usa la normal
Object.values(SKINS).forEach((skin) => {
  if (!skin.shiny && skin.normal) skin.shiny = skin.normal;
});

const skinKeys = Object.keys(SKINS);
const getRandomSkinKey = () => skinKeys[Math.floor(Math.random() * skinKeys.length)];

export default function GameOverlay() {
  const {
    addCoins,
    activeCoinSkin,
    gameVolume,
    unlockAchievement,
    coins,
    achievements,
    ownedItems,
    activeCursor,
  } = useGameStore();
  const [entities, setEntities] = useState([]);
  const [particles, setParticles] = useState([]);
  const [combo, setCombo] = useState(1);
  const requestRef = useRef();
  const audioRef = useRef(null);
  const isMounted = useRef(false);
  const comboExpirationRef = useRef(0);
  const comboDurationRef = useRef(0);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const isRandomMode = activeCoinSkin === "random";

  // Obtener recursos actuales basados en la skin
  // Si es random, usamos "dase" como fallback para el HUD o inicialización genérica
  const currentSkin = (isRandomMode ? SKINS["dase"] : SKINS[activeCoinSkin]) || SKINS["dase"] || {
    normal: "",
    shiny: "",
    sound: null,
  };

  // Inicializar audio
  useEffect(() => {
    if (!isRandomMode && currentSkin && currentSkin.sound) {
      audioRef.current = new Audio(currentSkin.sound);
      audioRef.current.volume = gameVolume;
    }
  }, [currentSkin, gameVolume, isRandomMode]);

  // Inicializar monedas
  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const newEntities = [];

    // 5 Monedas Normales (Valen 1)
    for (let i = 0; i < 5; i++) {
      const skinKey = isRandomMode ? getRandomSkinKey() : activeCoinSkin;
      const skin = SKINS[skinKey] || SKINS["dase"];

      newEntities.push({
        id: `normal-${i}`,
        type: "normal",
        x: Math.random() * (width - COIN_SIZE),
        y: Math.random() * (height - COIN_SIZE),
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        img: skin.normal,
        skinId: skinKey,
        value: 1,
      });
    }

    // 1 Moneda Especial (Vale 5)
    const shinySkinKey = isRandomMode ? getRandomSkinKey() : activeCoinSkin;
    const shinySkin = SKINS[shinySkinKey] || SKINS["dase"];

    newEntities.push({
      id: `shiny-1`,
      type: "shiny",
      x: Math.random() * (width - COIN_SIZE),
      y: Math.random() * (height - COIN_SIZE),
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10,
      img: shinySkin.shiny,
      skinId: shinySkinKey,
      value: 5,
    });

    setEntities(newEntities);
  }, [activeCoinSkin, currentSkin]);

  // Bucle de animación
  const update = useCallback(() => {
    // Chequear temporizador del combo
    if (comboExpirationRef.current > 0 && Date.now() > comboExpirationRef.current) {
      setCombo((prev) => (prev > 1 ? 1 : prev));
      comboExpirationRef.current = 0;
    }

    setEntities((prev) =>
      prev.map((entity) => {
        let { x, y, vx, vy } = entity;

        x += vx;
        y += vy;

        // Rebote en los bordes
        if (x <= 0 || x >= window.innerWidth - COIN_SIZE) {
          vx = -vx;
          x = Math.max(0, Math.min(x, window.innerWidth - COIN_SIZE));
        }
        if (y <= 0 || y >= window.innerHeight - COIN_SIZE) {
          vy = -vy;
          y = Math.max(0, Math.min(y, window.innerHeight - COIN_SIZE));
        }

        return { ...entity, x, y, vx, vy };
      }),
    );

    // Actualizar partículas
    setParticles((prev) => {
      if (prev.length === 0) return prev;
      return prev
        .map((p) => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.5, // Gravedad
          life: p.life - 0.03, // Desvanecimiento
        }))
        .filter((p) => p.life > 0);
    });

    requestRef.current = requestAnimationFrame(update);
  }, []);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current);
  }, [update]);

  const handleCoinClick = (entity) => {
    // --- SISTEMA DE COMBO ---
    let nextCombo = combo + 1;
    if (nextCombo > 20) nextCombo = 20; // Máximo x20
    setCombo(nextCombo);

    // Dificultad: Menos tiempo para mantener el combo cuanto más alto sea (Min 0.5s)
    const timeWindow = Math.max(500, 2500 - nextCombo * 100);
    comboDurationRef.current = timeWindow;
    comboExpirationRef.current = Date.now() + timeWindow;

    // Puntos con multiplicador
    const earned = entity.value * nextCombo;
    addCoins(earned);

    // --- HAPTIC FEEDBACK (Móvil) ---
    if (navigator.vibrate) {
      // Vibración diferente para shiny vs normal
      if (entity.type === "shiny") {
        navigator.vibrate([50, 30, 50]); // Doble pulso para monedas especiales
      } else {
        navigator.vibrate(40); // Pulso corto para normales
      }
    }

    // --- CHEQUEO DE LOGROS ---
    unlockAchievement("baby_steps"); // Antes first_coin

    if (nextCombo >= 5) unlockAchievement("on_fire"); // Antes combo_5
    if (nextCombo >= 10) unlockAchievement("god_mode"); // Antes velocista

    if (entity.type === "shiny") unlockAchievement("shiny_lover"); // Antes shiny_hunter

    // Nuevo logro: Francotirador (si la moneda iba muy rápido)
    const speed = Math.sqrt(entity.vx * entity.vx + entity.vy * entity.vy);
    if (speed > 15) unlockAchievement("sniper");

    const currentTotal = coins + earned; // Calculamos el total actual
    if (currentTotal >= 500) unlockAchievement("piggy_bank"); // rico
    if (currentTotal >= 1000) unlockAchievement("stonks"); // half_k
    if (currentTotal >= 5000) unlockAchievement("crypto_king"); // millonario

    // --- LOGICA NUEVOS LOGROS (Coleccionista y Prestigio) ---

    // 1. Coleccionista: Si tienes TODOS los items de la tienda (EXCEPTO SKINS)
    const allNonSkinItems = Object.values(SHOP_DATA).flat().filter((item) => item.type !== "skin");
    const hasAllNonSkins = allNonSkinItems.every((item) => ownedItems.includes(item.id));

    if (hasAllNonSkins) {
      unlockAchievement("collector");
    }

    // 2. Prestigio: Si tienes todos los logros MENOS el de prestigio
    if (achievements) {
      const allAchievementKeys = Object.keys(ACHIEVEMENTS_DATA);
      const totalAchievements = allAchievementKeys.length;
      // Filtramos 'prestige' de la lista de requeridos
      const requiredAchievements = allAchievementKeys.filter(
        (k) => k !== "prestige",
      );
      const hasAllRequired = requiredAchievements.every((key) =>
        achievements.includes(key),
      );

      if (hasAllRequired) unlockAchievement("prestige");
    }

    // --- SISTEMA DE AUDIO MEJORADO ---
    // Usamos cloneNode() o new Audio() para permitir superposición (polyphony)
    // y evitar que el sonido se corte al hacer clicks rápidos.
    if (entity.type === "shiny") {
      const skinId = entity.skinId || activeCoinSkin;
      const skin = SKINS[skinId] || currentSkin;
      
      if (skin && skin.sound) {
        // En móviles, instanciar new Audio() DIRECTAMENTE en la respuesta al evento (PointerDown)
        // garantiza que Safari/Chrome NUNCA lo bloqueen por políticas de auto-play.
        const sfx = new Audio(skin.sound);
        sfx.volume = gameVolume;
        sfx.play().catch((e) => console.warn("Audio play error en móvil:", e));
      }
    }

    // Generar partículas
    const newParticles = [];
    const pColor = entity.type === "shiny" ? "#ffd700" : "#ffffff";
    for (let i = 0; i < 12; i++) {
      newParticles.push({
        id: `${Date.now()}-${i}-${Math.random()}`,
        x: entity.x + COIN_SIZE / 2,
        y: entity.y + COIN_SIZE / 2,
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 0.5) * 15,
        life: 1.0,
        color: pColor,
      });
    }
    setParticles((prev) => [...prev, ...newParticles]);

    // 3. Desaparecer la moneda temporalmente (eliminar del array)
    setEntities((prev) => prev.filter((e) => e.id !== entity.id));

    // 4. Reaparecer (Respawn) después de 2 segundos
    setTimeout(() => {
      if (!isMounted.current) return;

      setEntities((prev) => {
        const width = window.innerWidth;
        const height = window.innerHeight;

        // Dificultad: Velocidad aumenta con el combo (+15% por nivel)
        // Topeamos la velocidad al nivel 10 para que no sea imposible al llegar a 20
        const speedMultiplier = 1 + Math.min(nextCombo, 10) * 0.15;

        const nextSkinKey = isRandomMode ? getRandomSkinKey() : activeCoinSkin;
        const nextSkin = SKINS[nextSkinKey] || SKINS["dase"];

        const newEntity = {
          ...entity,
          // Generamos un ID único para forzar a React a renderizarlo de nuevo
          id: `${entity.type}-${Date.now()}-${Math.random()}`,
          x: Math.random() * (width - COIN_SIZE),
          y: Math.random() * (height - COIN_SIZE),
          // Cambiamos ligeramente la dirección al azar y aplicamos multiplicador de velocidad
          vx:
            (Math.random() - 0.5) *
            (entity.type === "shiny" ? 12 : 8) *
            speedMultiplier,
          vy:
            (Math.random() - 0.5) *
            (entity.type === "shiny" ? 12 : 8) *
            speedMultiplier,
          img: entity.type === "shiny" ? nextSkin.shiny : nextSkin.normal,
          skinId: nextSkinKey,
        };
        return [...prev, newEntity];
      });
    }, 2000);
  };

  // Cálculos visuales para el círculo del combo
  const now = Date.now();
  const timeLeft = Math.max(0, comboExpirationRef.current - now);
  const progress = combo > 1 && comboDurationRef.current > 0 ? timeLeft / comboDurationRef.current : 0;
  const radius = 60;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;

  // Color dinámico: Verde -> Amarillo -> Rojo
  const hue = Math.min(120, Math.max(0, progress * 120));
  const ringColor = `hsl(${hue}, 100%, 50%)`;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 30, // Bajamos a 30 para que la Tienda (z-40) se vea encima
        pointerEvents: "auto",
        overflow: "hidden",
        touchAction: "none", // IMPORTANTE: Evita scroll/zoom al jugar en móvil
      }}>
      {/* Estilos responsivos para el HUD */}
      <style>{`
        @media (max-width: 768px) {
          .game-hud-coins {
            top: calc(80px + env(safe-area-inset-top)) !important;
            left: 20px !important;
            font-size: 1rem !important;
            padding: 6px 12px !important;
          }
          .game-hud-combo {
            top: 20px !important;
            right: 20px !important;
            width: 100px !important;
            height: 100px !important;
          }
        }
      `}</style>
      {/* --- CONTADOR DE MONEDAS --- */}
      <div
        className="game-hud-coins"
        style={{
          position: "absolute",
          top: "110px",
          left: "30px",
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          gap: "10px",
          background: "rgba(0,0,0,0.5)",
          padding: "10px 20px",
          borderRadius: "30px",
          border: "1px solid rgba(255,255,255,0.2)",
          backdropFilter: "blur(5px)",
          color: "#ffd700",
          fontFamily: "var(--font-main)",
          fontWeight: "bold",
          fontSize: "1.2rem",
          pointerEvents: "none",
        }}>
        <img src={currentSkin.normal} alt="coin" style={{ width: "24px", height: "24px" }} />
        <span>{coins}</span>
      </div>

      {/* --- COMBO UI --- */}
      <div
        className="game-hud-combo"
        style={{
          position: "absolute",
          top: "40px",
          right: "40px",
          pointerEvents: "none",
          zIndex: 100,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "140px",
          height: "140px",
        }}>
        {combo > 1 && (
          <>
            <svg
              height={radius * 2}
              width={radius * 2}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%) rotate(-90deg)",
              }}>
              <circle stroke="rgba(255, 255, 255, 0.1)" strokeWidth={stroke} fill="transparent" r={normalizedRadius} cx={radius} cy={radius} />
              <circle
                stroke={ringColor}
                strokeWidth={stroke}
                strokeDasharray={circumference + " " + circumference}
                style={{ strokeDashoffset, transition: "stroke-dashoffset 0.1s linear" }}
                strokeLinecap="round"
                fill="transparent"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
            </svg>
            <div
              style={{
                fontFamily: "var(--font-main)",
                fontSize: "3rem",
                fontWeight: "900",
                color: "#f700ff",
                textShadow: "0 0 20px rgba(247, 0, 255, 0.8)",
                transform: `scale(${1 + Math.min(combo, 10) * 0.1})`,
                transition: "transform 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
              }}>
              x{combo}
            </div>
          </>
        )}
      </div>

      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: p.x,
            top: p.y,
            width: "8px",
            height: "8px",
            backgroundColor: p.color,
            borderRadius: "50%",
            opacity: p.life,
            pointerEvents: "none",
            transform: "translate(-50%, -50%)",
            boxShadow: `0 0 8px ${p.color}`,
          }}
        />
      ))}
      {entities.map((entity) => {
        const isTarget = activeCursor === "cursor_target";
        const hitPadding = isTarget ? 10 : 0;

        return (
          <div
            key={entity.id}
            // 1. AÑADIMOS LA CLASE "shiny" SI ES NECESARIO
            className={`coin-entity ${entity.type === "shiny" ? "is-shiny" : ""}`}
            
            onPointerDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleCoinClick(entity);
            }}
            style={{
              position: "absolute",
              transform: `translate3d(${entity.x - hitPadding}px, ${entity.y - hitPadding}px, 0)`,
              width: COIN_SIZE + hitPadding * 2,
              height: COIN_SIZE + hitPadding * 2,
              cursor: "pointer",
              userSelect: "none",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 20,
              touchAction: "none",
            }}
          >
            {/* 2. CAPA DE BRILLO (Solo se renderiza si es shiny) */}
            {entity.type === "shiny" && <div className="shiny-glint" />}

            <img
              src={entity.img} // Aquí ya estás cargando la imagen shiny correcta
              alt="coin"
              style={{
                width: COIN_SIZE,
                height: COIN_SIZE,
                objectFit: "contain",
                pointerEvents: "none",
                borderRadius: "15%",
                // 3. QUITAMOS LOS FILTROS ANTIGUOS (Ya tienes tu imagen editada)
                // filter: "none", 
                // Opcional: Si quieres que resalte aún más, deja un poco de drop-shadow
                filter: entity.type === "shiny" ? "drop-shadow(0 0 5px gold)" : "none"
              }}
              draggable={false}
            />
          </div>
        );
      })}
    </div>
  );
}
