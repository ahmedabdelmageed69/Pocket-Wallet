import { Link } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import { api } from "@/api/client";
import { Button, Field, styles } from "@/components/ui";
import { useAuth } from "@/store/auth";
import { useDir, useI18n } from "@/i18n";


export default function Login() {
  const signIn = useAuth((s) => s.signIn);
  const { t, toggle } = useI18n();
  const dir = useDir();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const res = await api<{ token: string; user: any }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
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
      <Text onPress={toggle} style={[styles.muted, { alignSelf: "flex-end" }]}>{t.language}</Text>
      <Text style={[styles.title, dir.text]}>{t.appName}</Text>
      <Text style={[styles.muted, dir.text]}>{t.loginSubtitle}</Text>
      <Field placeholder={t.email} style={dir.text} autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <Field placeholder={t.password} style={dir.text} secureTextEntry value={password} onChangeText={setPassword} />
      {error && <Text style={styles.error}>{error}</Text>}
      <Button title={t.login} onPress={submit} loading={loading} />
      <Link href="/register" style={[styles.muted, dir.text]}>{t.noAccount}</Link>
    </View>
  );
}
