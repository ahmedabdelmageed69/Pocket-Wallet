import { Text, View } from "react-native";
import { money, type Entry } from "../api/client";
import { useDir, useI18n } from "../i18n";
import { colors, styles } from "./ui";


export function EntryRow({ entry }: { entry: Entry }) {
  const incoming = entry.type !== "TRANSFER_OUT";
  const t = useI18n((s) => s.t);
  const dir = useDir();
  return (
    <View style={[styles.card, dir.row, { justifyContent: "space-between", padding: 14 }]}>
      <View style={{ flexShrink: 1 }}>
        <Text style={[{ fontWeight: "600" }, dir.text]}>
          {t[entry.type]} {entry.counterparty ?? ""}
        </Text>
        <Text style={[styles.muted, dir.text]}>{new Date(entry.createdAt).toLocaleString(dir.isRTL ? "ar-EG" : "en-US")}</Text>
      </View>
      <Text style={{ fontWeight: "700", color: incoming ? colors.success : colors.text }}>
        {incoming ? "+" : "−"}
        {money(entry.amount)}
      </Text>
    </View>
  );
}
