'use client';
import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';

// Admin -- crown icon di atas avatar + ring emas berputar + glow kuat.
export default function CrownEffect() {
  return (
    <>
      <span className="fx-crown-glow" aria-hidden />
      <span className="fx-crown-ring" aria-hidden />
      <motion.span
        className="fx-crown-icon"
        aria-hidden
        initial={{ y: -2 }}
        animate={{ y: [-2, -5, -2] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Crown size={16} fill="currentColor" />
      </motion.span>
    </>
  );
}
