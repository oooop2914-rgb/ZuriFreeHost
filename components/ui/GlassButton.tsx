'use client';
import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'success' | 'danger';

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md';
  icon?: ReactNode;
  loading?: boolean;
}

const VARIANT_CLASS: Record<Variant, string> = {
  primary: 'sv-btn-primary',
  secondary: '',
  ghost: 'sv-btn-ghost',
  success: 'sv-btn-success',
  danger: 'sv-btn-danger',
};

export default function GlassButton({
  variant = 'secondary', size = 'md', icon, loading, disabled, className, children, ...rest
}: GlassButtonProps) {
  return (
    <button
      className={cn('sv-btn', VARIANT_CLASS[variant], size === 'sm' && 'sv-btn-sm', className)}
      disabled={disabled || loading}
      {...rest}
    >
      {icon}
      {loading ? 'Memproses...' : children}
    </button>
  );
}
