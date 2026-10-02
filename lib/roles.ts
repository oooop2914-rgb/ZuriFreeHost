// Cermin dari tabel `roles` di database (migration role_system).
// Dipakai di frontend biar render badge/avatar/nama role langsung
// tanpa nunggu fetch API. Kalau admin ubah warna/effect lewat DB
// nanti (Config Panel, Tahap 5), update juga angka di sini biar sinkron.
import type { LucideIcon } from 'lucide-react';
import { User, BadgeCheck, Sparkles, Flame, Crown } from 'lucide-react';

export type RoleSlug = 'user' | 'verified' | 'creator' | 'mods' | 'admin';
export type EffectType = 'aura' | 'glow' | 'sparkle' | 'flame' | 'crown';

export interface RoleMeta {
  name: RoleSlug;
  displayName: string;
  level: number;
  color: string;
  hex: string;
  effect: EffectType;
  icon: LucideIcon;
  canApply: boolean;
}

export const ROLES: Record<RoleSlug, RoleMeta> = {
  user:     { name: 'user',     displayName: 'User',            level: 10, color: 'Cyan',  hex: '#06B6D4', effect: 'aura',    icon: User,       canApply: false },
  verified: { name: 'verified', displayName: 'Verified',        level: 15, color: 'Biru',  hex: '#3B82F6', effect: 'glow',    icon: BadgeCheck, canApply: true },
  creator:  { name: 'creator',  displayName: 'Content Creator', level: 30, color: 'Ungu',  hex: '#A855F7', effect: 'sparkle', icon: Sparkles,   canApply: true },
  mods:     { name: 'mods',     displayName: 'Moderator',       level: 60, color: 'Merah', hex: '#EF4444', effect: 'flame',   icon: Flame,      canApply: false },
  admin:    { name: 'admin',    displayName: 'Admin',           level: 80, color: 'Emas',  hex: '#FBBF24', effect: 'crown',   icon: Crown,      canApply: false },
};

export function roleMeta(slug: string | null | undefined): RoleMeta {
  return ROLES[(slug as RoleSlug)] || ROLES.user;
}
