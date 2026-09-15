import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, Clock3, Eye, FileCheck2, FileText, Filter, RotateCcw, Search, ShieldCheck, UsersRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { concernAuthorityApi } from '../../api/modules/concernAuthorityApi';
import { LoadingState } from '../../components/common/LoadingState';
import { Toast } from '../../components/common/Toast';
import type { ConcernAuthorityContext, ConcernAuthorityPending } from '../../types/concernAuthority';
import type { RequisitionDetail } from '../../types/requisitions';
import './ConcernAuthorityDashboardPage.css';

type DashboardRow = ConcernAuthorityPending & { detail?: RequisitionDetail; context?: ConcernAuthorityContext };
const show = (value?: string | null) => value?.replaceAll('_', ' ') ?? '—';

export function ConcernAuthorityDashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardRow[]>([]);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('ALL');
  const [route, setRoute] = useState('ALL');
  const [selected, setSelected] = useState<number[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    concernAuthorityApi.pending().then(async pending => {
      const rows = await Promise.all(pending.map(async item => {
        const [detail, context] = await Promise.all([
          concernAuthorityApi.detail(item.id).catch(() => undefined),
          concernAuthorityApi.context(item.id).catch(() => undefined),
        ]);
        return { ...item, detail, context };
      }));
      setData(rows);
    }).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  const types = useMemo(() => [...new Set(data.flatMap(x => x.detail?.items.map(i => i.requisitionType) ?? []))], [data]);
  const routes = useMemo(() => [...new Set(data.map(x => x.context?.nextDestination).filter(Boolean) as string[])], [data]);
  const shown = useMemo(() => data.filter(x => {
    const assets = x.detail?.items.map(i => i.assetName).join(' ') ?? '';
    const reqTypes = x.detail?.items.map(i => i.requisitionType) ?? [];
    return `${x.number} ${x.requestedByName} ${x.concernDivisionName} ${assets}`.toLowerCase().includes(query.toLowerCase())
      && (type === 'ALL' || reqTypes.some(value => value === type))
      && (route === 'ALL' || x.context?.nextDestination === route);
  }), [data, query, type, route]);
  const total = data.reduce((sum, x) => sum + x.totalEstimatedAmount, 0);
  const selectedTotal = data.filter(x => selected.includes(x.id)).reduce((sum, x) => sum + x.totalEstimatedAmount, 0);
  const allShownSelected = shown.length > 0 && shown.every(x => selected.includes(x.id));
  const toggleAll = () => setSelected(allShownSelected ? selected.filter(id => !shown.some(x => x.id === id)) : [...new Set([...selected, ...shown.map(x => x.id)])]);
  const reviewSelected = () => {
    if (!selected.length) return;
    sessionStorage.setItem('ca-bulk-selection', JSON.stringify(selected));
    navigate('/concern-authority/requisitions/bulk-review', { state: { ids: selected } });
  };
  if (loading) return <LoadingState label="Loading Division Authority dashboard…" />;

  return <div className="cd-page ca-dashboard">
    <div className="cd-crumb">Home › Concern Division Authority Dashboard</div>
    <header className="ca-dashboard-head"><div><h1>Concern Division Authority Dashboard</h1><p>Review requisitions forwarded by Concern Division Officials for your approval.</p></div><button className="ca-export"><FileCheck2 /> Export Dashboard</button></header>
    <div className="ca-metrics">
      <Metric tone="blue" icon={<FileText />} title="Pending My Review" count={data.length} amount={total} />
      <Metric tone="orange" icon={<ShieldCheck />} title="Approved by Me" count="—" />
      <Metric tone="purple" icon={<RotateCcw />} title="Returned to Official" count="—" />
      <Metric tone="green" icon={<CheckCircle2 />} title="Completed" count="—" />
    </div>
    <section className="cd-card ca-filter-panel">
      <label><span>Search</span><div><Search /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by Req. ID, asset, requester…" /></div></label>
      <label><span>Requisition Type</span><select value={type} onChange={e => setType(e.target.value)}><option value="ALL">All</option>{types.map(x => <option key={x}>{x}</option>)}</select></label>
      <label><span>Workflow Route</span><select value={route} onChange={e => setRoute(e.target.value)}><option value="ALL">All</option>{routes.map(x => <option key={x} value={x}>{show(x)}</option>)}</select></label>
      <label><span>SLA Status</span><select disabled><option>All</option></select></label>
      <button className="ca-filter-button"><Filter /> Filters</button><button className="ca-reset" onClick={() => { setQuery(''); setType('ALL'); setRoute('ALL'); }}><RotateCcw /> Reset</button>
    </section>
    <div className="ca-dashboard-grid">
      <section className="cd-card ca-table-card">
        <div className="ca-table-title"><div><h2>Pending My Review <span>{data.length}</span></h2><p>Requests explicitly forwarded by Concern Division Officials.</p></div><div className="ca-table-actions"><label><input type="checkbox" checked={allShownSelected} onChange={toggleAll} /> Select All ({shown.length})</label><b>{selected.length} selected</b><button disabled={!selected.length} onClick={reviewSelected}>Approve Selected</button></div></div>
        <div className="table-scroll"><table className="data-table ca-data-table"><thead><tr><th></th><th>Req. ID</th><th>Asset / Item</th><th>Req. Type</th><th>Requested By</th><th>Amount (BDT)</th><th>Concern Official</th><th>Matched Route</th><th>Next Destination</th><th>Action</th></tr></thead><tbody>{shown.map(x => <tr key={x.id}>
          <td><input type="checkbox" checked={selected.includes(x.id)} onChange={() => setSelected(s => s.includes(x.id) ? s.filter(id => id !== x.id) : [...s, x.id])} /></td><td><strong>{x.number}</strong></td><td>{x.detail?.items.map(i => i.assetName).join(', ') ?? `${x.itemCount} item(s)`}</td><td>{show(x.detail?.items[0]?.requisitionType)}</td><td>{x.requestedByName}<small>{x.detail?.orgUnitName}</small></td><td>{x.totalEstimatedAmount.toLocaleString()}</td><td>{x.context?.concernOfficialName ?? x.context?.concernOfficialEmployeeId ?? 'Concern Official'}</td><td><span className="ca-route">{x.context?.ruleCode ?? '—'}</span></td><td><span className={`ca-destination ${x.context?.nextDestination === 'READY_FOR_PROCUREMENT' ? 'ready' : ''}`}>{show(x.context?.nextDestination)}</span></td><td><Link className="cd-view" aria-label={`Review ${x.number}`} to={`/concern-authority/requisitions/${x.id}`}><Eye /></Link></td>
        </tr>)}</tbody></table>{!shown.length && <p className="cd-empty">No requests match the selected filters.</p>}</div>
        <footer className="ca-table-footer"><span>Showing {shown.length ? 1 : 0} to {shown.length} of {shown.length} entries</span><div><button disabled><ChevronLeft /></button><b>1</b><button disabled><ChevronRight /></button></div></footer>
      </section>
      <aside className="ca-dashboard-side"><section className="cd-card ca-sla"><h2>SLA Overview</h2><div className="ca-donut"><span>{data.length}</span></div><ul><li><i className="on-track" /> On Track <b>{data.length}</b></li><li><i className="due" /> Due Today <b>—</b></li><li><i className="overdue" /> Overdue <b>—</b></li></ul></section><section className="cd-card ca-activity"><h2>Authority Pool</h2><p><UsersRound /> All mapped division authorities can review these requests.</p><p><Clock3 /> The first completed action removes the item from the shared queue.</p></section></aside>
    </div>
    {selected.length > 0 && <section className="ca-selection-bar"><div><strong>{selected.length} requisition{selected.length > 1 ? 's' : ''} selected</strong><span>Total Amount (BDT): {selectedTotal.toLocaleString()}</span></div><button onClick={reviewSelected}><CheckCircle2 /> Approve Selected</button><button className="clear" onClick={() => setSelected([])}>Clear Selection</button></section>}
    <aside className="cd-note"><b>Note:</b> Each approved requisition follows the next destination returned by its matched workflow rule.</aside>
    {error && <Toast tone="error" message={error} onClose={() => setError('')} />}
  </div>;
}

function Metric({ icon, title, count, amount, tone }: { icon: React.ReactNode; title: string; count: number | string; amount?: number; tone: string }) {
  return <section className={tone}><div><small>{title}</small><strong>{count}</strong>{amount === undefined ? <p>Historical total unavailable</p> : <p>Total Amount (BDT)<b>{amount.toLocaleString()}</b></p>}</div><span>{icon}</span></section>;
}
