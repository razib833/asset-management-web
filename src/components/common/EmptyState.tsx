import { Inbox } from 'lucide-react';
export function EmptyState({ title = 'Nothing here yet', message = 'Records will appear here when they become available.' }) {
  return <div className="state"><Inbox size={30} /><strong>{title}</strong><span>{message}</span></div>;
}
