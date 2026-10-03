import { Tabs } from "expo-router";
import { useI18n } from "@/i18n";

export default function TabsLayout() {
  const t = useI18n((s) => s.t);
  return (
    <Tabs screenOptions={{ headerTitleAlign: "center" }}>
      <Tabs.Screen name="index" options={{ title: t.wallet }} />
      <Tabs.Screen name="send" options={{ title: t.send }} />
      <Tabs.Screen name="history" options={{ title: t.history }} />
    </Tabs>
  );
}
