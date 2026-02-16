import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = __DEV__ ? 'http://localhost:3001/api' : 'http://localhost:3001/api';

async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem('token');
}

export async function setToken(token: string) {
  await AsyncStorage.setItem('token', token);
}

export async function clearToken() {
  await AsyncStorage.removeItem('token');
}

async function request(path: string, options: RequestInit = {}) {
  const token = await getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // Auth
  register: (data: { email: string; password: string; name: string }) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  // Profile
  getProfile: () => request('/profile/me'),
  updateProfile: (data: any) => request('/profile/me', { method: 'PUT', body: JSON.stringify(data) }),
  getUserProfile: (id: string) => request(`/profile/${id}`),

  // Skills
  getSkills: () => request('/skills'),
  addSkill: (data: any) => request('/skills', { method: 'POST', body: JSON.stringify(data) }),
  updateSkill: (id: string, data: any) => request(`/skills/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSkill: (id: string) => request(`/skills/${id}`, { method: 'DELETE' }),

  // Discovery
  discover: (params?: string) => request(`/discovery${params ? `?${params}` : ''}`),

  // Swaps
  getSwaps: () => request('/swaps'),
  createSwap: (data: any) => request('/swaps', { method: 'POST', body: JSON.stringify(data) }),
  acceptSwap: (id: string) => request(`/swaps/${id}/accept`, { method: 'PATCH' }),
  declineSwap: (id: string) => request(`/swaps/${id}/decline`, { method: 'PATCH' }),
  completeSwap: (id: string) => request(`/swaps/${id}/complete`, { method: 'PATCH' }),

  // Credits
  getBalance: () => request('/credits/balance'),
  getTransactions: () => request('/credits/transactions'),

  // Messages
  getConversations: () => request('/messages/conversations'),
  getMessages: (userId: string) => request(`/messages/${userId}`),
  sendMessage: (userId: string, content: string) =>
    request(`/messages/${userId}`, { method: 'POST', body: JSON.stringify({ content }) }),

  // Reviews
  getReviews: (userId: string) => request(`/reviews/${userId}`),
  createReview: (data: any) => request('/reviews', { method: 'POST', body: JSON.stringify(data) }),

  // Health
  health: () => request('/health'),
};
