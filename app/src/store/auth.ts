import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

type User = { id: string; name: string; email: string };
type AuthState = {
  token: string | null;
  user: User | null;
  ready: boolean;
  restore: () => Promise<void>;
  signIn: (token: string, user: User) => Promise<void>;
  signOut: () => Promise<void>;
};

const KEY = "wallet.session";

export const useAuth = create<AuthState>((set) => ({
  token: null,
  user: null,
  ready: false,
  restore: async () => {
    const raw = await SecureStore.getItemAsync(KEY);
    if (raw) set({ ...JSON.parse(raw), ready: true });
    else set({ ready: true });
  },
  signIn: async (token, user) => {
    await SecureStore.setItemAsync(KEY, JSON.stringify({ token, user }));
    set({ token, user });
  },
  signOut: async () => {
    await SecureStore.deleteItemAsync(KEY);
    set({ token: null, user: null });
  },
}));
