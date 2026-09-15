import type { RequisitionDetail } from './requisitions';
import type { StoredProcedureResult } from './assets';
export interface ManagerPendingRequisition { id:number; number:string; requestedDate:string; justification:string; totalEstimatedAmount:number; requestedOrgUnitId:number; requestedByEmployeeId:string; requestedByName:string; status:string; itemCount:number }
export type ManagerRequisitionDetail = RequisitionDetail;
export type ManagerActionResult = StoredProcedureResult;
