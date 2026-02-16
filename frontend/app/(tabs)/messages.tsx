import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { api } from '../../lib/api';
import { colors } from '../../lib/theme';

export default function Messages() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');

  const load = async () => {
    try { setConversations(await api.getConversations()); } catch {}
  };
  useEffect(() => { load(); }, []);

  const openChat = async (userId: string) => {
    setSelected(userId);
    try { setMessages(await api.getMessages(userId)); } catch {}
  };

  const send = async () => {
    if (!text.trim() || !selected) return;
    try {
      await api.sendMessage(selected, text);
      setText('');
      setMessages(await api.getMessages(selected));
    } catch {}
  };

  if (selected) {
    return (
      <View style={s.container}>
        <TouchableOpacity style={s.backBtn} onPress={() => setSelected(null)}>
          <Text style={s.backText}>← Conversations</Text>
        </TouchableOpacity>
        <FlatList
          data={messages}
          keyExtractor={i => i.id}
          renderItem={({ item }) => (
            <View style={[s.msgBubble, item.senderId === selected ? s.msgLeft : s.msgRight]}>
              <Text style={[s.msgText, item.senderId !== selected && { color: '#fff' }]}>{item.content}</Text>
              <Text style={[s.msgTime, item.senderId !== selected && { color: '#ffffffaa' }]}>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
          )}
          contentContainerStyle={{ padding: 16 }}
        />
        <View style={s.inputRow}>
          <View style={s.inputWrap}>
            <Text style={s.inputField} onPress={() => {}} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <FlatList
        data={conversations}
        keyExtractor={i => i.partner.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} tintColor={colors.primary} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={s.convoCard} onPress={() => openChat(item.partner.id)}>
            <View style={s.avatar}><Text style={s.avatarText}>{item.partner.name[0]}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.convoName}>{item.partner.name}</Text>
              <Text style={s.convoMsg} numberOfLines={1}>{item.lastMessage.content}</Text>
            </View>
            {item.unreadCount > 0 && (
              <View style={s.unread}><Text style={s.unreadText}>{item.unreadCount}</Text></View>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={s.empty}>No conversations yet</Text>}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  backBtn: { padding: 16, paddingBottom: 8 },
  backText: { color: colors.primary, fontWeight: '600', fontSize: 16 },
  convoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginBottom: 8, gap: 12, borderWidth: 1, borderColor: colors.border },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  convoName: { fontSize: 15, fontWeight: '700', color: colors.text },
  convoMsg: { fontSize: 13, color: colors.textSecondary },
  unread: { backgroundColor: colors.primary, borderRadius: 12, width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
  unreadText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  msgBubble: { maxWidth: '75%', borderRadius: 14, padding: 12, marginBottom: 8 },
  msgLeft: { alignSelf: 'flex-start', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  msgRight: { alignSelf: 'flex-end', backgroundColor: colors.primary },
  msgText: { fontSize: 14, color: colors.text },
  msgTime: { fontSize: 10, color: colors.textSecondary, marginTop: 4 },
  inputRow: { flexDirection: 'row', padding: 12, gap: 8, borderTopWidth: 1, borderTopColor: colors.border },
  inputWrap: { flex: 1, backgroundColor: colors.surface, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderColor: colors.border },
  inputField: { fontSize: 15 },
  empty: { textAlign: 'center', color: colors.textSecondary, marginTop: 40 },
});
