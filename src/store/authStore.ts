import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getBrowserStorage } from "@/lib";

interface AuthState {
  isAuthenticated: boolean;
  signIn: () => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      signIn: () => set({ isAuthenticated: true }),
      signOut: () => set({ isAuthenticated: false }),
    }),
    {
      name: "weblio-mock-auth",
      storage: createJSONStorage(getBrowserStorage),
    },
  ),
);
