import { useEffect, useState } from 'react';
import { ArrowLeft, CalendarDays, Edit3, FileText, Package } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { requisitionApi } from '../../api/modules/requisitionApi';
import { Badge } from '../../components/common/Badge';
import { LoadingState } from '../../components/common/LoadingState';
import { Toast } from '../../components/common/Toast';
import { AttachmentPreview } from '../../components/maker/AttachmentPreview';
import type { ApiError } from '../../types';
import type { RequisitionDetail } from '../../types/requisitions';

const editable = (status: string) => ['DRAFT', 'MANAGER_RETURNED', 'SUBMITTED'].includes(status);
const errorText = (error: unknown) => { const value = error as ApiError; return [value.message, ...(value.errors ?? [])].filter(Boolean).join(' ') || 'Unable to load requisition.'; };

export function RequisitionDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState<RequisitionDetail | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { requisitionApi.get(Number(id)).then(setData).catch(value => setError(errorText(value))); }, [id]);
  if (!data) return <>{!error && <LoadingState label="Loading requisition…" />}{error && <Toast tone="error" message={error} onClose={() => setError('')} />}</>;
  return <div className="maker-page detail-page">
    <header className="detail-header"><div><Link to="/maker/requisitions"><ArrowLeft /> My Requisitions</Link><h1>{data.number}</h1><p>Submitted {new Date(data.requestedDate).toLocaleString('en-GB')}</p></div><div><Badge tone={data.status.includes('RETURN') ? 'warning' : data.status === 'COMPLETED' ? 'success' : 'info'}>{data.status.replaceAll('_', ' ')}</Badge>{editable(data.status) && <Link className="button" to={`/maker/requisitions/${data.id}/edit`}><Edit3 /> Edit Requisition</Link>}</div></header>
    <section className="detail-summary"><Summary icon={<FileText />} label="Requester" value={data.requestedByEmployeeId} /><Summary icon={<CalendarDays />} label="Organization" value={data.orgUnitName} /><Summary icon={<Package />} label="Items" value={String(data.items.length)} /></section>
    {data.items.map((item, index) => <section className="requisition-card detail-item" key={item.id}><h2>{index + 1}. {item.assetName}</h2><div className="review-grid"><Detail label="Requisition Type" value={item.requisitionType} /><Detail label="Quantity" value={String(item.quantity)} /><Detail label="Purpose / Business Justification" value={item.purposeJustification} /><Detail label="Additional Specification / Requirement" value={item.additionalSpecificationRequirement || '—'} /></div>{item.dynamicSpecifications.length > 0 && <><h2>General Specifications</h2><div className="review-specs">{item.dynamicSpecifications.map(spec => <Detail key={spec.specId} label={spec.name} value={spec.options.length ? spec.options.map(option => option.value).join(', ') : spec.boolValue !== null ? (spec.boolValue ? 'Yes' : 'No') : spec.dateValue ?? spec.numberValue?.toString() ?? spec.textValue ?? '—'} />)}</div></>}{item.replacementInfo && <><h2>Old Asset Details</h2><div className="review-grid three"><Detail label="Asset ID / Tag No." value={item.replacementInfo.assetTag || '—'} /><Detail label="Serial No." value={item.replacementInfo.serial || '—'} /><Detail label="Current Condition / Problem" value={item.replacementInfo.currentCondition} /></div></>}</section>)}
    {data.attachments.length > 0 && <section className="requisition-card"><h2>Attachments</h2>{data.attachments.map(attachment => <AttachmentPreview attachment={attachment} requisitionId={data.id} key={attachment.id} />)}</section>}
  </div>;
}

function Summary({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <div>{icon}<span><small>{label}</small><strong>{value}</strong></span></div>; }
function Detail({ label, value }: { label: string; value: string }) { return <div className="review-detail"><small>{label}</small><strong>{value}</strong></div>; }
