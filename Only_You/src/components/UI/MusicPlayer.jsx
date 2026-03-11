import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlay,
  FiPause,
  FiSkipForward,
  FiVolume2,
  FiVolumeX,
  FiList,
  FiShuffle,
} from "react-icons/fi";
import "../../styles/MusicPlayer.scss";

// --- CARGA DE CANCIONES ---
// Intentamos cargar dinámicamente todas las canciones de la carpeta assets/songs
const songModules = import.meta.glob("../../assets/songs/*.{mp3,wav}", {
  eager: true,
});

// Transformamos los módulos en una lista de reproducción
const INITIAL_PLAYLIST = Object.keys(songModules).map((path) => {
  const fileName = path.split("/").pop().split(".")[0];
  // Formateamos el nombre: "nombre-cancion" -> "Nombre Cancion"
  const title = fileName
    .replace(/-/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  return {
    title: title,
    artist: "Only U Playlist", // Puedes personalizar esto si tienes metadatos
    src: songModules[path].default,
  };
});

// Si no hay canciones, añadimos una de ejemplo (placeholder)
if (INITIAL_PLAYLIST.length === 0) {
  INITIAL_PLAYLIST.push({
    title: "No Songs Found",
    artist: "Add mp3 to assets/songs",
    src: "", // Sin fuente
  });
}

// Límite global de seguridad (0.0 a 1.0). El 100% del slider equivaldrá a este valor real.
const MAX_VOLUME_LIMIT = 0.1;

// Función de mezclado (Fisher-Yates)
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const MusicPlayer = ({ visible, onClose }) => {
  const audioRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  // Inicializamos la playlist mezclada por defecto
  const [playlist, setPlaylist] = useState(() => shuffleArray(INITIAL_PLAYLIST));
  const [isShuffle, setIsShuffle] = useState(true);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [volume, setVolume] = useState(0.3); // Volumen inicial MUY bajo (5%)
  const [isMuted, setIsMuted] = useState(false);

  // Nuevos estados para la UI compacta
  const [showVolume, setShowVolume] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const currentTrack = playlist[currentTrackIndex] || playlist[0];

  // Manejo del volumen global
  useEffect(() => {
    if (audioRef.current) {
      // Usamos Math.pow(volume, 2) para una curva logarítmica/exponencial.
      // Esto hace que el volumen bajo sea mucho más preciso y no "grite" al 15%.
      // APLICAMOS EL LÍMITE GLOBAL AQUÍ:
      audioRef.current.volume = isMuted
        ? 0
        : Math.pow(volume, 2) * MAX_VOLUME_LIMIT;
    }
  }, [volume, isMuted]);

  // Auto-play al cambiar de canción si ya estaba sonando
  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch((e) => console.log("Autoplay blocked", e));
    }
  }, [currentTrackIndex]);

  // --- NUEVO: Resetear estados internos al cerrar ---
  useEffect(() => {
    if (!visible) {
      setShowVolume(false);
      setShowPlaylist(false);
    }
  }, [visible]);

  // --- NUEVO: Detectar clic fuera para cerrar ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!visible) return;

      // 1. Si el clic es dentro del reproductor (o sus popups), no hacemos nada
      if (containerRef.current && containerRef.current.contains(event.target))
        return;

      // 2. Si el clic es en el Dock (para evitar conflicto con el botón de abrir), ignoramos
      if (event.target.closest(".dock-outer")) return;

      // 3. Cerramos el reproductor
      if (onClose) onClose();
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [visible, onClose]);

  // Actualizar barra de progreso
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  // Adelantar / Retroceder (Seek)
  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
  };

  const toggleShuffle = () => {
    const currentSong = playlist[currentTrackIndex];
    if (isShuffle) {
      // Desactivar shuffle: Restaurar orden original
      const originalIndex = INITIAL_PLAYLIST.findIndex((t) => t.src === currentSong.src);
      setPlaylist([...INITIAL_PLAYLIST]);
      setCurrentTrackIndex(originalIndex !== -1 ? originalIndex : 0);
      setIsShuffle(false);
    } else {
      // Activar shuffle: Mezclar
      const shuffled = shuffleArray(INITIAL_PLAYLIST);
      const newIndex = shuffled.findIndex((t) => t.src === currentSong.src);
      setPlaylist(shuffled);
      setCurrentTrackIndex(newIndex !== -1 ? newIndex : 0);
      setIsShuffle(true);
    }
  };

  const playTrack = (index) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
    setShowPlaylist(false);
  };

  // Formateo de tiempo (mm:ss)
  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <motion.div
      ref={containerRef}
      className="music-player-container"
      initial="hidden"
      animate={visible ? "visible" : "hidden"}
      variants={{
        visible: { opacity: 1, y: 0, scale: 1, pointerEvents: "auto" },
        hidden: { opacity: 0, y: 50, scale: 0.95, pointerEvents: "none" },
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}>
      {/* ELEMENTO DE AUDIO OCULTO */}
      <audio
        ref={audioRef}
        src={currentTrack.src}
        onEnded={nextTrack}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        preload="auto"
      />

      {/* 0. PLAYLIST POPUP (Flotante) */}
      <AnimatePresence>
        {showPlaylist && (
          <motion.div
            className="playlist-popup"
            initial={{ opacity: 0, y: 10, scale: 0.95, x: "-50%" }}
            animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
            exit={{ opacity: 0, y: 10, scale: 0.95, x: "-50%" }}
            transition={{ duration: 0.2 }}>
            {playlist.map((track, index) => (
              <div
                key={index}
                className={`playlist-item ${index === currentTrackIndex ? "active" : ""}`}
                onClick={() => playTrack(index)}>
                {index + 1}. {track.title}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. INFORMACIÓN (Nombre con Toggle Playlist) */}
      <div
        className="compact-info"
        onClick={() => setShowPlaylist(!showPlaylist)}>
        <div
          className="song-title-wrapper"
          style={{ display: "flex", alignItems: "center" }}>
          <span className="song-title">{currentTrack.title}</span>
          <FiList
            size={14}
            style={{ minWidth: 14, marginLeft: 8, opacity: 0.6 }}
          />
        </div>
      </div>

      {/* 2. CONTROLES Y BARRA DE PROGRESO */}
      <div className="compact-controls-row">
        {/* Botón Shuffle */}
        <button 
          className={`icon-btn ${isShuffle ? "active" : ""}`} 
          onClick={toggleShuffle}
          style={{ marginRight: "5px", color: isShuffle ? "#f700ff" : "inherit" }}>
          <FiShuffle size={16} />
        </button>

        {/* Botón Play/Pause */}
        <button className="mini-play-btn" onClick={togglePlay}>
          {isPlaying ? (
            <FiPause size={16} />
          ) : (
            <FiPlay size={16} style={{ marginLeft: "2px" }} />
          )}
        </button>

        {/* Barra de Progreso (Seek Bar) */}
        <div className="seek-bar-container">
          <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={handleSeek}
            className="seek-slider"
          />
          <div className="time-display">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {/* Botón Siguiente */}
        <button className="icon-btn" onClick={nextTrack}>
          <FiSkipForward size={18} />
        </button>

        {/* Botón Volumen (Desplegable) */}
        <div className="volume-wrapper">
          <button
            className={`icon-btn ${showVolume ? "active" : ""}`}
            onClick={() => setShowVolume(!showVolume)}>
            {isMuted || volume === 0 ? (
              <FiVolumeX size={18} />
            ) : (
              <FiVolume2 size={18} />
            )}
          </button>

          <AnimatePresence>
            {showVolume && (
              <motion.div
                className="volume-popup"
                initial={{ opacity: 0, scale: 0.8, x: 10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }} // x:0 porque está centrado en CSS
                exit={{ opacity: 0, scale: 0.8, x: 0 }}>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default MusicPlayer;
