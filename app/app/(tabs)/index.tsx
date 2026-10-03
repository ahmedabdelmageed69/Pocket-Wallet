import { router } from "expo-router";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { money } from "@/api/client";
import { useTransactions, useWallet } from "@/api/hooks";
import { Button, colors, styles } from "@/components/ui";
import { EntryRow } from "@/components/EntryRow";
import { useAuth } from "@/store/auth";
import { useDir, useI18n } from "@/i18n";


export default function Home() {
  const { user, signOut } = useAuth();
  const { t, toggle } = useI18n();
  const dir = useDir();
  const wallet = useWallet();
  const tx = useTransactions();
  const recent = tx.data?.pages[0]?.items.slice(0, 5) ?? [];

  return (
    <ScrollView
      contentContainerStyle={styles.screen}
      refreshControl={
        <RefreshControl refreshing={wallet.isRefetching} onRefresh={() => { wallet.refetch(); tx.refetch(); }} />
      }
    >
      <View style={[dir.row, { justifyContent: "space-between" }]}>
        <Text style={styles.muted}>{t.hi} {user?.name}</Text>
        <Text onPress={toggle} style={styles.muted}>{t.language}</Text>
      </View>
      <View style={[styles.card, { backgroundColor: colors.primary }]}>
        <Text style={[{ color: "#DBE4FF" }, dir.text]}>{t.balance}</Text>
        <Text style={[{ color: "#fff", fontSize: 36, fontWeight: "700" }, dir.text]}>
          {wallet.data ? money(wallet.data.balance) : "—"}
        </Text>
      </View>
      <Button title={t.topUpCard} onPress={() => router.push("/topup")} />
      <Text style={[styles.title, { fontSize: 18 }, dir.text]}>{t.recent}</Text>
      {recent.length === 0 && <Text style={[styles.muted, dir.text]}>{t.empty}</Text>}
      {recent.map((e) => <EntryRow key={e.id} entry={e} />)}
      <Text onPress={signOut} style={[styles.muted, { textAlign: "center", marginTop: 24 }]}>{t.logout}</Text>
    </ScrollView>
  );
}
