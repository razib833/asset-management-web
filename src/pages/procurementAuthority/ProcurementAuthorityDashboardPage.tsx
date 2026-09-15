import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock3, Download, Eye, FileCheck2, Filter, Network, RotateCcw, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { procurementAuthorityApi } from '../../api/modules/procurementAuthorityApi';
import { Button } from '../../components/common/Button';
import { LoadingState } from '../../components/common/LoadingState';
import { Toast } from '../../components/common/Toast';
import type { AuthorityContext, AuthorityPending } from '../../types/procurementAuthority';
import type { RequisitionDetail } from '../../types/requisitions';

interface DashboardRow { pending: AuthorityPending; detail: RequisitionDetail; context: AuthorityContext }
const destinationLabel=(value:string)=>value.replaceAll('_',' ');

export function ProcurementAuthorityDashboardPage(){
  const navigate=useNavigate();
  const [rows,setRows]=useState<DashboardRow[]>([]),[selected,setSelected]=useState<number[]>([]),[loading,setLoading]=useState(true),[message,setMessage]=useState('');
  const [query,setQuery]=useState(''),[division,setDivision]=useState('ALL'),[type,setType]=useState('ALL'),[destination,setDestination]=useState('ALL'),[min,setMin]=useState(''),[max,setMax]=useState(''),[page,setPage]=useState(1);
  const load=useCallback(async()=>{setLoading(true);try{const pending=await procurementAuthorityApi.pending();const settled=await Promise.allSettled(pending.map(async p=>({pending:p,detail:await procurementAuthorityApi.detail(p.id),context:await procurementAuthorityApi.context(p.id)})));setRows(settled.filter((x):x is PromiseFulfilledResult<DashboardRow>=>x.status==='fulfilled').map(x=>x.value));if(settled.some(x=>x.status==='rejected'))setMessage('Some requests changed while the shared queue was loading and were omitted.')}catch(e){setMessage((e as Error).message)}finally{setLoading(false)}},[]);
  useEffect(()=>{void load()},[load]);
  const divisions=useMemo(()=>[...new Set(rows.map(x=>x.context.concernDivisionName).filter(Boolean))] as string[],[rows]);
  const types=useMemo(()=>[...new Set(rows.flatMap(x=>x.detail.items.map(i=>i.requisitionType)))],[rows]);
  const filtered=useMemo(()=>rows.filter(x=>{const hay=`${x.pending.number} ${x.pending.requestedByName} ${x.detail.orgUnitName} ${x.detail.items.map(i=>i.assetName).join(' ')}`.toLowerCase();const amount=x.pending.totalEstimatedAmount;return hay.includes(query.toLowerCase())&&(division==='ALL'||x.context.concernDivisionName===division)&&(type==='ALL'||x.detail.items.some(i=>i.requisitionType===type))&&(destination==='ALL'||x.context.nextStepAfterApproval===destination)&&(!min||amount>=Number(min))&&(!max||amount<=Number(max))}),[rows,query,division,type,destination,min,max]);
  const pageSize=10,totalPages=Math.max(1,Math.ceil(filtered.length/pageSize)),shown=filtered.slice((page-1)*pageSize,page*pageSize);
  useEffect(()=>setPage(1),[query,division,type,destination,min,max]);
  const toggle=(id:number)=>setSelected(x=>x.includes(id)?x.filter(v=>v!==id):[...x,id]);
  const reset=()=>{setQuery('');setDivision('ALL');setType('ALL');setDestination('ALL');setMin('');setMax('')};
  const reviewBulk=()=>{if(!selected.length)return;sessionStorage.setItem('pa-bulk-selection',JSON.stringify(selected));navigate('/procurement-authority/requisitions/bulk-review',{state:{ids:selected}})};
  const total=rows.reduce((n,x)=>n+x.pending.totalEstimatedAmount,0),before=rows.filter(x=>x.context.nextStepAfterApproval==='CONCERN_DIVISION'),ready=rows.filter(x=>x.context.nextStepAfterApproval==='READY_FOR_PROCUREMENT'),rules=new Set(rows.map(x=>x.context.workflowRuleId)).size;
  if(loading)return <LoadingState label="Loading Procurement Authority dashboard…"/>;
  return <div className="pa-page pa-dashboard">
    <div className="pa-breadcrumb">Home › Dashboard › Pending My Approval</div>
    <header className="pa-dashboard-head"><div><h1>Procurement Authority Dashboard</h1><p>Review and approve requisitions that require Procurement Authority approval before moving to the next stage.</p></div><Button className="button--secondary" onClick={()=>window.print()}><Download/> Export Report</Button></header>
    <div className="pa-dashboard-metrics">
      <section><FileCheck2/><small>Pending My Approval</small><strong>{rows.length} <em>Requests</em></strong><p>Total Amount<br/><b>BDT {total.toLocaleString()}</b></p></section>
      <section className="amber"><Clock3/><small>Before Concern Division</small><strong>{before.length} <em>Requests</em></strong><p>Total Amount<br/><b>BDT {before.reduce((n,x)=>n+x.pending.totalEstimatedAmount,0).toLocaleString()}</b></p></section>
      <section className="green"><CheckCircle2/><small>Final Approval</small><strong>{ready.length} <em>Requests</em></strong><p>Total Amount<br/><b>BDT {ready.reduce((n,x)=>n+x.pending.totalEstimatedAmount,0).toLocaleString()}</b></p></section>
      <section className="purple"><Network/><small>Matched Workflow Rules</small><strong>{rules} <em>Rules</em></strong><p>Database-configured routes</p></section>
    </div>
    <section className="pa-card pa-dashboard-table">
      <div className="pa-filter-grid"><label>Search<span><Search/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Req. ID, Asset, Branch…"/></span></label><label>Concern Division<select value={division} onChange={e=>setDivision(e.target.value)}><option value="ALL">All</option>{divisions.map(x=><option key={x}>{x}</option>)}</select></label><label>Requisition Type<select value={type} onChange={e=>setType(e.target.value)}><option value="ALL">All</option>{types.map(x=><option key={x}>{x}</option>)}</select></label><label>Amount Range (BDT)<span className="pa-amount"><input type="number" value={min} onChange={e=>setMin(e.target.value)} placeholder="Min"/><i>–</i><input type="number" value={max} onChange={e=>setMax(e.target.value)} placeholder="Max"/></span></label><label>Next Destination<select value={destination} onChange={e=>setDestination(e.target.value)}><option value="ALL">All</option><option value="CONCERN_DIVISION">Concern Division</option><option value="READY_FOR_PROCUREMENT">Ready for Procurement</option></select></label><Button className="button--secondary"><Filter/> Filters</Button><Button className="button--secondary" onClick={reset}><RotateCcw/> Reset</Button></div>
      <div className="pa-bulk-toolbar"><b>{selected.length} selected</b><button onClick={()=>setSelected([])}>Clear Selection</button><Button disabled={!selected.length} onClick={reviewBulk}><CheckCircle2/> Approve Selected</Button><span>Select multiple requests and review them before bulk approval.</span></div>
      <div className="po-table-wrap"><table className="po-table"><thead><tr><th><input type="checkbox" checked={shown.length>0&&shown.every(x=>selected.includes(x.pending.id))} onChange={e=>setSelected(e.target.checked?[...new Set([...selected,...shown.map(x=>x.pending.id)])]:selected.filter(id=>!shown.some(x=>x.pending.id===id)))}/></th><th>Req. ID</th><th>Requisition Type</th><th>Asset / Item</th><th>Concern Division</th><th>Requested By (Branch/Dept.)</th><th>Amount (BDT)</th><th>Requested On</th><th>Matched Workflow Route</th><th>Actions</th></tr></thead><tbody>{shown.map(x=><tr key={x.pending.id}><td><input type="checkbox" checked={selected.includes(x.pending.id)} onChange={()=>toggle(x.pending.id)}/></td><td><strong>{x.pending.number}</strong></td><td>{[...new Set(x.detail.items.map(i=>i.requisitionType))].join(', ')}</td><td>{x.detail.items.map(i=>i.assetName).join(', ')}</td><td>{x.context.concernDivisionName??'—'}</td><td>{x.detail.orgUnitName}<small className="pa-rule-name">{x.pending.requestedByName}</small></td><td>{x.pending.totalEstimatedAmount.toLocaleString()}</td><td>{new Date(x.pending.requestedDate).toLocaleDateString('en-GB')}</td><td><span className="pa-tag purple">{x.context.ruleCode}</span> <span className={`pa-tag ${x.context.nextStepAfterApproval==='READY_FOR_PROCUREMENT'?'green':'amber'}`}>{destinationLabel(x.context.nextStepAfterApproval)}</span></td><td><Link className="button button--secondary" to={`/procurement-authority/requisitions/${x.pending.id}`} aria-label={`Review ${x.pending.number}`}><Eye/></Link></td></tr>)}</tbody></table>{!shown.length&&<div className="po-empty">No requests match the selected filters.</div>}</div>
      <div className="pa-pagination"><span>Showing {filtered.length?((page-1)*pageSize)+1:0} to {Math.min(page*pageSize,filtered.length)} of {filtered.length} entries</span><div><Button className="button--secondary" disabled={page===1} onClick={()=>setPage(x=>x-1)}>‹</Button>{Array.from({length:totalPages},(_,i)=><Button key={i} className={page===i+1?'':'button--secondary'} onClick={()=>setPage(i+1)}>{i+1}</Button>)}<Button className="button--secondary" disabled={page===totalPages} onClick={()=>setPage(x=>x+1)}>›</Button></div></div>
    </section>
    <section className="pa-dashboard-note"><b>Note:</b><span>After approval, each request proceeds to the next step returned by the workflow engine.<br/>PA = Procurement Authority &nbsp; CD = Concern Division</span></section>
    {message&&<Toast tone="error" message={message} onClose={()=>setMessage('')}/>}</div>;
}
