import { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { api } from '../../lib/api';
import { colors } from '../../lib/theme';

export default function Credits() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const b = await api.getBalance();
      setBalance(b.creditBalance);
      setTransactions(await api.getTransactions());
    } catch {}
  };
  useEffect(() => { load(); }, []);

  const typeIcon = (t: string) => t === 'earned' ? '💚' : t === 'escrow' ? '🔒' : t === 'refund' ? '↩️' : t === 'bonus' ? '🎁' : '💸';

  return (
    <View style={s.container}>
      <View style={s.balanceCard}>
        <Text style={s.balanceLabel}>Available Credits</Text>
        <Text style={s.balanceValue}>{balance.toFixed(1)}</Text>
        <Text style={s.balanceSub}>1 credit = 1 hour of work</Text>
      </View>
      <Text style={s.sectionTitle}>Transaction History</Text>
      <FlatList
        data={transactions}
        keyExtractor={i => i.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} tintColor={colors.primary} />}
        renderItem={({ item }) => (
          <View style={s.txCard}>
            <Text style={s.txIcon}>{typeIcon(item.type)}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.txDesc}>{item.description || item.type}</Text>
              <Text style={s.txDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
            <Text style={[s.txAmount, { color: item.amount > 0 ? colors.success : colors.error }]}>
              {item.amount > 0 ? '+' : ''}{item.amount.toFixed(1)}
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text style={s.empty}>No transactions yet</Text>}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  balanceCard: { margin: 16, backgroundColor: colors.primary, borderRadius: 20, padding: 28, alignItems: 'center' },
  balanceLabel: { color: '#ffffffcc', fontSize: 14, fontWeight: '600' },
  balanceValue: { color: '#fff', fontSize: 48, fontWeight: '800', marginVertical: 4 },
  balanceSub: { color: '#ffffff99', fontSize: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginHorizontal: 16, marginBottom: 8 },
  txCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 12, padding: 14, marginBottom: 8, gap: 12, borderWidth: 1, borderColor: colors.border },
  txIcon: { fontSize: 20 },
  txDesc: { fontSize: 14, fontWeight: '600', color: colors.text },
  txDate: { fontSize: 12, color: colors.textSecondary },
  txAmount: { fontSize: 16, fontWeight: '700' },
  empty: { textAlign: 'center', color: colors.textSecondary, marginTop: 20 },
});
