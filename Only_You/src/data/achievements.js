import React from "react";
import {
  FiAward,
  FiZap,
  FiTarget,
  FiTrendingUp,
  FiDollarSign,
  FiCpu,
  FiSun,
  FiCrosshair,
  FiShoppingBag,
} from "react-icons/fi";
import { FaGem, FaTrophy } from "react-icons/fa";

// Usamos React.createElement para evitar sintaxis JSX en archivo .js
const icon = (component) => React.createElement(component);

export const ACHIEVEMENTS_DATA = {
  baby_steps: {
    title: "El Primer Paso",
    desc: "Recoge tu primera moneda, pobre.",
    icon: icon(FiAward),
  },
  on_fire: {
    title: "Dedos de Fuego",
    desc: "Alcanza un combo x5.",
    icon: icon(FiZap),
  },
  god_mode: {
    title: "Modo Dios",
    desc: "Mantén un combo x10.",
    icon: icon(FiTarget),
  },
  shiny_lover: {
    title: "Shiny Spotter",
    desc: "Atrapa una moneda especial.",
    icon: icon(FiSun),
  },
  sniper: {
    title: "Francotirador",
    desc: "Caza una moneda a máxima velocidad (>15).",
    icon: icon(FiCrosshair),
  },
  piggy_bank: {
    title: "Algo es algo",
    desc: "Acumula 500 monedas. Para un kebab da.",
    icon: icon(FiDollarSign),
  },
  stonks: {
    title: "Lobo de Wall Street",
    desc: "Consigue 1000 monedas.",
    icon: icon(FiTrendingUp),
  },
  crypto_king: {
    title: "Cripto Magnate",
    desc: "Llega a 5000 monedas.",
    icon: icon(FaGem),
  },
  collector: {
    title: "Coleccionista",
    desc: "Compra todos los objetos de la tienda.",
    icon: icon(FiShoppingBag),
  },
  matrix_master: {
    title: "El Elegido",
    desc: "Descubre el código secreto de administrador.",
    icon: icon(FiCpu),
  },
  prestige: {
    title: "Prestigio",
    desc: "Consigue todos los logros.",
    icon: icon(FaTrophy),
  },
};
