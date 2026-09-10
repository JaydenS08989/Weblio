import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getBrowserStorage } from "@/lib";

interface AuthState {
  isAuthenticated: boolean;
  user: { name: string; email: string } | null;
  signIn: (user?: { name: string; email: string }) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      signIn: (
        user = { name: "Alex Morgan", email: "alex@northstar.design" },
      ) => set({ isAuthenticated: true, user }),
      signOut: () => set({ isAuthenticated: false, user: null }),
    }),
    {
      name: "weblio-mock-auth",
      storage: createJSONStorage(getBrowserStorage),
    },
  ),
);
