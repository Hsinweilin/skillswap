import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { api } from '../../lib/api';
import { colors } from '../../lib/theme';

export default function Discovery() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const params = search ? `skill=${encodeURIComponent(search)}` : '';
      const data = await api.discover(params);
      setUsers(data);
    } catch {}
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  return (
    <View style={s.container}>
      <TextInput style={s.search} placeholder="Search skills..." value={search} onChangeText={setSearch} placeholderTextColor={colors.textSecondary} />
      <FlatList
        data={users}
        keyExtractor={i => i.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={s.cardHeader}>
              <Text style={s.name}>{item.name}</Text>
              {item.trustScore > 0 && <Text style={s.trust}>⭐ {item.trustScore}</Text>}
            </View>
            <Text style={s.bio} numberOfLines={2}>{item.bio || 'No bio yet'}</Text>
            <View style={s.skills}>
              {item.skills?.map((sk: any) => (
                <View key={sk.id} style={s.skillBadge}>
                  <Text style={s.skillText}>{sk.name} · {sk.creditRate}x · {sk.yearsOfExp}yr</Text>
                </View>
              ))}
            </View>
            {item.certificates?.length > 0 && <Text style={s.verified}>✓ {item.certificates.length} verified cert(s)</Text>}
          </View>
        )}
        ListEmptyComponent={<Text style={s.empty}>No users found</Text>}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  search: { margin: 16, marginBottom: 0, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14, fontSize: 16 },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  name: { fontSize: 18, fontWeight: '700', color: colors.text },
  trust: { fontSize: 14, color: colors.gold, fontWeight: '600' },
  bio: { fontSize: 14, color: colors.textSecondary, marginBottom: 10 },
  skills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  skillBadge: { backgroundColor: colors.primary + '15', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  skillText: { fontSize: 12, color: colors.primary, fontWeight: '600' },
  verified: { marginTop: 8, fontSize: 12, color: colors.success, fontWeight: '600' },
  empty: { textAlign: 'center', color: colors.textSecondary, marginTop: 40 },
});
