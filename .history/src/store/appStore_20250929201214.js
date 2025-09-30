import { create } from 'zustand';

export const useAppStore = create((set, get) => ({
  // Theme state
  isDarkMode: false,
  toggleTheme: () => set((state) => {
    const newMode = !state.isDarkMode;
    document.documentElement.classList.toggle('dark', newMode);
    return { isDarkMode: newMode };
  }),

  // Dashboard data
  dashboardData: {
    activeTourists: 0,
    alertsToday: 0,
    sosCount: 0,
    tripsInProgress: 0,
  },
  setDashboardData: (data) => set({ dashboardData: data }),

  // Alerts state
  alerts: [],
  setAlerts: (alerts) => set({ alerts }),
  addAlert: (alert) => set((state) => ({
    alerts: [alert, ...state.alerts]
  })),

  // Tourists state
  tourists: [],
  setTourists: (tourists) => set({ tourists }),

  // Zones state
  zones: [],
  setZones: (zones) => set({ zones }),

  // Loading states
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),

  // Error handling
  error: null,
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Modal states
  modals: {
    alertDetail: { isOpen: false, data: null },
    touristDetail: { isOpen: false, data: null },
    createZone: { isOpen: false },
    efirDetail: { isOpen: false, data: null },
  },
  openModal: (modalType, data = null) => set((state) => ({
    modals: {
      ...state.modals,
      [modalType]: { isOpen: true, data }
    }
  })),
  closeModal: (modalType) => set((state) => ({
    modals: {
      ...state.modals,
      [modalType]: { isOpen: false, data: null }
    }
  })),

  // WebSocket connection state
  wsConnected: false,
  setWsConnected: (connected) => set({ wsConnected: connected }),
}));