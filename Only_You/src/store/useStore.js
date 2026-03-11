import { create } from "zustand";

export const useGameStore = create((set) => ({
  // --- ESTADO INICIAL ---
  isUnlocked: false,
  unlockApp: () => set({ isUnlocked: true }),
  lockGame: () => set({ isUnlocked: false }),

  // --- LÓGICA DE TIENDA Y NAVEGACIÓN ---
  activeShop: null, // 'backgrounds' | 'cursors' | 'trails'
  openShop: (shopType) => set({ activeShop: shopType }),
  closeShop: () => set({ activeShop: null }),

  isGameActive: false,
  toggleGame: () => set((state) => ({ isGameActive: !state.isGameActive })),

  coins: 0,
  addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),

  // Volumen del juego (0.0 a 1.0)
  gameVolume: 0.4,
  setGameVolume: (vol) => set({ gameVolume: vol }),

  // Skin actual de las monedas (por defecto 'dase')
  activeCoinSkin: "dase",
  setCoinSkin: (skin) => set({ activeCoinSkin: skin }),

  // --- INVENTARIO Y COMPRAS ---
  ownedItems: ["gradient", "default", "none", "dase"], // Items que el usuario ya tiene
  buyItem: (item) =>
    set((state) => {
      if (state.ownedItems.includes(item.id)) return state; // Ya lo tienes
      if (state.coins >= item.price) {
        return {
          coins: state.coins - item.price,
          ownedItems: [...state.ownedItems, item.id]
        };
      }
      return state; // No hay suficientes monedas
    }),

  // --- LOGROS Y NOTIFICACIONES ---
  achievements: [], // Array de IDs de logros desbloqueados
  notification: null, // { type: 'achievement', id: 'rico' }

  unlockAchievement: (id) =>
    set((state) => {
      if (state.achievements.includes(id)) return state; // Ya desbloqueado
      return {
        achievements: [...state.achievements, id],
        notification: { type: "achievement", id }
      };
    }),

  clearNotification: () => set({ notification: null }),

  // --- RESETEAR PROGRESO (Opción de Ajustes) ---
  resetProgress: () =>
    set({
      coins: 0,
      ownedItems: ["gradient", "default", "none", "dase"],
      activeBackground: "gradient",
      activeCursor: "default",
      activeTrail: "none",
      activeCoinSkin: "dase",
      achievements: [],
      isGameActive: false
    }),

  // --- INVENTARIO EQUIPADO ---

  // 1. FONDOS
  activeBackground: "gradient",
  setBackground: (id) => set({ activeBackground: id }),

  // 2. CURSORES (Nuevo)
  activeCursor: "default",
  setCursor: (id) => set({ activeCursor: id }),

  // 3. RASTROS (Nuevo)
  activeTrail: "none",
  setTrail: (id) => set({ activeTrail: id })
}));
