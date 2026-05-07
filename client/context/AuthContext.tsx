import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import Dexie from 'dexie';

const db = new Dexie('xenahub_auth') as any;
db.version(1).stores({
  users: 'id',
  sessions: 'id',
  avatars: 'userId',
  covers: 'userId',
});

export type UserRole = 'admin' | 'moderator' | 'yetkili' | 'user';

export interface AppUser {
  id: string;
  username: string;
  displayName?: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: number;
  banned?: boolean;
  banUntil?: number;
  speakPermission?: boolean;
  avatarUrl?: string;
  coverUrl?: string;
  gender?: string;
  birthDate?: string;
  avatarFrameId?: string;
  appId?: string;
  appIdStatus?: 'pending' | 'approved' | 'rejected';
  verified?: boolean;
}

export const FRAME_PRESETS: { id: string; label: string; color: string }[] = [
  { id: 'none', label: 'Yok', color: 'transparent' },
  { id: 'purple', label: 'Mor', color: '#9147ff' },
  { id: 'gold', label: 'Altın', color: '#FFD700' },
  { id: 'blue', label: 'Mavi', color: '#40a9ff' },
  { id: 'red', label: 'Ateş', color: '#ff4444' },
  { id: 'green', label: 'Yeşil', color: '#5cff7f' },
  { id: 'pink', label: 'Pembe', color: '#ff6b9d' },
  { id: 'white', label: 'Beyaz', color: '#ffffff' },
];

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  moderator: 'Moderatör',
  yetkili: 'Yetkili',
  user: 'Kullanıcı',
};

export const ROLE_COLORS: Record<UserRole, string> = {
  admin: '#ff4444',
  moderator: '#FFD700',
  yetkili: '#9147ff',
  user: '#adadb8',
};

export const ROLE_ORDER: Record<UserRole, number> = {
  admin: 0,
  moderator: 1,
  yetkili: 2,
  user: 3,
};

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

function isUserBanned(user: AppUser): boolean {
  if (!user.banned) return false;
  if (user.banUntil === -1 || user.banUntil === undefined) return true;
  if (user.banUntil && user.banUntil > Date.now()) return true;
  return false;
}

interface AuthContextValue {
  currentUser: AppUser | null;
  allUsers: AppUser[];
  isLoading: boolean;
  register: (u: string, e: string, p: string) => Promise<{ success: boolean; error?: string }>;
  login: (ue: string, p: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  setUserRole: (userId: string, role: UserRole) => Promise<void>;
  banUser: (userId: string, durationMs?: number) => Promise<void>;
  unbanUser: (userId: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  grantSpeakPermission: (userId: string) => Promise<void>;
  revokeSpeakPermission: (userId: string) => Promise<void>;
  updateAvatar: (userId: string, avatarUrl: string) => Promise<void>;
  removeAvatar: (userId: string) => Promise<void>;
  updateCover: (userId: string, coverUrl: string) => Promise<void>;
  removeCover: (userId: string) => Promise<void>;
  updateProfile: (userId: string, data: { username?: string; password?: string; gender?: string; displayName?: string; birthDate?: string }) => Promise<{ success: boolean; error?: string }>;
  updateAvatarFrame: (userId: string, frameId: string) => Promise<void>;
  submitAppId: (userId: string, appId: string) => Promise<{ success: boolean; error?: string }>;
  approveAppId: (userId: string) => Promise<void>;
  rejectAppId: (userId: string) => Promise<void>;
  isLoggedIn: boolean;
  canWrite: boolean;
  isBanned: boolean;
  isMod: boolean;
  isAdmin: boolean;
  refreshUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const SEED_ADMIN: AppUser = {
  id: 'seed_admin_001',
  username: 'yamann01',
  email: 'erhanyaman001@gmail.com',
  passwordHash: simpleHash('yamann01'),
  role: 'admin',
  createdAt: 0,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { loadSession(); }, []);

  const getUsers = async (): Promise<AppUser[]> => {
    try {
      const storedUsers = await db.users.toArray();
      const avatars: Record<string, string> = {};
      const covers: Record<string, string> = {};
      const avatarRows = await db.avatars.toArray();
      const coverRows = await db.covers.toArray();
      for (const a of avatarRows) avatars[a.userId] = a.data;
      for (const c of coverRows) covers[c.userId] = c.data;

      let base = storedUsers.length > 0 ? storedUsers : [];
      base = base.filter((u: AppUser) => u.id !== 'seed_mod_001');

      const adminIdx = base.findIndex((u: AppUser) => u.id === SEED_ADMIN.id);
      if (adminIdx === -1) {
        base = [{ ...SEED_ADMIN, hiddenAvatarUrl: undefined, hiddenCoverUrl: undefined }, ...base];
      } else if (base[adminIdx].username !== SEED_ADMIN.username) {
        base = base.map((u: AppUser, i: number) => i === adminIdx ? { ...u, ...SEED_ADMIN } : u);
      }
      if (adminIdx === -1 || base[adminIdx].username !== SEED_ADMIN.username) {
        await db.users.bulkPut(base);
      }

      return base.map((u: AppUser) => ({
        ...u,
        avatarUrl: avatars[u.id] || u.avatarUrl,
        coverUrl: covers[u.id] || u.coverUrl,
      }));
    } catch {
      return [];
    }
  };

  const saveUsers = async (users: AppUser[]) => {
    try {
      const forStorage = users.map(({ avatarUrl: _a, coverUrl: _c, ...u }: any) => u);
      await db.users.clear();
      await db.users.bulkPut(forStorage);
      setAllUsers(users);
    } catch { /* ignore */ }
  };

  const loadSession = async () => {
    try {
      const users = await getUsers();
      setAllUsers(users);
      const session = localStorage.getItem('auth_session_id_v2');
      if (session) {
        const user = users.find((u: AppUser) => u.id === session);
        if (user) setCurrentUser(user);
      }
    } catch { /* ignore */ }
    finally { setIsLoading(false); }
  };

  const refreshUsers = useCallback(async () => {
    const users = await getUsers();
    setAllUsers(users);
    if (currentUser) {
      const updated = users.find((u: AppUser) => u.id === currentUser.id);
      if (updated) setCurrentUser(updated);
    }
  }, [currentUser]);

  const register = useCallback(async (username: string, email: string, password: string) => {
    if (!username.trim() || !email.trim() || !password.trim()) return { success: false, error: 'Tüm alanları doldurun' };
    if (username.trim().length < 3) return { success: false, error: 'Kullanıcı adı en az 3 karakter olmalı' };
    if (password.length < 6) return { success: false, error: 'Şifre en az 6 karakter olmalı' };
    const users = await getUsers();
    const exists = users.find((u: AppUser) => u.username.toLowerCase() === username.trim().toLowerCase() || u.email.toLowerCase() === email.trim().toLowerCase());
    if (exists) return { success: false, error: 'Kullanıcı adı veya e-posta zaten kullanımda' };
    const newUser: AppUser = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      username: username.trim(), email: email.trim().toLowerCase(),
      passwordHash: simpleHash(password), role: 'user', createdAt: Date.now(),
    };
    await saveUsers([...users, newUser]);
    setCurrentUser(newUser);
    localStorage.setItem('auth_session_id_v2', newUser.id);
    return { success: true };
  }, []);

  const login = useCallback(async (usernameOrEmail: string, password: string) => {
    if (!usernameOrEmail.trim() || !password.trim()) return { success: false, error: 'Tüm alanları doldurun' };
    const users = await getUsers();
    const user = users.find((u: AppUser) => u.username.toLowerCase() === usernameOrEmail.trim().toLowerCase() || u.email.toLowerCase() === usernameOrEmail.trim().toLowerCase());
    if (!user) return { success: false, error: 'Kullanıcı bulunamadı' };
    if (user.passwordHash !== simpleHash(password)) return { success: false, error: 'Şifre yanlış' };
    if (isUserBanned(user)) return { success: false, error: user.banUntil && user.banUntil > 0 ? `Hesabınız ${new Date(user.banUntil).toLocaleDateString('tr-TR')} tarihine kadar banlandı.` : 'Hesabınız kalıcı olarak banlanmıştır.' };
    setCurrentUser(user);
    localStorage.setItem('auth_session_id_v2', user.id);
    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem('auth_session_id_v2');
    setCurrentUser(null);
  }, []);

  const setUserRole = useCallback(async (userId: string, role: UserRole) => {
    const users = await getUsers();
    const updated = users.map((u: AppUser) => (u.id === userId ? { ...u, role } : u));
    await saveUsers(updated);
    if (currentUser?.id === userId) setCurrentUser((c: any) => (c ? { ...c, role } : c));
  }, [currentUser]);

  const banUser = useCallback(async (userId: string, durationMs?: number) => {
    const users = await getUsers();
    const banUntil = durationMs === -1 || durationMs === undefined ? -1 : Date.now() + (durationMs ?? -1);
    const updated = users.map((u: AppUser) => u.id === userId ? { ...u, banned: true, banUntil } : u);
    await saveUsers(updated);
  }, []);

  const unbanUser = useCallback(async (userId: string) => {
    const users = await getUsers();
    const updated = users.map((u: AppUser) => u.id === userId ? { ...u, banned: false } as any : u);
    await saveUsers(updated);
  }, []);

  const deleteUser = useCallback(async (userId: string) => {
    const users = await getUsers();
    const updated = users.filter((u: AppUser) => u.id !== userId);
    await saveUsers(updated);
    await db.avatars.delete(userId);
    await db.covers.delete(userId);
    if (currentUser?.id === userId) { localStorage.removeItem('auth_session_id_v2'); setCurrentUser(null); }
  }, [currentUser]);

  const grantSpeakPermission = useCallback(async (userId: string) => {
    const users = await getUsers();
    const updated = users.map((u: AppUser) => u.id === userId ? { ...u, speakPermission: true } : u);
    await saveUsers(updated);
  }, []);

  const revokeSpeakPermission = useCallback(async (userId: string) => {
    const users = await getUsers();
    const updated = users.map((u: AppUser) => u.id === userId ? { ...u, speakPermission: false } : u);
    await saveUsers(updated);
  }, []);

  const updateAvatar = useCallback(async (userId: string, avatarUrl: string) => {
    await db.avatars.put({ userId, data: avatarUrl });
    const users = await getUsers();
    setAllUsers(users.map((u: AppUser) => u.id === userId ? { ...u, avatarUrl } : u));
    if (currentUser?.id === userId) setCurrentUser((c: any) => c ? { ...c, avatarUrl } : c);
  }, [currentUser]);

  const removeAvatar = useCallback(async (userId: string) => {
    await db.avatars.delete(userId);
    const users = await getUsers();
    setAllUsers(users.map((u: AppUser) => ({ ...u, avatarUrl: u.id === userId ? undefined : u.avatarUrl })));
    if (currentUser?.id === userId) setCurrentUser((c: any) => c ? { ...c, avatarUrl: undefined } : c);
  }, [currentUser]);

  const updateCover = useCallback(async (userId: string, coverUrl: string) => {
    await db.covers.put({ userId, data: coverUrl });
    const users = await getUsers();
    setAllUsers(users.map((u: AppUser) => u.id === userId ? { ...u, coverUrl } : u));
    if (currentUser?.id === userId) setCurrentUser((c: any) => c ? { ...c, coverUrl } : c);
  }, [currentUser]);

  const removeCover = useCallback(async (userId: string) => {
    await db.covers.delete(userId);
    const users = await getUsers();
    setAllUsers(users.map((u: AppUser) => ({ ...u, coverUrl: u.id === userId ? undefined : u.coverUrl })));
    if (currentUser?.id === userId) setCurrentUser((c: any) => c ? { ...c, coverUrl: undefined } : c);
  }, [currentUser]);

  const updateAvatarFrame = useCallback(async (userId: string, frameId: string) => {
    const users = await getUsers();
    const updated = users.map((u: AppUser) => u.id === userId ? { ...u, avatarFrameId: frameId } : u);
    await saveUsers(updated);
    if (currentUser?.id === userId) setCurrentUser((c: any) => c ? { ...c, avatarFrameId: frameId } : c);
  }, [currentUser]);

  const updateProfile = useCallback(async (userId: string, data: { username?: string; password?: string; gender?: string; displayName?: string; birthDate?: string }) => {
    const users = await getUsers();
    const idx = users.findIndex((u: AppUser) => u.id === userId);
    if (idx === -1) return { success: false, error: 'Kullanıcı bulunamadı' };
    let updated = [...users];
    if (data.username !== undefined) {
      const trimmed = data.username.trim();
      if (trimmed.length < 3) return { success: false, error: 'Kullanıcı adı en az 3 karakter olmalı' };
      const exists = updated.find((u: AppUser) => u.id !== userId && u.username.toLowerCase() === trimmed.toLowerCase());
      if (exists) return { success: false, error: 'Bu kullanıcı adı zaten kullanımda' };
      updated[idx] = { ...updated[idx], username: trimmed };
    }
    if (data.password !== undefined) {
      if (data.password.length < 6) return { success: false, error: 'Şifre en az 6 karakter olmalı' };
      updated[idx] = { ...updated[idx], passwordHash: simpleHash(data.password) };
    }
    if (data.gender !== undefined) updated[idx] = { ...updated[idx], gender: data.gender };
    if (data.displayName !== undefined) updated[idx] = { ...updated[idx], displayName: data.displayName.trim() || undefined };
    if (data.birthDate !== undefined) updated[idx] = { ...updated[idx], birthDate: data.birthDate || undefined };
    await saveUsers(updated);
    if (currentUser?.id === userId) setCurrentUser(updated[idx]);
    return { success: true };
  }, [currentUser]);

  const submitAppId = useCallback(async (userId: string, appId: string) => {
    const trimmed = appId.trim();
    if (!trimmed || !/^\d+$/.test(trimmed)) return { success: false, error: 'Geçerli bir numara girin' };
    const users = await getUsers();
    const duplicate = users.find((u: AppUser) => u.id !== userId && u.appId === trimmed);
    if (duplicate) return { success: false, error: 'Bu ID başka bir kullanıcı tarafından kullanılıyor' };
    const updated = users.map((u: AppUser) => u.id === userId ? { ...u, appId: trimmed, appIdStatus: 'pending' as const, verified: false } : u);
    await saveUsers(updated);
    if (currentUser?.id === userId) setCurrentUser((c: any) => c ? { ...c, appId: trimmed, appIdStatus: 'pending', verified: false } : c);
    return { success: true };
  }, [currentUser]);

  const approveAppId = useCallback(async (userId: string) => {
    const users = await getUsers();
    const updated = users.map((u: AppUser) => u.id === userId ? { ...u, appIdStatus: 'approved' as const, verified: true } : u);
    await saveUsers(updated);
    if (currentUser?.id === userId) setCurrentUser((c: any) => c ? { ...c, appIdStatus: 'approved', verified: true } : c);
  }, [currentUser]);

  const rejectAppId = useCallback(async (userId: string) => {
    const users = await getUsers();
    const updated = users.map((u: AppUser) => u.id === userId ? { ...u, appIdStatus: 'rejected' as const, verified: false } : u);
    await saveUsers(updated);
    if (currentUser?.id === userId) setCurrentUser((c: any) => c ? { ...c, appIdStatus: 'rejected', verified: false } : c);
  }, [currentUser]);

  const role = currentUser?.role ?? 'user';
  const banned = currentUser ? isUserBanned(currentUser) : false;

  return (
    <AuthContext.Provider value={{
      currentUser, allUsers, isLoading,
      register, login, logout, setUserRole,
      banUser, unbanUser, deleteUser,
      grantSpeakPermission, revokeSpeakPermission,
      updateAvatar, removeAvatar,
      updateCover, removeCover,
      updateProfile, updateAvatarFrame,
      submitAppId, approveAppId, rejectAppId,
      isLoggedIn: !!currentUser,
      canWrite: !banned && !!currentUser,
      isBanned: banned,
      isMod: role === 'admin' || role === 'moderator',
      isAdmin: role === 'admin',
      refreshUsers,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}

export default AuthContext;
