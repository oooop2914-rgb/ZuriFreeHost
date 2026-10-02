'use client';
import { roleMeta, type RoleSlug } from '@/lib/roles';
import AuraEffect from '@/components/effects/AuraEffect';
import GlowEffect from '@/components/effects/GlowEffect';
import SparkleEffect from '@/components/effects/SparkleEffect';
import FlameEffect from '@/components/effects/FlameEffect';
import CrownEffect from '@/components/effects/CrownEffect';

const EFFECT_MAP = { aura: AuraEffect, glow: GlowEffect, sparkle: SparkleEffect, flame: FlameEffect, crown: CrownEffect };

export default function RoleAvatar({
  role, username, imageUrl, size = 44,
}: { role: RoleSlug | string; username: string; imageUrl?: string | null; size?: number }) {
  const meta = roleMeta(role);
  const Effect = EFFECT_MAP[meta.effect];
  const initial = (username || '?').trim().charAt(0).toUpperCase();

  return (
    <span className={`role-avatar-wrap role-${meta.name}`} style={{ width: size, height: size }}>
      <Effect />
      {imageUrl ? (
        <img src={imageUrl} alt={username} width={size} height={size} className="role-avatar-img" style={{ width: size, height: size }} />
      ) : (
        <span className="role-avatar-fallback" style={{ width: size, height: size, fontSize: size * 0.4 }}>{initial}</span>
      )}
    </span>
  );
}
