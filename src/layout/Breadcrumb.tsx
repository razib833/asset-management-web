import { ChevronRight } from 'lucide-react';
export function Breadcrumb({ items }: { items: string[] }) { return <div className="breadcrumb">{items.map((item, index) => <span key={item}>{index > 0 && <ChevronRight size={14} />}{item}</span>)}</div>; }
