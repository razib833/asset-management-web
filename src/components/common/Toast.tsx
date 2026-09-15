import { CheckCircle2, CircleAlert, X } from 'lucide-react';
export function Toast({ message, tone, onClose }: { message: string; tone: 'success' | 'error'; onClose: () => void }) {
  return <div className={`toast toast--${tone}`} role="status">{tone === 'success' ? <CheckCircle2 /> : <CircleAlert />}<span>{message}</span><button onClick={onClose} aria-label="Dismiss"><X size={16} /></button></div>;
}
