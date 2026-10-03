import { StripeProvider } from "@stripe/stripe-react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Redirect, Stack, useSegments } from "expo-router";
import { useEffect } from "react";
import { useLiveWallet } from "@/api/live";
import { STRIPE_PK } from "@/config";
import { useAuth } from "@/store/auth";

const queryClient = new QueryClient();

function Gate() {
  const { token, ready, restore } = useAuth();
  const segments = useSegments();
  useLiveWallet();
  useEffect(() => {
    restore();
  }, [restore]);
  if (!ready) return null;
  const inAuth = segments[0] === "(auth)";
  if (!token && !inAuth) return <Redirect href="/login" />;
  if (token && inAuth) return <Redirect href="/" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <StripeProvider publishableKey={STRIPE_PK} merchantIdentifier="merchant.dev.megoo.wallet">
      <QueryClientProvider client={queryClient}>
        <Gate />
      </QueryClientProvider>
    </StripeProvider>
  );
}
