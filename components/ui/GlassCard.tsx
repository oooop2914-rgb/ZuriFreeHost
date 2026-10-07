import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
  hover?: boolean;
  children: ReactNode;
}

/** Kartu dasar buat halaman server: border+shadow bertingkat, radius 14px (beda dari .card app lain yang 18-20px, sesuai brief "radius beda-beda per konteks"). */
export default function GlassCard({ elevated, hover = true, className, children, ...rest }: GlassCardProps) {
  return (
    <div className={cn('sv-card', elevated && 'sv-card-elevated', hover && 'sv-card-hover', className)} {...rest}>
      {children}
    </div>
  );
}
