import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowLeft, BriefcaseBusiness, Building2, CheckCircle2, Eye, FileText, Paperclip, ShieldCheck, ShoppingCart, UserCheck, UserRound, UserRoundCheck, UsersRound, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { concernAuthorityApi } from '../../api/modules/concernAuthorityApi';
import { useAuth } from '../../auth/useAuth';
import { Button } from '../../components/common/Button';
import { LoadingState } from '../../components/common/LoadingState';
import { Toast } from '../../components/common/Toast';
import type { ConcernAuthorityContext, ConcernAuthorityPending } from '../../types/concernAuthority';
import type { RequisitionDetail } from '../../types/requisitions';
import './ConcernAuthorityBulkReviewPage.css';
import './ConcernAuthorityBulkActions.css';

export interface ConcernAuthorityBulkRow { pending: ConcernAuthorityPending; detail: RequisitionDetail; context: ConcernAuthorityContext }
const idsFrom = (state: unknown) => { const ids = (state as { ids?: number[] } | null)?.ids; if (ids?.length) return ids; try { return JSON.parse(sessionStorage.getItem('ca-bulk-selection') ?? '[]') as number[] } catch { return [] } };
const show = (value: string) => value.replaceAll('_', ' ');

export function ConcernAuthorityBulkReviewPage() {
  const location = useLocation(), navigate = useNavigate(), { user } = useAuth();
  const ids = useMemo(() => idsFrom(location.state), [location.state]);
  const [rows, setRows] = useState<ConcernAuthorityBulkRow[]>([]);
  const [remarks, setRemarks] = useState('');
  const [action, setAction] = useState<'approve'|'reject'>('approve');
  const [loading, setLoading] = useState(true), [busy, setBusy] = useState(false), [confirm, setConfirm] = useState(false), [error, setError] = useState('');
  useEffect(() => { concernAuthorityApi.pending().then(async pending => { const chosen = pending.filter(x => ids.includes(x.id)); setRows(await Promise.all(chosen.map(async p => ({ pending: p, detail: await concernAuthorityApi.detail(p.id), context: await concernAuthorityApi.context(p.id) })))); }).catch(e => setError(e.message)).finally(() => setLoading(false)); }, [ids]);
  const total = rows.reduce((sum, x) => sum + x.pending.totalEstimatedAmount, 0);
  const ready = rows.filter(x => x.context.nextDestination === 'READY_FOR_PROCUREMENT');
  const authority = rows.filter(x => x.context.nextDestination === 'PROCUREMENT_AUTHORITY');
  const attachments = rows.reduce((sum, x) => sum + x.detail.attachments.length, 0);
  const execute = async () => { if(action==='reject'&&!remarks.trim()){setError('Remarks are required to reject selected requisitions.');return}setBusy(true); try { const result = action==='reject'?await concernAuthorityApi.bulkReject(rows.map(x => x.pending.id),remarks.trim()):await concernAuthorityApi.bulkApprove(rows.map(x => x.pending.id),null); const payload = { result, rows, remarks, actionAt: new Date().toISOString(),action }; sessionStorage.setItem('ca-bulk-result', JSON.stringify(payload)); sessionStorage.removeItem('ca-bulk-selection'); navigate('/concern-authority/requisitions/bulk-result', { replace: true, state: payload }); } catch (e) { setError((e as Error).message); setConfirm(false); } finally { setBusy(false); } };
  if (loading) return <LoadingState label="Loading bulk approval review…" />;

  return <div className="ca-bulk-review">
    <div className="ca-br-crumb">Home › Concern Division Authority Dashboard › <b>Bulk Approval Review</b></div>
    <header className="ca-br-head"><div><h1>Bulk Approval Review</h1><p>Review the selected requisitions. After approval, each request follows its workflow-defined next destination.</p></div><Link className="button button--secondary" to="/concern-authority/requisitions"><ArrowLeft /> Back to Dashboard</Link><section><small>Selected Requisitions</small><strong>{rows.length}</strong><p>Total Amount (BDT)</p><b>BDT {total.toLocaleString()}</b></section></header>

    <section className="ca-br-context">
      <Fact icon={<Building2 />} label="Division" value={user?.orgUnitName ?? rows[0]?.pending.concernDivisionName ?? 'Concern Division'} />
      <Fact icon={<UsersRound />} label="Authority Pool" value="Division Head & Senior Officials" />
      <Fact icon={<ShieldCheck />} label="Pending for Authority Review" value={String(rows.length)} />
      <Fact icon={<UserRoundCheck />} label="Forwarded by Concern Official" value={rows[0]?.context.concernOfficialName ?? 'Concern Official'} />
      <Fact icon={<FileText />} label="Review Date" value={new Date().toLocaleString('en-GB')} />
    </section>

    <section className="ca-br-table-card">
      <div className="ca-br-section-head"><h2>Selected Requisitions for Bulk Approval ({rows.length})</h2><button onClick={() => navigate('/concern-authority/requisitions')}><X /> Clear Selection</button></div>
      <div className="table-scroll"><table><thead><tr><th></th><th>Req. ID</th><th>Asset / Item</th><th>Req. Type</th><th>Requested By</th><th>Amount (BDT)</th><th>Recommending Official</th><th>Recommendation / Remarks</th><th>Matched Workflow</th><th>Next Destination</th></tr></thead><tbody>{rows.map(x => <tr key={x.pending.id}><td><input type="checkbox" checked readOnly /></td><td><strong>{x.pending.number}</strong></td><td>{x.detail.items.map(i => i.assetName).join(', ')}</td><td>{show(x.detail.items[0]?.requisitionType ?? '—')}</td><td>{x.detail.orgUnitName}<small>{x.pending.requestedByName}</small></td><td>{x.pending.totalEstimatedAmount.toLocaleString()}</td><td>{x.context.concernOfficialName ?? x.context.concernOfficialEmployeeId}<small>{x.context.concernOfficialEmployeeId}</small></td><td><span className="ca-forwarded">Forwarded to Authority</span><small>{x.context.concernOfficialRemarks ?? 'Requirement verified and recommended.'}</small></td><td><b className="ca-rule">{x.context.ruleCode}</b></td><td><span className={`ca-next ${x.context.nextDestination === 'READY_FOR_PROCUREMENT' ? 'ready' : ''}`}>{x.context.nextDestination === 'READY_FOR_PROCUREMENT' ? <CheckCircle2 /> : <ShieldCheck />}{show(x.context.nextDestination)}</span></td></tr>)}</tbody></table></div>
      <footer>Showing 1 to {rows.length} of {rows.length} selected requisitions</footer>
    </section>

    <div className="ca-br-lower">
      <section className="ca-br-routes"><h2>Workflow Route Preview</h2>{authority.length > 0 && <Route title="To Procurement Authority" count={authority.length} destination="Procurement Authority" />}{ready.length > 0 && <Route title="Direct to Ready for Procurement" count={ready.length} destination="Ready for Procurement" />}</section>
      <section className="ca-br-info"><h2>Important Information</h2><p><ShieldCheck /> Every requisition will automatically follow its own matched workflow route.</p><p><FileText /> Different selected requests may proceed to different destinations.</p><p><AlertTriangle /> Review carefully before approving. A completed approval cannot be modified.</p></section>
      <section className="ca-br-attachments"><h2><Paperclip /> Attachments Summary</h2><p>With Attachments <b>{rows.filter(x => x.detail.attachments.length > 0).length}</b></p><p>Without Attachments <b>{rows.filter(x => x.detail.attachments.length === 0).length}</b></p><p>Total Attachments <b>{attachments}</b></p><button disabled={attachments === 0}><Eye /> View All Attachments</button></section>
    </div>

    <section className="ca-br-action"><Link className="button button--secondary" to="/concern-authority/requisitions">Cancel</Link><div><small>You are about to process</small><strong>{rows.length} <span>requisition(s)</span></strong></div><div><small>Total Amount (BDT)</small><strong>{total.toLocaleString()}</strong></div><Button disabled={!rows.length} onClick={() => {setAction('approve');setRemarks('');setConfirm(true)}}><CheckCircle2 /> Approve Selected</Button><Button className="ca-reject-selected" disabled={!rows.length} onClick={() => {setAction('reject');setConfirm(true)}}><X /> Reject Selected</Button></section>
    {confirm && <div className="pa-modal-backdrop"><div className="pa-modal"><button className="pa-modal-close" onClick={() => setConfirm(false)}><X /></button><AlertTriangle /><h2>{action==='reject'?'Reject Selected Requisitions':'Final Confirmation'}</h2><p>{action==='reject'?`Reject ${rows.length} selected requisitions?`:`Approve ${rows.length} requisitions totaling BDT ${total.toLocaleString()}? Each item will be processed independently by the API.`}</p>{action==='reject'&&<label className="ca-reject-remarks">Rejection Remarks *<textarea value={remarks} onChange={e=>setRemarks(e.target.value)} maxLength={2000} placeholder="Enter the reason for rejection"/></label>}<div><Button className="button--secondary" onClick={() => setConfirm(false)}>Cancel</Button><Button className={action==='reject'?'ca-confirm-reject':''} disabled={busy||(action==='reject'&&!remarks.trim())} onClick={() => void execute()}>{busy ? 'Processing…' : action==='reject'?'Confirm Rejection':'Confirm Bulk Approval'}</Button></div></div></div>}
    {error && <Toast tone="error" message={error} onClose={() => setError('')} />}
  </div>;
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <div>{icon}<span><small>{label}</small><b>{value}</b></span></div> }
function Route({ title, count, destination }: { title: string; count: number; destination: string }) { const steps=[{icon:<Building2/>,label:'Branch / Division'},{icon:<UserRound/>,label:'Manager'},{icon:<BriefcaseBusiness/>,label:'Procurement Officer'},{icon:<UserCheck/>,label:'Concern Official'},{icon:destination==='Procurement Authority'?<ShieldCheck/>:<ShoppingCart/>,label:destination}];return <article><header><b>{title}</b><span>{count} requisition(s)</span></header><div className="ca-route-steps">{steps.map((step,index)=><span key={step.label}><i>{step.icon}</i><small>{step.label}</small>{index<steps.length-1&&<b>→</b>}</span>)}</div></article> }
