import { useEffect, useMemo, useState } from 'react';
import { Eye, RefreshCw, Search, SlidersHorizontal, UserCheck } from 'lucide-react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { procurementOfficerApi } from '../../api/modules/procurementOfficerApi';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingState } from '../../components/common/LoadingState';
import { Toast } from '../../components/common/Toast';
import type { ProcurementOfficerRequisition } from '../../types/procurementOfficer';

export function ProcurementOfficerQueuePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const routeAssignment = location.pathname.endsWith('/pending') ? 'AVAILABLE' : location.pathname.endsWith('/mine') ? 'MINE' : 'ALL';
  const [rows, setRows] = useState<ProcurementOfficerRequisition[]>([]);
  const [query, setQuery] = useState(params.get('q') ?? '');
  const [branch, setBranch] = useState(params.get('branch') ?? 'ALL');
  const [type, setType] = useState(params.get('type') ?? 'ALL');
  const [assignment, setAssignment] = useState(params.get('assignment') ?? routeAssignment);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    procurementOfficerApi.queue().then(items => setRows(items.map(item => ({ ...item, assetNames: item.assetNames ?? 'Requisition items', orgUnitName: item.orgUnitName ?? '—', requestedByEmployeeId: item.requestedByEmployeeId ?? '—', requestedByName: item.requestedByName ?? item.requestedByEmployeeId ?? 'Requester', requisitionTypes: item.requisitionTypes ?? '—' })))).catch(e => setError(e.message)).finally(() => setLoading(false));
  };
  useEffect(load, []);
  useEffect(() => { setAssignment(routeAssignment); }, [routeAssignment]);

  const branches = useMemo(() => [...new Set(rows.map(x => x.orgUnitName))].sort(), [rows]);
  const types = useMemo(() => [...new Set(rows.flatMap(x => x.requisitionTypes.split(', ').filter(Boolean)))].sort(), [rows]);
  const shown = useMemo(() => rows.filter(x => {
    const matchesText = !query || `${x.number} ${x.assetNames} ${x.requestedByName}`.toLowerCase().includes(query.toLowerCase());
    const matchesBranch = branch === 'ALL' || x.orgUnitName === branch;
    const matchesType = type === 'ALL' || x.requisitionTypes.split(', ').includes(type);
    const matchesAssignment = assignment === 'ALL'
      || (assignment === 'AVAILABLE' && !x.assignedToEmployeeId)
      || (assignment === 'MINE' && x.isOwnedByCurrentUser)
      || (assignment === 'OTHERS' && Boolean(x.assignedToEmployeeId) && !x.isOwnedByCurrentUser);
    return matchesText && matchesBranch && matchesType && matchesAssignment;
  }), [rows, query, branch, type, assignment]);

  const search = () => setParams(Object.fromEntries(Object.entries({ q: query, branch, type, assignment }).filter(([, value]) => value && value !== 'ALL')));
  const reset = () => { setQuery(''); setBranch('ALL'); setType('ALL'); setAssignment('ALL'); setParams({}); };
  const take = async (row: ProcurementOfficerRequisition) => {
    setBusy(row.id);
    try { await procurementOfficerApi.take(row.id); navigate(`/procurement-officer/requisitions/${row.id}`); }
    catch (caught) { setError((caught as Error).message); }
    finally { setBusy(null); }
  };

  if (loading) return <LoadingState label="Loading Procurement Officer queue…" />;
  return <div className="po-page po-status-page">
    <div className="po-breadcrumb">Home <span>›</span> Procurement Dashboard <span>›</span> {routeAssignment === 'MINE' ? 'Taken by Me' : routeAssignment === 'AVAILABLE' ? 'Pending My Review' : 'All Requisitions'}</div>
    <header className="po-heading"><div><h1>{routeAssignment === 'MINE' ? 'Taken by Me' : routeAssignment === 'AVAILABLE' ? 'Pending My Review' : 'All Requisitions'}</h1><p>Search mapped requisitions, take responsibility, and complete workflow actions.</p></div></header>
    <section className="po-filter-card">
      <h2><SlidersHorizontal /> Search by Filters</h2>
      <div className="po-filter-grid">
        <label>Branch / Division<select value={branch} onChange={e => setBranch(e.target.value)}><option value="ALL">Select Branch / Division</option>{branches.map(x => <option key={x}>{x}</option>)}</select></label>
        <label>Requisition Type<select value={type} onChange={e => setType(e.target.value)}><option value="ALL">Select Requisition Type</option>{types.map(x => <option key={x}>{x.replaceAll('_', ' ')}</option>)}</select></label>
        <label>Assignment<select value={assignment} onChange={e => setAssignment(e.target.value)}><option value="ALL">All requests</option><option value="AVAILABLE">Available</option><option value="MINE">Taken by me</option><option value="OTHERS">Assigned to others</option></select></label>
        <label>Requisition / Item / Maker<div className="po-search-input"><Search /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search requisition" /></div></label>
        <Button onClick={search}><Search /> Search</Button><Button className="button--secondary" onClick={reset}><RefreshCw /> Reset</Button>
      </div>
    </section>
    <section className="po-card po-queue-card">
      <div className="po-table-summary"><strong>{shown.length} requisition{shown.length === 1 ? '' : 's'}</strong><span>All officers mapped to an asset can see its requests. Taking a request establishes responsibility.</span></div>
      <div className="po-table-wrap"><table className="po-table"><thead><tr><th>Req. ID</th><th>Asset / Item</th><th>Branch / Division</th><th>Req. Type</th><th>Requested By</th><th>Amount (BDT)</th><th>Current Status</th><th>Assignment</th><th>Action</th></tr></thead><tbody>{shown.map(row => <tr key={row.id}>
        <td><Link to={`/procurement-officer/requisitions/${row.id}`}>{row.number}</Link></td>
        <td><strong>{row.assetNames}</strong><small>{row.itemCount} item{row.itemCount === 1 ? '' : 's'}</small></td><td>{row.orgUnitName}</td><td>{row.requisitionTypes.replaceAll('_', ' ')}</td>
        <td><strong>{row.requestedByName}</strong><small>{row.requestedByEmployeeId}</small></td><td>{row.totalEstimatedAmount.toLocaleString()}</td>
        <td><Badge tone="warning">Pending Review</Badge><small>{new Date(row.requestedDate).toLocaleString('en-GB')}</small></td>
        <td>{row.isOwnedByCurrentUser ? <Badge tone="success">Taken by you</Badge> : row.assignedToEmployeeId ? <span className="po-assigned">{row.assignedToEmployeeId}</span> : <Badge>Shared pool</Badge>}</td>
        <td>{!row.assignedToEmployeeId ? <Button disabled={busy === row.id} onClick={() => void take(row)}><UserCheck /> {busy === row.id ? 'Taking…' : 'Take for Review'}</Button> : <Link className="po-icon-action" title={row.isOwnedByCurrentUser ? 'Review requisition' : 'View requisition'} to={`/procurement-officer/requisitions/${row.id}`}><Eye /></Link>}</td>
      </tr>)}</tbody></table>{!shown.length && <div className="po-empty">No requisitions match the selected filters.</div>}</div>
      <footer className="po-table-footer">Showing {shown.length ? 1 : 0} to {shown.length} of {shown.length} entries <span>10 per page</span><nav><button disabled>‹</button><button className="active">1</button><button disabled>›</button></nav></footer>
    </section>
    {error && <Toast tone="error" message={error} onClose={() => setError('')} />}
  </div>;
}
