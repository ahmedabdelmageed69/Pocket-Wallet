import { FlatList, Text } from "react-native";
import { useTransactions } from "@/api/hooks";
import { EntryRow } from "@/components/EntryRow";
import { styles } from "@/components/ui";
import { useI18n } from "@/i18n";

export default function History() {
  const tx = useTransactions();
  const t = useI18n((s) => s.t);
  const items = tx.data?.pages.flatMap((p) => p.items) ?? [];
  return (
    <FlatList
      contentContainerStyle={[styles.screen, { flexGrow: 1 }]}
      data={items}
      keyExtractor={(e) => e.id}
      renderItem={({ item }) => <EntryRow entry={item} />}
      onEndReached={() => tx.hasNextPage && tx.fetchNextPage()}
      refreshing={tx.isRefetching}
      onRefresh={tx.refetch}
      ListEmptyComponent={<Text style={styles.muted}>{t.empty}</Text>}
    />
  );
}
