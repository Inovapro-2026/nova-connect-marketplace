import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const text = size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-lg' : 'text-2xl';
  const icon = size === 'lg' ? 'h-8 w-8' : size === 'sm' ? 'h-5 w-5' : 'h-6 w-6';
  return (
    <Link to="/" className="inline-flex items-center gap-2 group">
      <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl gradient-primary glow">
        <Sparkles className={`${icon} text-white`} />
      </span>
      <span className={`${text} font-display font-bold tracking-tight`}>
        Inova<span className="text-gradient">Pro</span>
      </span>
    </Link>
  );
}
