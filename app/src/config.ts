import Constants from "expo-constants";

const extra = (Constants.expoConfig?.extra ?? {}) as { apiUrl: string; stripePublishableKey: string };
// On an Android emulator use http://10.0.2.2:4000; on a real phone use your computer's LAN IP.
export const API_URL = extra.apiUrl;
export const STRIPE_PK = extra.stripePublishableKey;
