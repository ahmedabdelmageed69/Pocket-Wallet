import { Link } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import { api } from "@/api/client";
import { Button, Field, styles } from "@/components/ui";
import { useAuth } from "@/store/auth";
import { useDir, useI18n } from "@/i18n";


export default function Register() {
  const signIn = useAuth((s) => s.signIn);
  const { t } = useI18n();
  const dir = useDir();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const res = await api<{ token: string; user: any }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(form),
      });
      await signIn(res.token, res.user);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.screen, { justifyContent: "center" }]}>
      <Text style={[styles.title, dir.text]}>{t.createAccount}</Text>
      <Field placeholder={t.fullName} style={dir.text} value={form.name} onChangeText={set("name")} />
      <Field placeholder={t.email} style={dir.text} autoCapitalize="none" keyboardType="email-address" value={form.email} onChangeText={set("email")} />
      <Field placeholder={t.passwordHint} style={dir.text} secureTextEntry value={form.password} onChangeText={set("password")} />
      {error && <Text style={styles.error}>{error}</Text>}
      <Button title={t.signup} onPress={submit} loading={loading} />
      <Link href="/login" style={[styles.muted, dir.text]}>{t.haveAccount}</Link>
    </View>
  );
}
