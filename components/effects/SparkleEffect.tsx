'use client';
import { motion } from 'framer-motion';

// Content Creator -- ring gradient ungu->pink berputar + partikel kecil
// yang muncul-ngilang di sekeliling avatar.
const PARTICLES = [0, 60, 120, 180, 240, 300];

export default function SparkleEffect() {
  return (
    <>
      <span className="fx-sparkle-ring" aria-hidden />
      {PARTICLES.map((deg, i) => (
        <motion.span
          key={deg}
          aria-hidden
          style={{
            position: 'absolute', width: 4, height: 4, borderRadius: '50%',
            background: '#EC4899', top: '50%', left: '50%',
            transform: `rotate(${deg}deg) translate(22px) rotate(-${deg}deg)`,
          }}
          animate={{ opacity: [0, 1, 0], scale: [0.4, 1, 0.4] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' }}
        />
      ))}
    </>
  );
}
