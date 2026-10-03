import { useStripe } from "@stripe/stripe-react-native";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import { api } from "@/api/client";
import { Button, Field, styles } from "@/components/ui";
import { useDir, useI18n } from "@/i18n";

export default function TopUp() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const qc = useQueryClient();
  const t = useI18n((s) => s.t);
  const dir = useDir();
  const [amount, setAmount] = useState("20");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function pay() {
    setLoading(true);
    setError(null);
    try {
      const { clientSecret } = await api<{ clientSecret: string }>("/payments/topup-intent", {
        method: "POST",
        body: JSON.stringify({ amount }),
      });
      const init = await initPaymentSheet({ paymentIntentClientSecret: clientSecret, merchantDisplayName: "Pocket Wallet" });
      if (init.error) throw new Error(init.error.message);
      const result = await presentPaymentSheet();
      if (result.error) {
        if (result.error.code !== "Canceled") setError(result.error.message);
        return;
      }
      // The server credits the wallet from Stripe's webhook; refresh shortly after.
      setTimeout(() => qc.invalidateQueries(), 1500);
      router.back();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.screen, { paddingTop: 60 }]}>
      <Text style={[styles.title, dir.text]}>{t.topUp}</Text>
      <Text style={[styles.muted, dir.text]}>{t.testCard}</Text>
      <Field keyboardType="decimal-pad" value={amount} onChangeText={setAmount} />
      {error && <Text style={styles.error}>{error}</Text>}
      <Button title={`${t.pay} $${amount || "0"}`} onPress={pay} loading={loading} />
      <Text onPress={() => router.back()} style={[styles.muted, { textAlign: "center" }]}>{t.cancel}</Text>
    </View>
  );
}
