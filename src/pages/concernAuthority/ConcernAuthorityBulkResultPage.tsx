import { useState } from 'react';
import { AlertCircle, ArrowLeft, CheckCircle2, Download, Info, ShieldCheck, XCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import { Button } from '../../components/common/Button';
import type { ConcernAuthorityBulkItemResult, ConcernAuthorityBulkResult } from '../../types/concernAuthority';
import type { ConcernAuthorityBulkRow } from './ConcernAuthorityBulkReviewPage';
import './ConcernAuthorityBulkResultPage.css';

interface Payload { result: ConcernAuthorityBulkResult; rows: ConcernAuthorityBulkRow[]; remarks: string; actionAt: string }
type Tab = 'all' | 'success' | 'partial' | 'failed';
const read = (state: unknown): Payload | null => { if (state) return state as Payload; try { return JSON.parse(sessionStorage.getItem('ca-bulk-result') ?? 'null') as Payload | null } catch { return null } };
const kind = (result: ConcernAuthorityBulkItemResult) => result.resultCode === '000' ? 'success' : result.resultCode === '206' || result.resultCode.toUpperCase().includes('PARTIAL') ? 'partial' : 'failed';
const show = (value?: string | null) => value?.replaceAll('_', ' ') ?? 'Not advanced';

export function ConcernAuthorityBulkResultPage() {
  const navigate = useNavigate(), { user } = useAuth(), payload = read(useLocation().state), [tab, setTab] = useState<Tab>('all');
  const result = payload?.result;
  const rows = payload?.rows ?? [];
  const row = (id: number) => rows.find(x => x.pending.id === id);
  const totals = (() => {
    const sum = (items: ConcernAuthorityBulkItemResult[]) => items.reduce((n, x) => n + (row(x.requisitionId)?.pending.totalEstimatedAmount ?? 0), 0);
    const all = result?.results ?? [], success = all.filter(x => kind(x) === 'success'), partial = all.filter(x => kind(x) === 'partial'), failed = all.filter(x => kind(x) === 'failed');
    return { all, success, partial, failed, allAmount: sum(all), successAmount: sum(success), partialAmount: sum(partial), failedAmount: sum(failed) };
  })();
  if (!payload || !result) return <div className="ca-result-empty"><h1>No bulk result available</h1><p>Return to the dashboard and submit a bulk approval first.</p><Button onClick={() => navigate('/concern-authority/requisitions')}>Back to Dashboard</Button></div>;
  const visible = tab === 'all' ? totals.all : totals[tab];
  const overall = totals.failed.length === 0 && totals.partial.length === 0 ? 'Successful' : totals.success.length === 0 ? 'Failed' : 'Partial Success';
  const exportResult = () => {
    const lines = [['Requisition ID','Asset','Requesting Unit','Amount','Matched Workflow','Next Destination','Result','Message'], ...result.results.map(x => { const r = row(x.requisitionId); return [x.requisitionNo ?? r?.pending.number ?? String(x.requisitionId), r?.detail.items.map(i => i.assetName).join(', ') ?? '', r?.detail.orgUnitName ?? '', String(r?.pending.totalEstimatedAmount ?? ''), r?.context.ruleCode ?? '', x.nextDestination ?? '', kind(x), x.resultMessage]; })];
    const csv = lines.map(line => line.map(value => `"${String(value).replaceAll('"','""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); const a = document.createElement('a'); a.href = url; a.download = `concern-authority-${result.batchReferenceId}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  return <div className="ca-result-page">
    <div className="ca-result-crumb">Home › Concern Division Authority Dashboard › Bulk Approval Result</div>
    <header className="ca-result-head"><div><h1>Concern Division Authority Approval Result</h1><p>Results of the bulk approval performed on {new Date(payload.actionAt).toLocaleString('en-GB')}.</p></div><Button className="button--secondary" onClick={() => navigate('/concern-authority/requisitions')}><ArrowLeft /> Back to Dashboard</Button></header>
    <section className={`ca-result-banner ${overall === 'Failed' ? 'failed' : overall === 'Partial Success' ? 'partial' : ''}`}>
      <div className="ca-result-intro"><span>{overall === 'Failed' ? <XCircle /> : <CheckCircle2 />}</span><div><h2>{overall === 'Successful' ? 'Bulk Approval Completed' : overall}</h2><p>The bulk action was processed. The per-requisition summary is shown below.</p><small>Batch Reference: {result.batchReferenceId}</small></div></div>
      <Summary label="Total Selected" count={result.totalSelected} amount={totals.allAmount} />
      <Summary tone="success" label="Successful" count={totals.success.length} amount={totals.successAmount} />
      <Summary tone="partial" label="Partial Success" count={totals.partial.length} amount={totals.partialAmount} />
      <Summary tone="failed" label="Failed" count={totals.failed.length} amount={totals.failedAmount} />
      <div className="ca-result-actor"><small>Action By</small><b>{user?.fullName ?? 'Division Authority'}</b><span>{user?.designation}</span><b>{new Date(payload.actionAt).toLocaleString('en-GB')}</b></div>
    </section>
    <nav className="ca-result-tabs"><button className={tab === 'all' ? 'active' : ''} onClick={() => setTab('all')}>All Results ({totals.all.length})</button><button className={tab === 'success' ? 'active' : ''} onClick={() => setTab('success')}>Successful ({totals.success.length})</button><button className={tab === 'partial' ? 'active' : ''} onClick={() => setTab('partial')}>Partial Success ({totals.partial.length})</button><button className={tab === 'failed' ? 'active' : ''} onClick={() => setTab('failed')}>Failed ({totals.failed.length})</button><button className="export" onClick={exportResult}><Download /> Export Result</button></nav>
    <section className="ca-result-table"><div className="table-scroll"><table><thead><tr><th>#</th><th>Req. ID</th><th>Asset / Item</th><th>Req. Type</th><th>Requested By</th><th>Amount (BDT)</th><th>Matched Workflow</th><th>Next Destination</th><th>Result</th><th>Remarks / Error</th></tr></thead><tbody>{visible.map((x, index) => { const r = row(x.requisitionId), state = kind(x); return <tr key={x.requisitionId}><td>{index + 1}</td><td><strong>{x.requisitionNo ?? r?.pending.number ?? x.requisitionId}</strong></td><td>{r?.detail.items.map(i => i.assetName).join(', ') ?? '—'}</td><td>{show(r?.detail.items[0]?.requisitionType)}</td><td>{r?.detail.orgUnitName ?? '—'}<small>{r?.pending.requestedByName}</small></td><td>{r?.pending.totalEstimatedAmount.toLocaleString() ?? '—'}</td><td><b className="ca-result-rule">{r?.context.ruleCode ?? '—'}</b></td><td><span className={`ca-result-destination ${x.nextDestination === 'READY_FOR_PROCUREMENT' ? 'ready' : ''}`}>{x.nextDestination === 'PROCUREMENT_AUTHORITY' ? <ShieldCheck /> : <CheckCircle2 />}{show(x.nextDestination)}</span></td><td><span className={`ca-result-status ${state}`}>{state === 'success' ? <CheckCircle2 /> : state === 'partial' ? <AlertCircle /> : <XCircle />}{state === 'success' ? 'Successful' : state === 'partial' ? 'Partial Success' : 'Failed'}</span></td><td className={state !== 'success' ? 'error' : ''}>{x.resultMessage}</td></tr> })}</tbody></table>{visible.length === 0 && <p className="ca-result-none">No results in this category.</p>}</div></section>
    {(totals.partial.length > 0 || totals.failed.length > 0) && <section className="ca-result-errors"><h2><AlertCircle /> Processing Details ({totals.partial.length + totals.failed.length})</h2><table><thead><tr><th>Req. ID</th><th>Result</th><th>Error Detail</th><th>Action Required</th></tr></thead><tbody>{[...totals.partial, ...totals.failed].map(x => <tr key={x.requisitionId}><td>{x.requisitionNo ?? x.requisitionId}</td><td>{kind(x) === 'partial' ? 'Partial Success' : 'Failed'}</td><td>{x.resultMessage}</td><td>Review the workflow configuration or retry the individual request.</td></tr>)}</tbody></table></section>}
    <footer className="ca-result-footer"><p><Info /> You can view the updated status of these requisitions in the respective dashboards.</p><Button className="button--secondary" onClick={() => navigate('/concern-authority/requisitions')}>Go to Dashboard</Button></footer>
  </div>;
}

function Summary({ label, count, amount, tone = '' }: { label: string; count: number; amount: number; tone?: string }) { return <div className={`ca-result-summary ${tone}`}><small>{label}</small><strong>{count}</strong><span>Total Amount (BDT)</span><b>{amount.toLocaleString()}</b></div> }
