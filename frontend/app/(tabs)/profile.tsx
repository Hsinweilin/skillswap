import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, ScrollView } from 'react-native';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { colors } from '../../lib/theme';

export default function Profile() {
  const { user, logout, refresh } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any>({ reviews: [], averageRating: 0, badge: 'New', totalReviews: 0 });
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [newRate, setNewRate] = useState('1');

  const load = async () => {
    try {
      const p = await api.getProfile();
      setProfile(p);
      setName(p.name);
      setBio(p.bio || '');
      setSkills(p.skills || []);
      if (user?.id) setReviews(await api.getReviews(user.id));
    } catch {}
  };
  useEffect(() => { load(); }, []);

  const saveProfile = async () => {
    try {
      await api.updateProfile({ name, bio });
      setEditing(false);
      refresh();
      load();
    } catch (e: any) { Alert.alert('Error', e.message); }
  };

  const addSkill = async () => {
    if (!newSkill) return;
    try {
      await api.addSkill({ name: newSkill, creditRate: parseFloat(newRate) || 1 });
      setNewSkill('');
      setNewRate('1');
      load();
    } catch (e: any) { Alert.alert('Error', e.message); }
  };

  const deleteSkill = async (id: string) => {
    try { await api.deleteSkill(id); load(); }
    catch (e: any) { Alert.alert('Error', e.message); }
  };

  const badgeColor = (b: string) => b === 'Gold' ? colors.gold : b === 'Silver' ? colors.silver : b === 'Bronze' ? colors.bronze : colors.textSecondary;

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
      <View style={s.header}>
        <View style={s.avatar}><Text style={s.avatarText}>{profile?.name?.[0] || '?'}</Text></View>
        <View>
          <Text style={s.name}>{profile?.name}</Text>
          <Text style={s.email}>{profile?.email}</Text>
        </View>
      </View>

      <View style={s.statsRow}>
        <View style={s.stat}><Text style={s.statVal}>{profile?.creditBalance?.toFixed(1) || 0}</Text><Text style={s.statLabel}>Credits</Text></View>
        <View style={s.stat}><Text style={s.statVal}>{profile?.trustScore?.toFixed(0) || 0}</Text><Text style={s.statLabel}>Trust</Text></View>
        <View style={s.stat}><Text style={[s.statVal, { color: badgeColor(reviews.badge) }]}>{reviews.badge}</Text><Text style={s.statLabel}>Badge</Text></View>
        <View style={s.stat}><Text style={s.statVal}>{reviews.averageRating}</Text><Text style={s.statLabel}>Rating</Text></View>
      </View>

      {editing ? (
        <View style={s.section}>
          <TextInput style={s.input} value={name} onChangeText={setName} placeholder="Name" />
          <TextInput style={[s.input, { height: 80 }]} value={bio} onChangeText={setBio} placeholder="Bio" multiline />
          <TouchableOpacity style={s.btn} onPress={saveProfile}><Text style={s.btnText}>Save</Text></TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={[s.btn, { backgroundColor: colors.primaryLight }]} onPress={() => setEditing(true)}>
          <Text style={s.btnText}>Edit Profile</Text>
        </TouchableOpacity>
      )}

      <Text style={s.sectionTitle}>My Skills</Text>
      {skills.map(sk => (
        <View key={sk.id} style={s.skillRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.skillName}>{sk.name}</Text>
            <Text style={s.skillMeta}>{sk.creditRate}x rate · {sk.yearsOfExp}yr exp</Text>
          </View>
          <TouchableOpacity onPress={() => deleteSkill(sk.id)}><Text style={{ color: colors.error }}>✕</Text></TouchableOpacity>
        </View>
      ))}
      <View style={s.addRow}>
        <TextInput style={[s.input, { flex: 1 }]} value={newSkill} onChangeText={setNewSkill} placeholder="New skill" />
        <TextInput style={[s.input, { width: 60 }]} value={newRate} onChangeText={setNewRate} placeholder="Rate" keyboardType="numeric" />
        <TouchableOpacity style={[s.btn, { paddingHorizontal: 16 }]} onPress={addSkill}><Text style={s.btnText}>+</Text></TouchableOpacity>
      </View>

      {reviews.reviews.length > 0 && (
        <>
          <Text style={s.sectionTitle}>Reviews ({reviews.totalReviews})</Text>
          {reviews.reviews.slice(0, 5).map((r: any) => (
            <View key={r.id} style={s.reviewCard}>
              <Text style={s.reviewStars}>{'⭐'.repeat(r.rating)}</Text>
              <Text style={s.reviewComment}>{r.comment}</Text>
              <Text style={s.reviewAuthor}>— {r.reviewer?.name}</Text>
            </View>
          ))}
        </>
      )}

      <TouchableOpacity style={[s.btn, { backgroundColor: colors.error, marginTop: 20, marginBottom: 40 }]} onPress={logout}>
        <Text style={s.btnText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: '700' },
  name: { fontSize: 22, fontWeight: '700', color: colors.text },
  email: { fontSize: 14, color: colors.textSecondary },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  stat: { flex: 1, backgroundColor: colors.surface, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  statVal: { fontSize: 18, fontWeight: '700', color: colors.primary },
  statLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: 20, marginBottom: 10 },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, fontSize: 15, marginBottom: 8 },
  btn: { backgroundColor: colors.primary, borderRadius: 10, padding: 12, alignItems: 'center', marginBottom: 8 },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  skillRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 10, padding: 12, marginBottom: 6, borderWidth: 1, borderColor: colors.border },
  skillName: { fontSize: 15, fontWeight: '600', color: colors.text },
  skillMeta: { fontSize: 12, color: colors.textSecondary },
  addRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  reviewCard: { backgroundColor: colors.surface, borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
  reviewStars: { fontSize: 14, marginBottom: 4 },
  reviewComment: { fontSize: 14, color: colors.text },
  reviewAuthor: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
});
