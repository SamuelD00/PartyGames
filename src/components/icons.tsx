import type { CSSProperties } from 'react';

export interface IconProps {
  size?: number;
  className?: string;
  style?: CSSProperties;
}

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function IconClose({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <path d="M5 5l14 14M19 5L5 19" />
    </svg>
  );
}

export function IconPlus({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconMinus({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <path d="M5 12h14" />
    </svg>
  );
}

export function IconPlay({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base} fill="currentColor" stroke="none">
      <path d="M7 4.5v15l13-7.5-13-7.5z" />
    </svg>
  );
}

export function IconPause({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <path d="M8 5v14M16 5v14" />
    </svg>
  );
}

export function IconSparkle({ size = 16, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style} {...base}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18" />
    </svg>
  );
}

export function IconMob({ size = 44, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <path d="M4 16h16" />
      <path d="M6 16c0-6 2.5-11 6-11s6 5 6 11" />
      <path d="M8 10.5h8" />
      <circle cx="9.5" cy="14.5" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="14.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconHalo({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <ellipse cx="11" cy="12" rx="7.3" ry="3" />
      <circle cx="20" cy="6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconSun({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <circle cx="12" cy="12" r="5" fill="currentColor" stroke="none" />
      <path d="M12 1v3M12 20v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M1 12h3M20 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
    </svg>
  );
}

export function IconMoon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="currentColor" stroke="none">
      <path d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a7 7 0 0 0 11 11z" />
    </svg>
  );
}

export function IconCloud({ size = 64, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style} fill="currentColor" stroke="none">
      <path d="M17.5 19H8a6 6 0 1 1 5.9-7h1.6a4.5 4.5 0 1 1 2 8.5Z" />
    </svg>
  );
}

export function IconMimic({ size = 44, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <circle cx="12" cy="4.5" r="2.5" />
      <path d="M12 7v6.5" />
      <path d="M12 9.5L6.5 7" />
      <path d="M12 9.5l5.5-2.5" />
      <path d="M12 13.5l-4.5 6.5" />
      <path d="M12 13.5l4.5 6.5" />
    </svg>
  );
}

export function IconDisguise({ size = 44, className }: IconProps) {
  return (
    <svg width={size} height={size * (26 / 40)} viewBox="0 0 40 26" className={className} {...base}>
      <circle cx="8" cy="14" r="6" />
      <circle cx="32" cy="14" r="6" />
      <path d="M14 14h12" />
      <path d="M2 9Q8 3 14 9" />
      <path d="M26 9Q32 3 38 9" />
      <path d="M9 21Q14.5 25.5 20 21Q25.5 25.5 31 21" />
    </svg>
  );
}
