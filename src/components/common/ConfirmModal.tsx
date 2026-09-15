import { Button } from './Button';
export function ConfirmModal({ open, title, message, onConfirm, onCancel }: { open: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void }) {
  if (!open) return null;
  return <div className="modal-backdrop"><div className="modal" role="dialog" aria-modal="true"><h2>{title}</h2><p>{message}</p><div className="modal__actions"><Button className="button--secondary" onClick={onCancel}>Cancel</Button><Button onClick={onConfirm}>Confirm</Button></div></div></div>;
}
