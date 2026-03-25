import { create } from 'zustand'

export const useRouteStore = create((set) => ({
  origin: "",
  destination: "",
  departureTime: "",
  isSubmitting: false,
  segments: [],

  setIsSubmitting: (send) => set({ isSubmitting: send }),
  setOrigin: (origin) => set({ origin }),
  setDestination: (destination) => set({ destination }),
  setDepartureTime: (time) => set({ departureTime: time }),
  setSegments: (segments) => set({ segments }),

  reset: () =>
    set({
      origin: "",
      destination: "",
      departureTime: "",
      isSubmitting: false,
      segments: [],
    }),
}))

