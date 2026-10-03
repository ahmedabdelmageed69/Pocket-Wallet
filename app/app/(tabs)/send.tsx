import * as LocalAuthentication from "expo-local-authentication";
import { useRef, useState } from "react";
import { Text, View } from "react-native";
import { useTransfer } from "@/api/hooks";
import { Button, Field, styles } from "@/components/ui";
import { useDir, useI18n } from "@/i18n";

const newKey = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export default function Send() {
  const [toEmail, setToEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [done, setDone] = useState<string | null>(null);
  // One idempotency key per send attempt: a network retry can't send twice.
  const key = useRef(newKey());
  const transfer = useTransfer();
  const t = useI18n((s) => s.t);
  const dir = useDir();

  async function submit() {
    setDone(null);
    const auth = await LocalAuthentication.authenticateAsync({ promptMessage: t.confirmTransfer });
    if (!auth.success) return;
    transfer.mutate(
      { toEmail, amount, key: key.current },
      {
        onSuccess: () => {
          setDone(`${t.sent} $${amount} ${t.to} ${toEmail}`);
          setAmount("");
          key.current = newKey();
        },
      }
    );
  }

  return (
    <View style={styles.screen}>
      <Field placeholder={t.recipient} style={dir.text} autoCapitalize="none" keyboardType="email-address" value={toEmail} onChangeText={setToEmail} />
      <Field placeholder={t.amount} style={dir.text} keyboardType="decimal-pad" value={amount} onChangeText={setAmount} />
      {transfer.error && <Text style={styles.error}>{transfer.error.message}</Text>}
      {done && <Text style={{ color: "#059669" }}>{done}</Text>}
      <Button title={t.sendMoney} onPress={submit} loading={transfer.isPending} disabled={!toEmail || !amount} />
    </View>
  );
}
