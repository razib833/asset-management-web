export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return <div className="state"><span className="spinner" aria-hidden="true" /><strong>{label}</strong></div>;
}
