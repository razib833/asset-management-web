import type { ReactNode } from 'react';
export function Badge({ children, tone = 'info' }: { children: ReactNode; tone?: 'info' | 'success' | 'warning' }) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}
