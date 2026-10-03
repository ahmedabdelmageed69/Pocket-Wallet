import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, type TextInputProps } from "react-native";

export const colors = { bg: "#F6F7FB", card: "#FFFFFF", primary: "#2F5BEA", text: "#111827", muted: "#6B7280", danger: "#DC2626", success: "#059669" };

export function Field({ style, ...props }: TextInputProps) {
  return <TextInput placeholderTextColor={colors.muted} style={[styles.input, style]} {...props} />;
}

export function Button({ title, onPress, loading, disabled }: { title: string; onPress: () => void; loading?: boolean; disabled?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={loading || disabled}
      style={({ pressed }) => [styles.button, (pressed || disabled) && { opacity: 0.7 }]}
    >
      {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{title}</Text>}
    </Pressable>
  );
}

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, padding: 20, gap: 12 },
  title: { fontSize: 26, fontWeight: "700", color: colors.text },
  muted: { color: colors.muted },
  error: { color: colors.danger },
  input: { backgroundColor: colors.card, borderRadius: 12, padding: 14, fontSize: 16, borderWidth: 1, borderColor: "#E5E7EB" },
  button: { backgroundColor: colors.primary, borderRadius: 12, padding: 16, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 20 },
});
