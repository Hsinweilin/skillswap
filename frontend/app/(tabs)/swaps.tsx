import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, RefreshControl } from 'react-native';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { colors } from '../../lib/theme';

export default function Swaps() {
  const [swaps, setSwaps] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  const load = async () => {
    try { setSwaps(await api.getSwaps()); } catch {}
  };
  useEffect(() => { load(); }, []);

  const handleAction = async (id: string, action: 'accept' | 'decline' | 'complete') => {
    try {
      if (action === 'accept') await api.acceptSwap(id);
      else if (action === 'decline') await api.declineSwap(id);
      else await api.completeSwap(id);
      load();
    } catch (e: any) { Alert.alert('Error', e.message); }
  };

  const statusColor = (s: string) => s === 'completed' ? colors.success : s === 'declined' ? colors.error : s === 'accepted' ? colors.primary : colors.warning;

  return (
    <View style={s.container}>
      <FlatList
        data={swaps}
        keyExtractor={i => i.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} tintColor={colors.primary} />}
        renderItem={({ item }) => {
          const isProvider = item.providerId === user?.id;
          return (
            <View style={s.card}>
              <View style={s.row}>
                <Text style={s.title}>{item.skill?.name}</Text>
                <View style={[s.statusBadge, { backgroundColor: statusColor(item.status) + '20' }]}>
                  <Text style={[s.statusText, { color: statusColor(item.status) }]}>{item.status}</Text>
                </View>
              </View>
              <Text style={s.sub}>{isProvider ? `From: ${item.requester?.name}` : `To: ${item.provider?.name}`}</Text>
              <Text style={s.sub}>{item.hours}h · {item.creditAmount} credits</Text>
              {item.message && <Text style={s.msg}>"{item.message}"</Text>}
              {isProvider && item.status === 'pending' && (
                <View style={s.actions}>
                  <TouchableOpacity style={[s.btn, { backgroundColor: colors.success }]} onPress={() => handleAction(item.id, 'accept')}>
                    <Text style={s.btnText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[s.btn, { backgroundColor: colors.error }]} onPress={() => handleAction(item.id, 'decline')}>
                    <Text style={s.btnText}>Decline</Text>
                  </TouchableOpacity>
                </View>
              )}
              {item.status === 'accepted' && (
                <TouchableOpacity style={[s.btn, { backgroundColor: colors.primary, marginTop: 8 }]} onPress={() => handleAction(item.id, 'complete')}>
                  <Text style={s.btnText}>Mark Complete</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
        ListEmptyComponent={<Text style={s.empty}>No swap requests yet</Text>}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  title: { fontSize: 16, fontWeight: '700', color: colors.text },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 2 },
  statusText: { fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
  sub: { fontSize: 14, color: colors.textSecondary, marginBottom: 2 },
  msg: { fontSize: 13, color: colors.text, fontStyle: 'italic', marginTop: 6 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  btn: { flex: 1, borderRadius: 10, padding: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  empty: { textAlign: 'center', color: colors.textSecondary, marginTop: 40 },
});
